import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, Plus, Edit3, Trash2, X, MapPin, CheckCircle } from "lucide-react";
import { useToast } from "./Toast";
import {
  getMyVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  type Vehicle,
  type CreateVehiclePayload,
} from "../api_calls/vehicles";
import { getMyGarages, type MyGarage } from "../api_calls/garages";

const EMPTY_FORM: Omit<CreateVehiclePayload, "garageId"> & { garageId: string } = {
  licensePlate: "",
  brand:        "",
  model:        "",
  color:        "",
  garageId:     "",
};

interface Props {
  isOpen:  boolean;
  onClose: () => void;
  token:   string;
}

export default function MyVehiclesModal({ isOpen, onClose, token }: Props) {
  const { showToast } = useToast();

  const [vehicles,        setVehicles]        = useState<Vehicle[]>([]);
  const [garages,         setGarages]         = useState<MyGarage[]>([]);
  const [loading,         setLoading]         = useState(false);
  const [processing,      setProcessing]      = useState(false);
  const [showForm,        setShowForm]        = useState(false);
  const [editingVehicle,  setEditingVehicle]  = useState<Vehicle | null>(null);
  const [deletingId,      setDeletingId]      = useState<number | null>(null);
  const [form,            setForm]            = useState({ ...EMPTY_FORM });

  useEffect(() => {
    if (isOpen && token) {
      loadAll();
    }
  }, [isOpen, token]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [v, g] = await Promise.all([getMyVehicles(token), getMyGarages(token)]);
      setVehicles(Array.isArray(v) ? v : []);
      setGarages(Array.isArray(g) ? g : []);
    } catch {
      showToast("Error al cargar datos", "error");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingVehicle(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setForm({
      licensePlate: v.licensePlate,
      brand:        v.brand,
      model:        v.model,
      color:        v.color,
      garageId:     v.garageId?.toString() ?? "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.licensePlate.trim() || !form.brand.trim() || !form.model.trim() || !form.color.trim()) {
      return showToast("Todos los campos son requeridos", "error");
    }
    setProcessing(true);
    try {
      const payload: CreateVehiclePayload = {
        licensePlate: form.licensePlate.trim().toUpperCase(),
        brand:        form.brand.trim(),
        model:        form.model.trim(),
        color:        form.color.trim(),
        garageId:     form.garageId ? parseInt(form.garageId) : null,
      };

      if (editingVehicle) {
        await updateVehicle(token, editingVehicle.id, payload);
        showToast("Vehículo actualizado", "success");
      } else {
        await createVehicle(token, payload);
        showToast("Vehículo registrado", "success");
      }
      await loadAll();
      setShowForm(false);
      setEditingVehicle(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al guardar", "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteVehicle(token, id);
      await loadAll();
      showToast("Vehículo eliminado", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al eliminar", "error");
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto py-8"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4"
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-700 to-slate-600 rounded-t-3xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Mis Vehículos</h2>
                <p className="text-slate-300 text-sm">{vehicles.length} registrado{vehicles.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={openCreate}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
              <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Mis cocheras (read-only) */}
            {garages.length > 0 && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Cocheras de tu unidad
                </p>
                <div className="flex flex-wrap gap-2">
                  {garages.map(g => (
                    <div key={g.id} className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      <span className="font-semibold text-gray-700">{g.number}</span>
                      {g.location && (
                        <span className="text-gray-400 flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" />{g.location}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form */}
            <AnimatePresence>
              {showForm && (
                <motion.div
                  className="bg-gray-50 rounded-2xl p-5 border border-gray-200"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <h3 className="font-semibold text-gray-700 mb-4">
                    {editingVehicle ? "Editar vehículo" : "Nuevo vehículo"}
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Patente *</label>
                        <input
                          required
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 uppercase"
                          placeholder="ABC 123"
                          value={form.licensePlate}
                          onChange={e => setForm({ ...form, licensePlate: e.target.value })}
                          disabled={processing}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Color *</label>
                        <input
                          required
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                          placeholder="Ej: Blanco"
                          value={form.color}
                          onChange={e => setForm({ ...form, color: e.target.value })}
                          disabled={processing}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Marca *</label>
                        <input
                          required
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                          placeholder="Ej: Toyota"
                          value={form.brand}
                          onChange={e => setForm({ ...form, brand: e.target.value })}
                          disabled={processing}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Modelo *</label>
                        <input
                          required
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                          placeholder="Ej: Corolla"
                          value={form.model}
                          onChange={e => setForm({ ...form, model: e.target.value })}
                          disabled={processing}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Cochera asignada</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 cursor-pointer"
                        value={form.garageId}
                        onChange={e => setForm({ ...form, garageId: e.target.value })}
                        disabled={processing}
                      >
                        <option value="">Sin cochera</option>
                        {garages.map(g => (
                          <option key={g.id} value={g.id}>
                            {g.number}{g.location ? ` · ${g.location}` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => { setShowForm(false); setEditingVehicle(null); }}
                        className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={processing}
                        className="flex-1 py-2.5 bg-slate-700 text-white rounded-xl text-sm font-medium hover:bg-slate-600 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {processing ? "Guardando..." : (editingVehicle ? "Actualizar" : "Registrar")}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Vehicle list */}
            {loading ? (
              <div className="text-center py-10 text-gray-400">Cargando...</div>
            ) : vehicles.length === 0 ? (
              <div className="text-center py-10">
                <Car className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No tenés vehículos registrados</p>
                <button onClick={openCreate} className="mt-3 text-slate-600 text-sm font-medium hover:underline cursor-pointer">
                  Registrar mi primer vehículo →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {vehicles.map(v => (
                  <div key={v.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Car className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-gray-800">{v.licensePlate}</span>
                          <span className="text-gray-500 text-sm">{v.brand} {v.model}</span>
                          <span className="text-gray-400 text-xs">· {v.color}</span>
                        </div>
                        {v.garage ? (
                          <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                            <CheckCircle className="w-3 h-3" />
                            Cochera {v.garage.number}
                            {v.garage.location && ` · ${v.garage.location}`}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-400 mt-0.5">Sin cochera asignada</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(v)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(v.id)}
                        disabled={deletingId === v.id}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
