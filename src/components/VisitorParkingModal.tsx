import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, Clock, X, Plus, MapPin, CheckCircle, XCircle, AlertCircle, ChevronRight } from "lucide-react";
import { useToast } from "./Toast";
import {
  getMyVisitorParkings,
  getAvailableVisitorGarages,
  createVisitorParking,
  cancelVisitorParking,
  type VisitorParking,
  type AvailableVisitorGarage,
} from "../api_calls/visitorParking";

interface Props {
  isOpen:  boolean;
  onClose: () => void;
  token:   string;
}



function toLocalInputValue(date: Date): string {

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("es-AR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function diffHours(start: string, end: string): number {
  return (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60);
}

function statusBadge(status: VisitorParking["status"]) {
  switch (status) {
    case "activa":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          <CheckCircle className="w-3 h-3" /> Activa
        </span>
      );
    case "cancelada":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">
          <XCircle className="w-3 h-3" /> Cancelada
        </span>
      );
    case "vencida":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
          <Clock className="w-3 h-3" /> Vencida
        </span>
      );
  }
}

const MAX_HOURS = 48;

// ─── component ───────────────────────────────────────────────────────────────

export default function VisitorParkingModal({ isOpen, onClose, token }: Props) {
  const { showToast } = useToast();

  const [reservations,    setReservations]    = useState<VisitorParking[]>([]);
  const [loading,         setLoading]         = useState(false);
  const [showForm,        setShowForm]        = useState(false);
  const [processing,      setProcessing]      = useState(false);
  const [cancellingId,    setCancellingId]    = useState<number | null>(null);

  // form state
  const [startTime,       setStartTime]       = useState("");
  const [endTime,         setEndTime]         = useState("");
  const [licensePlate,    setLicensePlate]    = useState("");
  const [visitorName,     setVisitorName]     = useState("");
  const [selectedGarageId, setSelectedGarageId] = useState<string>("");
  const [availableGarages, setAvailableGarages] = useState<AvailableVisitorGarage[]>([]);
  const [loadingGarages,   setLoadingGarages]   = useState(false);
  const [garageLoadedFor,  setGarageLoadedFor]  = useState<{ start: string; end: string } | null>(null);


  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyVisitorParkings(token);
      setReservations(data);
    } catch {
      showToast("Error al cargar las reservas de cochera visitante", "error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isOpen && token) {
      load();
      resetForm();
    }
  }, [isOpen, token]);


  const resetForm = () => {
    const now   = new Date();
    now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);
    const later = new Date(now.getTime() + 3 * 60 * 60 * 1000); // +3h default
    setStartTime(toLocalInputValue(now));
    setEndTime(toLocalInputValue(later));
    setLicensePlate("");
    setVisitorName("");
    setSelectedGarageId("");
    setAvailableGarages([]);
    setGarageLoadedFor(null);
  };

  const handleStartChange = (val: string) => {
    setStartTime(val);
    setSelectedGarageId("");
    setAvailableGarages([]);
    setGarageLoadedFor(null);
    // auto-adjust end if needed
    if (val && endTime) {
      const s = new Date(val);
      const e = new Date(endTime);
      if (e <= s) {
        const newEnd = new Date(s.getTime() + 3 * 60 * 60 * 1000);
        setEndTime(toLocalInputValue(newEnd));
      }
      const h = (new Date(endTime).getTime() - s.getTime()) / (1000 * 60 * 60);
      if (h > MAX_HOURS) {
        const capped = new Date(s.getTime() + MAX_HOURS * 60 * 60 * 1000);
        setEndTime(toLocalInputValue(capped));
      }
    }
  };

  const handleEndChange = (val: string) => {
    setEndTime(val);
    setSelectedGarageId("");
    setAvailableGarages([]);
    setGarageLoadedFor(null);
  };

  const canSearchGarages = startTime && endTime &&
    new Date(endTime) > new Date(startTime) &&
    diffHours(startTime, endTime) <= MAX_HOURS;

  const handleSearchGarages = async () => {
    if (!canSearchGarages) return;
    setLoadingGarages(true);
    setSelectedGarageId("");
    try {
      const garages = await getAvailableVisitorGarages(
        token,
        new Date(startTime).toISOString(),
        new Date(endTime).toISOString()
      );
      setAvailableGarages(garages);
      setGarageLoadedFor({ start: startTime, end: endTime });
      if (garages.length === 1) setSelectedGarageId(String(garages[0].id));
    } catch (e: any) {
      showToast(e.message || "Error al buscar cocheras", "error");
    } finally {
      setLoadingGarages(false);
    }
  };

  const timesChangedSinceSearch =
    garageLoadedFor !== null &&
    (garageLoadedFor.start !== startTime || garageLoadedFor.end !== endTime);

  const endMinValue = startTime
    ? toLocalInputValue(new Date(new Date(startTime).getTime() + 30 * 60 * 1000))
    : "";
  const endMaxValue = startTime
    ? toLocalInputValue(new Date(new Date(startTime).getTime() + MAX_HOURS * 60 * 60 * 1000))
    : "";

  const hoursSelected = startTime && endTime
    ? Math.round(diffHours(startTime, endTime) * 10) / 10
    : null;

  // ── submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGarageId || !licensePlate.trim()) {
      showToast("Completá la patente y seleccioná una cochera", "error");
      return;
    }
    if (timesChangedSinceSearch) {
      showToast("Los horarios cambiaron. Buscá cocheras disponibles nuevamente.", "error");
      return;
    }

    setProcessing(true);
    try {
      await createVisitorParking(token, {
        garageId:    Number(selectedGarageId),
        licensePlate,
        visitorName: visitorName.trim() || undefined,
        startTime:   new Date(startTime).toISOString(),
        endTime:     new Date(endTime).toISOString(),
      });
      showToast("Reserva de cochera visitante creada", "success");
      setShowForm(false);
      load();
    } catch (e: any) {
      showToast(e.message || "Error al crear la reserva", "error");
    } finally {
      setProcessing(false);
    }
  };

  // ── cancel ─────────────────────────────────────────────────────────────────
  const handleCancel = async (id: number) => {
    setCancellingId(id);
    try {
      await cancelVisitorParking(token, id);
      showToast("Reserva cancelada", "success");
      load();
    } catch (e: any) {
      showToast(e.message || "Error al cancelar", "error");
    } finally {
      setCancellingId(null);
    }
  };

  // ── computed ───────────────────────────────────────────────────────────────
  const activeReservations = reservations.filter(r => r.status === "activa");
  const pastReservations   = reservations.filter(r => r.status !== "activa");

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1,    y: 0  }}
          exit={{ scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
        >
          {/* ── Header ────────────────────────────────────────────────────── */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Cochera Visitante</h2>
                <p className="text-amber-100 text-xs">Máximo {MAX_HOURS}h · Un turno activo por departamento</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
                Cargando…
              </div>
            ) : (
              <>
                {/* ── Active reservations ─────────────────────────────────── */}
                {activeReservations.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Reservas activas de tu departamento
                    </p>
                    {activeReservations.map(r => (
                      <div
                        key={r.id}
                        className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0" />
                              <span className="font-bold text-gray-800">{r.garage.number}</span>
                              {r.garage.location && (
                                <span className="text-gray-500 text-sm">· {r.garage.location}</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-700 font-mono font-semibold">
                              {r.licensePlate}
                            </div>
                            {r.visitorName && (
                              <div className="text-sm text-gray-500">Visitante: {r.visitorName}</div>
                            )}
                          </div>
                          {statusBadge(r.status)}
                        </div>
                        <div className="text-xs text-gray-500 space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Desde: {formatDate(r.startTime)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Hasta: {formatDate(r.endTime)}</span>
                          </div>
                          <div className="text-amber-600 font-medium">
                            Duración: {Math.round(diffHours(r.startTime, r.endTime) * 10) / 10}h
                          </div>
                        </div>
                        <button
                          onClick={() => handleCancel(r.id)}
                          disabled={cancellingId === r.id}
                          className="w-full py-2 rounded-xl bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                        >
                          {cancellingId === r.id ? "Cancelando…" : "Cancelar reserva"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── New reservation button / form ────────────────────────── */}
                {!showForm ? (
                  <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-amber-300 text-amber-600 font-medium text-sm hover:bg-amber-50 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Nueva reserva de cochera visitante
                  </button>
                ) : (
                  <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl border border-gray-200 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-700">Nueva reserva</p>
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Time range */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Desde</label>
                        <input
                          type="datetime-local"
                          value={startTime}
                          min={toLocalInputValue(new Date())}
                          onChange={e => handleStartChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 cursor-pointer"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Hasta
                          {hoursSelected !== null && (
                            <span className={`ml-1 ${hoursSelected > MAX_HOURS ? "text-red-500" : "text-amber-500"}`}>
                              ({hoursSelected}h)
                            </span>
                          )}
                        </label>
                        <input
                          type="datetime-local"
                          value={endTime}
                          min={endMinValue}
                          max={endMaxValue}
                          onChange={e => handleEndChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 cursor-pointer"
                          required
                        />
                      </div>
                    </div>

                    {hoursSelected !== null && hoursSelected > MAX_HOURS && (
                      <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        La duración máxima es de {MAX_HOURS} horas.
                      </div>
                    )}

                    {/* Search garages button */}
                    <button
                      type="button"
                      onClick={handleSearchGarages}
                      disabled={!canSearchGarages || loadingGarages || (!!hoursSelected && hoursSelected > MAX_HOURS)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-100 text-amber-700 text-sm font-medium hover:bg-amber-200 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {loadingGarages ? "Buscando…" : (
                        <>
                          <ChevronRight className="w-4 h-4" />
                          {timesChangedSinceSearch ? "Actualizar cocheras disponibles" : "Ver cocheras disponibles"}
                        </>
                      )}
                    </button>

                    {/* Garage selector */}
                    {garageLoadedFor && !timesChangedSinceSearch && (
                      availableGarages.length === 0 ? (
                        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 rounded-xl px-3 py-2.5">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                          No hay cocheras visitante disponibles para ese horario.
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Cochera ({availableGarages.length} disponible{availableGarages.length !== 1 ? "s" : ""})
                          </label>
                          <select
                            value={selectedGarageId}
                            onChange={e => setSelectedGarageId(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 cursor-pointer"
                          >
                            <option value="">Seleccioná una cochera…</option>
                            {availableGarages.map(g => (
                              <option key={g.id} value={g.id}>
                                {g.number}{g.location ? ` · ${g.location}` : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                      )
                    )}

                    {/* License plate */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Patente del visitante <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={licensePlate}
                        onChange={e => setLicensePlate(e.target.value.toUpperCase())}
                        placeholder="ABC 123"
                        maxLength={10}
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-amber-300"
                      />
                    </div>

                    {/* Visitor name (optional) */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Nombre del visitante <span className="text-gray-400">(opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={visitorName}
                        onChange={e => setVisitorName(e.target.value)}
                        placeholder="Nombre del visitante"
                        maxLength={80}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={
                        processing ||
                        !selectedGarageId ||
                        !licensePlate.trim() ||
                        timesChangedSinceSearch ||
                        (!!hoursSelected && hoursSelected > MAX_HOURS)
                      }
                      className="w-full py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {processing ? "Reservando…" : "Confirmar reserva"}
                    </button>
                  </form>
                )}

                {/* ── History ─────────────────────────────────────────────── */}
                {pastReservations.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Historial
                    </p>
                    {pastReservations.map(r => (
                      <div
                        key={r.id}
                        className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-700 text-sm">{r.garage.number}</span>
                            <span className="font-mono text-xs text-gray-500">{r.licensePlate}</span>
                            {r.visitorName && (
                              <span className="text-xs text-gray-400 truncate">· {r.visitorName}</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {formatDate(r.startTime)} → {formatDate(r.endTime)}
                          </div>
                        </div>
                        {statusBadge(r.status)}
                      </div>
                    ))}
                  </div>
                )}

                {reservations.length === 0 && !showForm && (
                  <div className="flex flex-col items-center justify-center py-6 text-gray-400 text-sm gap-2">
                    <Car className="w-8 h-8 text-gray-300" />
                    <p>Todavía no usaste cocheras visitante.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
