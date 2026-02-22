import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ClipboardList, ParkingSquare, ArrowRightLeft, Plus, Clock, CheckCircle, XCircle, ChevronDown } from "lucide-react";
import { useToast } from "./Toast";
import {
  getMyGarageRequests,
  createGarageRequest,
  cancelGarageRequest,
  getAvailableGaragesForRequest,
  type GarageRequest,
  type AvailableGarage,
} from "../api_calls/garageRequests";
import { type MyGarage } from "../api_calls/garages";

interface Props {
  isOpen:    boolean;
  onClose:   () => void;
  token:     string;
  myGarages: MyGarage[];
}

export default function GarageRequestModal({ isOpen, onClose, token, myGarages }: Props) {
  const { showToast } = useToast();

  const [requests,         setRequests]         = useState<GarageRequest[]>([]);
  const [availableGarages, setAvailableGarages] = useState<AvailableGarage[]>([]);
  const [loading,          setLoading]          = useState(true);
  const [submitting,       setSubmitting]       = useState(false);
  const [showForm,         setShowForm]         = useState(false);

  // form state
  const [type,               setType]               = useState<"nueva" | "cambio">("nueva");
  const [currentGarageId,    setCurrentGarageId]    = useState("");
  const [requestedGarageId,  setRequestedGarageId]  = useState("");
  const [reason,             setReason]             = useState("");

  useEffect(() => {
    if (isOpen && token) load();
  }, [isOpen, token]);

  const load = async () => {
    setLoading(true);
    try {
      const [reqs, avail] = await Promise.all([
        getMyGarageRequests(token),
        getAvailableGaragesForRequest(token),
      ]);
      setRequests(reqs);
      setAvailableGarages(avail);
    } catch {
      showToast("Error al cargar solicitudes", "error");
    } finally {
      setLoading(false);
    }
  };

  const hasPending = requests.some(r => r.status === "pendiente");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (type === "cambio" && !currentGarageId) {
      return showToast("Seleccioná la cochera que querés cambiar", "error");
    }
    setSubmitting(true);
    try {
      await createGarageRequest(token, {
        type,
        currentGarageId:   currentGarageId  ? parseInt(currentGarageId)  : undefined,
        requestedGarageId: requestedGarageId ? parseInt(requestedGarageId) : undefined,
        reason,
      });
      showToast("Solicitud enviada correctamente", "success");
      setShowForm(false);
      setType("nueva"); setCurrentGarageId(""); setRequestedGarageId(""); setReason("");
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al enviar la solicitud", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await cancelGarageRequest(token, id);
      showToast("Solicitud cancelada", "success");
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al cancelar", "error");
    }
  };

  const statusBadge = (status: GarageRequest["status"]) => {
    switch (status) {
      case "pendiente":
        return <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700"><Clock className="w-3 h-3" />Pendiente</span>;
      case "aprobada":
        return <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle className="w-3 h-3" />Aprobada</span>;
      case "rechazada":
        return <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700"><XCircle className="w-3 h-3" />Rechazada</span>;
    }
  };

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-xl"
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-t-3xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Solicitud de Cochera</h2>
                <p className="text-slate-300 text-sm">Pedí una cochera nueva o solicitá un cambio</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* New request button */}
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                disabled={hasPending}
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 text-white rounded-2xl font-semibold text-sm hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Nueva solicitud
              </button>
            )}
            {hasPending && !showForm && (
              <p className="text-center text-xs text-amber-600 -mt-3">Ya tenés una solicitud pendiente. Esperá a que el admin la resuelva o cancelala para hacer una nueva.</p>
            )}

            {/* Form */}
            {showForm && (
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-4 bg-gray-50 rounded-2xl p-5 border border-gray-200"
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="font-bold text-gray-800 text-sm">Nueva solicitud</h3>

                {/* Type */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setType("nueva")}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer ${
                      type === "nueva" ? "border-slate-800 bg-slate-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Plus className={`w-5 h-5 ${type === "nueva" ? "text-slate-800" : "text-gray-400"}`} />
                    <span className={type === "nueva" ? "text-slate-800" : "text-gray-500"}>Cochera nueva</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("cambio")}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer ${
                      type === "cambio" ? "border-slate-800 bg-slate-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <ArrowRightLeft className={`w-5 h-5 ${type === "cambio" ? "text-slate-800" : "text-gray-400"}`} />
                    <span className={type === "cambio" ? "text-slate-800" : "text-gray-500"}>Cambio de cochera</span>
                  </button>
                </div>

                {/* Current garage (for cambio) */}
                {type === "cambio" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Cochera actual <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <ParkingSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        required
                        value={currentGarageId}
                        onChange={e => setCurrentGarageId(e.target.value)}
                        className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 appearance-none cursor-pointer bg-white"
                      >
                        <option value="">Seleccioná tu cochera actual</option>
                        {myGarages.map(g => (
                          <option key={g.id} value={g.id}>{g.number}{g.location ? ` · ${g.location}` : ""}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Requested garage */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Cochera preferida <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <div className="relative">
                    <ParkingSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={requestedGarageId}
                      onChange={e => setRequestedGarageId(e.target.value)}
                      className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 appearance-none cursor-pointer bg-white"
                    >
                      <option value="">Sin preferencia (cualquier disponible)</option>
                      {availableGarages.map(g => (
                        <option key={g.id} value={g.id}>
                          {g.number}{g.location ? ` · ${g.location}` : ""} ({g.type})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Motivo <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Contale al administrador el motivo de tu solicitud..."
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    disabled={submitting}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? "Enviando..." : "Enviar solicitud"}
                  </button>
                </div>
              </motion.form>
            )}

            {/* History */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">Mis solicitudes</h3>
              {loading ? (
                <div className="text-center py-8 text-gray-400 text-sm">Cargando...</div>
              ) : requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                    <ClipboardList className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-gray-500 text-sm">No hiciste ninguna solicitud todavía</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.map(r => (
                    <div key={r.id} className="bg-gray-50 rounded-2xl border border-gray-100 p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {r.type === "nueva"
                            ? <Plus className="w-4 h-4 text-slate-500 flex-shrink-0" />
                            : <ArrowRightLeft className="w-4 h-4 text-slate-500 flex-shrink-0" />
                          }
                          <span className="font-semibold text-gray-800 text-sm capitalize">
                            {r.type === "nueva" ? "Cochera nueva" : "Cambio de cochera"}
                          </span>
                        </div>
                        {statusBadge(r.status)}
                      </div>

                      <div className="text-xs text-gray-500 space-y-0.5">
                        {r.currentGarage && (
                          <p>Cochera actual: <span className="font-medium text-gray-700">{r.currentGarage.number}</span></p>
                        )}
                        {r.requestedGarage ? (
                          <p>Cochera solicitada: <span className="font-medium text-gray-700">{r.requestedGarage.number}{r.requestedGarage.location ? ` · ${r.requestedGarage.location}` : ""}</span></p>
                        ) : (
                          <p>Cochera preferida: <span className="text-gray-400">Sin preferencia</span></p>
                        )}
                        {r.reason && <p>Motivo: <span className="text-gray-600 italic">"{r.reason}"</span></p>}
                        {r.adminNote && (
                          <p className="mt-1 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600">
                            <span className="font-semibold text-gray-700">Nota del admin: </span>{r.adminNote}
                          </p>
                        )}
                        <p className="text-gray-400 pt-0.5">{fmt(r.createdAt)}</p>
                      </div>

                      {r.status === "pendiente" && (
                        <button
                          onClick={() => handleCancel(r.id)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors cursor-pointer"
                        >
                          Cancelar solicitud
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
