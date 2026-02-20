import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car, Search, Plus, Edit3, Trash2, X,
  MapPin, Tag, CheckCircle, AlertCircle, Building
} from "lucide-react";
import { useToast } from "./Toast";
import {
  getAdminGarages,
  createGarage,
  updateGarage,
  deleteGarage,
  type AdminGarage,
  type GarageType,
  type GarageStatus,
} from "../api_calls/garages";
import { getAdminApartments, type AdminApartment } from "../api_calls/admin";

// ─── helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<GarageType, string> = {
  fija:      "Fija",
  cortesia:  "Cortesía",
  visitante: "Visitante",
};

const TYPE_COLORS: Record<GarageType, string> = {
  fija:      "bg-blue-100 text-blue-800",
  cortesia:  "bg-purple-100 text-purple-800",
  visitante: "bg-amber-100 text-amber-800",
};

const STATUS_COLORS: Record<GarageStatus, string> = {
  activa:       "bg-green-100 text-green-800",
  fuera_de_uso: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<GarageStatus, string> = {
  activa:       "Activa",
  fuera_de_uso: "Fuera de uso",
};

const EMPTY_FORM = {
  number:      "",
  location:    "",
  type:        "fija" as GarageType,
  status:      "activa" as GarageStatus,
  apartmentId: "",
};

// ─── types ────────────────────────────────────────────────────────────────────

interface GarageManagementProps {
  isOpen:  boolean;
  onClose: () => void;
  token:   string;
}

type FilterType   = "all" | GarageType;
type FilterStatus = "all" | GarageStatus;

// ─── component ────────────────────────────────────────────────────────────────

function GarageManagement({ isOpen, onClose, token }: GarageManagementProps) {
  const { showToast } = useToast();

  const [garages,         setGarages]         = useState<AdminGarage[]>([]);
  const [filtered,        setFiltered]         = useState<AdminGarage[]>([]);
  const [apartments,      setApartments]       = useState<AdminApartment[]>([]);
  const [loading,         setLoading]          = useState(false);
  const [processing,      setProcessing]       = useState(false);

  const [search,          setSearch]           = useState("");
  const [filterType,      setFilterType]       = useState<FilterType>("all");
  const [filterStatus,    setFilterStatus]     = useState<FilterStatus>("all");

  const [showCreateModal, setShowCreateModal]  = useState(false);
  const [showEditModal,   setShowEditModal]    = useState(false);
  const [showDeleteModal, setShowDeleteModal]  = useState(false);
  const [selected,        setSelected]         = useState<AdminGarage | null>(null);

  const [form, setForm] = useState({ ...EMPTY_FORM });

  // ── load ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && token) {
      loadGarages();
      loadApartments();
    }
  }, [isOpen, token]);

  // ── filter ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    let result = garages;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(g =>
        g.number.toLowerCase().includes(q) ||
        (g.location ?? "").toLowerCase().includes(q) ||
        (g.apartment?.unit ?? "").toLowerCase().includes(q)
      );
    }
    if (filterType   !== "all") result = result.filter(g => g.type   === filterType);
    if (filterStatus !== "all") result = result.filter(g => g.status === filterStatus);

    setFiltered(result);
  }, [garages, search, filterType, filterStatus]);

  const loadGarages = async () => {
    setLoading(true);
    try {
      const data = await getAdminGarages(token);
      setGarages(Array.isArray(data) ? data : []);
    } catch {
      setGarages([]);
      showToast("Error al cargar cocheras", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadApartments = async () => {
    try {
      const data = await getAdminApartments(token);
      setApartments(Array.isArray(data) ? data : []);
    } catch {
      setApartments([]);
    }
  };

  // ── handlers ────────────────────────────────────────────────────────────────
  const openCreate = () => {
    setForm({ ...EMPTY_FORM });
    setShowCreateModal(true);
  };

  const openEdit = (g: AdminGarage) => {
    setSelected(g);
    setForm({
      number:      g.number,
      location:    g.location ?? "",
      type:        g.type,
      status:      g.status,
      apartmentId: g.apartment?.id?.toString() ?? "",
    });
    setShowEditModal(true);
  };

  const openDelete = (g: AdminGarage) => {
    setSelected(g);
    setShowDeleteModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.number.trim()) return showToast("El número de cochera es requerido", "error");
    setProcessing(true);
    try {
      await createGarage(token, {
        number:      form.number.trim(),
        location:    form.location.trim() || undefined,
        type:        form.type,
        status:      form.status,
        apartmentId: form.apartmentId ? parseInt(form.apartmentId) : null,
      });
      await loadGarages();
      setShowCreateModal(false);
      showToast("Cochera creada exitosamente", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al crear cochera", "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setProcessing(true);
    try {
      await updateGarage(token, selected.id, {
        number:      form.number.trim(),
        location:    form.location.trim() || undefined,
        type:        form.type,
        status:      form.status,
        apartmentId: form.apartmentId ? parseInt(form.apartmentId) : null,
      });
      await loadGarages();
      setShowEditModal(false);
      setSelected(null);
      showToast("Cochera actualizada exitosamente", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al actualizar cochera", "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setProcessing(true);
    try {
      await deleteGarage(token, selected.id);
      await loadGarages();
      setShowDeleteModal(false);
      setSelected(null);
      showToast("Cochera eliminada exitosamente", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al eliminar cochera", "error");
    } finally {
      setProcessing(false);
    }
  };

  // ── render ──────────────────────────────────────────────────────────────────
  if (!isOpen) return null;

  const stats = {
    total:       garages.length,
    fijas:       garages.filter(g => g.type === "fija").length,
    cortesia:    garages.filter(g => g.type === "cortesia").length,
    visitante:   garages.filter(g => g.type === "visitante").length,
    fueraDeUso:  garages.filter(g => g.status === "fuera_de_uso").length,
    asignadas:   garages.filter(g => g.apartment !== null).length,
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl mx-4"
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-t-3xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Gestión de Cocheras</h2>
                <p className="text-slate-300 text-sm">{stats.total} cocheras registradas</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: "Total",        value: stats.total,      color: "bg-slate-50  border-slate-200" },
                { label: "Fijas",        value: stats.fijas,      color: "bg-blue-50   border-blue-200"  },
                { label: "Cortesía",     value: stats.cortesia,   color: "bg-purple-50 border-purple-200"},
                { label: "Visitante",    value: stats.visitante,  color: "bg-amber-50  border-amber-200" },
                { label: "Asignadas",    value: stats.asignadas,  color: "bg-green-50  border-green-200" },
                { label: "Fuera de uso", value: stats.fueraDeUso, color: "bg-red-50    border-red-200"   },
              ].map(s => (
                <div key={s.label} className={`border rounded-xl p-3 text-center ${s.color}`}>
                  <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                  placeholder="Buscar por número, ubicación o unidad..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <select
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 cursor-pointer"
                value={filterType}
                onChange={e => setFilterType(e.target.value as FilterType)}
              >
                <option value="all">Todos los tipos</option>
                <option value="fija">Fija</option>
                <option value="cortesia">Cortesía</option>
                <option value="visitante">Visitante</option>
              </select>

              <select
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 cursor-pointer"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as FilterStatus)}
              >
                <option value="all">Todos los estados</option>
                <option value="activa">Activa</option>
                <option value="fuera_de_uso">Fuera de uso</option>
              </select>

              <button
                onClick={openCreate}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Nueva Cochera
              </button>
            </div>

            {/* Table */}
            {loading ? (
              <div className="text-center py-16 text-gray-400">Cargando cocheras...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No se encontraron cocheras</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {["Número", "Ubicación", "Tipo", "Estado", "Unidad asignada", "Vehículos", "Acciones"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map(g => (
                      <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-gray-800">{g.number}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {g.location ? (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                              {g.location}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${TYPE_COLORS[g.type]}`}>
                            {TYPE_LABELS[g.type]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${STATUS_COLORS[g.status]}`}>
                            {g.status === "activa"
                              ? <CheckCircle className="w-3 h-3" />
                              : <AlertCircle className="w-3 h-3" />
                            }
                            {STATUS_LABELS[g.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {g.apartment ? (
                            <span className="flex items-center gap-1 text-gray-700">
                              <Building className="w-3.5 h-3.5 text-gray-400" />
                              Unidad {g.apartment.unit} · Piso {g.apartment.floor}
                            </span>
                          ) : (
                            <span className="text-gray-400">Sin asignar</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-medium ${g.vehicleCount > 0 ? "text-slate-700" : "text-gray-400"}`}>
                            {g.vehicleCount}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button
                              onClick={() => openEdit(g)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Editar"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDelete(g)}
                              disabled={g.vehicleCount > 0}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                g.vehicleCount > 0
                                  ? "text-gray-300 cursor-not-allowed"
                                  : "text-red-600 hover:bg-red-50"
                              }`}
                              title={g.vehicleCount > 0 ? "Tiene vehículos asignados" : "Eliminar"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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

      {/* ── Create / Edit Modal ────────────────────────────────────────────── */}
      {(showCreateModal || showEditModal) && (
        <GarageFormModal
          title={showCreateModal ? "Nueva Cochera" : "Editar Cochera"}
          form={form}
          setForm={setForm}
          apartments={apartments}
          processing={processing}
          onSubmit={showCreateModal ? handleCreate : handleEdit}
          onClose={() => { setShowCreateModal(false); setShowEditModal(false); setSelected(null); }}
        />
      )}

      {/* ── Delete Modal ───────────────────────────────────────────────────── */}
      {showDeleteModal && selected && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4"
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          >
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 text-center mb-2">Eliminar Cochera</h3>
            <p className="text-gray-600 text-center text-sm mb-6">
              ¿Estás seguro de eliminar la cochera <strong>{selected.number}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setSelected(null); }}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={processing}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {processing ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Form Modal (shared create/edit) ──────────────────────────────────────────

interface FormModalProps {
  title:       string;
  form:        typeof EMPTY_FORM;
  setForm:     (f: typeof EMPTY_FORM) => void;
  apartments:  AdminApartment[];
  processing:  boolean;
  onSubmit:    (e: React.FormEvent) => void;
  onClose:     () => void;
}

function GarageFormModal({ title, form, setForm, apartments, processing, onSubmit, onClose }: FormModalProps) {
  const set = (k: keyof typeof EMPTY_FORM) => (v: string) =>
    setForm({ ...form, [k]: v });

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4"
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-slate-600" />
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-4">
          {/* Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número <span className="text-red-500">*</span>
            </label>
            <input
              required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              placeholder="Ej: C-01, P-12"
              value={form.number}
              onChange={e => set("number")(e.target.value)}
              disabled={processing}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
            <input
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              placeholder="Ej: Subsuelo 1, Planta Baja"
              value={form.location}
              onChange={e => set("location")(e.target.value)}
              disabled={processing}
            />
          </div>

          {/* Type + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 cursor-pointer"
                value={form.type}
                onChange={e => set("type")(e.target.value)}
                disabled={processing}
              >
                <option value="fija">Fija</option>
                <option value="cortesia">Cortesía</option>
                <option value="visitante">Visitante</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 cursor-pointer"
                value={form.status}
                onChange={e => set("status")(e.target.value)}
                disabled={processing}
              >
                <option value="activa">Activa</option>
                <option value="fuera_de_uso">Fuera de uso</option>
              </select>
            </div>
          </div>

          {/* Apartment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unidad asignada</label>
            <select
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 cursor-pointer"
              value={form.apartmentId}
              onChange={e => set("apartmentId")(e.target.value)}
              disabled={processing}
            >
              <option value="">Sin asignar</option>
              {apartments.map(a => (
                <option key={a.id} value={a.id}>
                  Unidad {a.unit} · Piso {a.floor}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={processing}
              className="flex-1 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              {processing ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default GarageManagement;
