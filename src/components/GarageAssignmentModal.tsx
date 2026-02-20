import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, X, Building, Car, CheckCircle, AlertCircle, Edit3, Unlink } from "lucide-react";
import { useToast } from "./Toast";
import {
  getAdminGarages,
  assignGarage,
  unassignGarage,
  type AdminGarage,
  type GarageType,
} from "../api_calls/garages";
import { getAdminApartments, type AdminApartment } from "../api_calls/admin";

const TYPE_COLORS: Record<GarageType, string> = {
  fija:      "bg-blue-100 text-blue-800",
  cortesia:  "bg-purple-100 text-purple-800",
  visitante: "bg-amber-100 text-amber-800",
};
const TYPE_LABELS: Record<GarageType, string> = {
  fija: "Fija", cortesia: "Cortesía", visitante: "Visitante",
};

interface Props {
  isOpen:  boolean;
  onClose: () => void;
  token:   string;
}

export default function GarageAssignmentModal({ isOpen, onClose, token }: Props) {
  const { showToast } = useToast();

  const [garages,    setGarages]    = useState<AdminGarage[]>([]);
  const [apartments, setApartments] = useState<AdminApartment[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [processing, setProcessing] = useState<number | null>(null);

  // inline reassign
  const [editingId,      setEditingId]      = useState<number | null>(null);
  const [selectedAptId,  setSelectedAptId]  = useState<string>("");

  useEffect(() => {
    if (isOpen && token) {
      loadAll();
    }
  }, [isOpen, token]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [g, a] = await Promise.all([getAdminGarages(token), getAdminApartments(token)]);
      setGarages(Array.isArray(g) ? g : []);
      setApartments(Array.isArray(a) ? a : []);
    } catch {
      showToast("Error al cargar datos", "error");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (g: AdminGarage) => {
    setEditingId(g.id);
    setSelectedAptId(g.apartment?.id?.toString() ?? "");
  };

  const handleAssign = async (garageId: number) => {
    if (!selectedAptId) return;
    setProcessing(garageId);
    try {
      await assignGarage(token, garageId, parseInt(selectedAptId));
      await loadAll();
      setEditingId(null);
      showToast("Cochera asignada correctamente", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al asignar", "error");
    } finally {
      setProcessing(null);
    }
  };

  const handleUnassign = async (garageId: number) => {
    setProcessing(garageId);
    try {
      await unassignGarage(token, garageId);
      await loadAll();
      setEditingId(null);
      showToast("Cochera desasignada correctamente", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al desasignar", "error");
    } finally {
      setProcessing(null);
    }
  };

  if (!isOpen) return null;

  const assigned   = garages.filter(g => g.apartment !== null).length;
  const unassigned = garages.filter(g => g.apartment === null).length;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto py-8"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl mx-4"
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-700 to-indigo-600 rounded-t-3xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Link2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Asignaciones de Cocheras</h2>
                <p className="text-indigo-200 text-sm">
                  {assigned} asignadas · {unassigned} sin asignar
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-16 text-gray-400">Cargando asignaciones...</div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {["Cochera", "Tipo", "Estado", "Unidad asignada", "Vehículos", "Acción"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {garages.map(g => (
                      <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-gray-800">{g.number}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${TYPE_COLORS[g.type]}`}>
                            {TYPE_LABELS[g.type]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1 text-xs font-medium ${g.status === "activa" ? "text-green-600" : "text-red-500"}`}>
                            {g.status === "activa"
                              ? <CheckCircle className="w-3.5 h-3.5" />
                              : <AlertCircle className="w-3.5 h-3.5" />}
                            {g.status === "activa" ? "Activa" : "Fuera de uso"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {editingId === g.id ? (
                            <div className="flex items-center gap-2">
                              <select
                                className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
                                value={selectedAptId}
                                onChange={e => setSelectedAptId(e.target.value)}
                              >
                                <option value="">Sin asignar</option>
                                {apartments.map(a => (
                                  <option key={a.id} value={a.id}>
                                    Unidad {a.unit} · Piso {a.floor}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleAssign(g.id)}
                                disabled={!selectedAptId || processing === g.id}
                                className="px-2 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-40 cursor-pointer"
                              >
                                {processing === g.id ? "..." : "OK"}
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className={g.apartment ? "flex items-center gap-1 text-gray-700" : "text-gray-400"}>
                              {g.apartment
                                ? <><Building className="w-3.5 h-3.5 text-gray-400" /> Unidad {g.apartment.unit} · Piso {g.apartment.floor}</>
                                : "Sin asignar"}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-medium ${g.vehicleCount > 0 ? "text-slate-700" : "text-gray-400"}`}>
                            <Car className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                            {g.vehicleCount}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button
                              onClick={() => openEdit(g)}
                              disabled={editingId === g.id}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                              title="Cambiar asignación"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {g.apartment && (
                              <button
                                onClick={() => handleUnassign(g.id)}
                                disabled={processing === g.id}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                                title="Desasignar"
                              >
                                <Unlink className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
