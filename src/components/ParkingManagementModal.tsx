import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car, Search, Plus, Edit3, Trash2, X, MapPin, Tag,
  CheckCircle, AlertCircle, Building, Link2, Unlink,
  Truck, User, Filter, Clock, ClipboardList, XCircle, Briefcase,
} from "lucide-react";
import { useToast } from "./Toast";
import {
  getAdminGarages, createGarage, updateGarage, deleteGarage,
  assignGarage, unassignGarage,
  type AdminGarage, type GarageType, type GarageStatus,
} from "../api_calls/garages";
import { getAdminVehicles, type AdminVehicle, type AdminVehicleFilters } from "../api_calls/vehicles";
import { getAdminApartments, type AdminApartment } from "../api_calls/admin";
import { adminGetAllVisitorParkings, type AdminVisitorParking } from "../api_calls/visitorParking";
import { adminGetAllGarageRequests, adminResolveGarageRequest, type AdminGarageRequest } from "../api_calls/garageRequests";
import {
  getCortesiaReservations, createCortesiaReservation, cancelCortesiaReservation,
  type CortesiaReservation,
} from "../api_calls/cortesiaReservations";

// ─── helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<GarageType, string> = {
  fija: "Fija", cortesia: "Cortesía", visitante: "Visitante",
};
const TYPE_COLORS: Record<GarageType, string> = {
  fija: "bg-blue-100 text-blue-800",
  cortesia: "bg-purple-100 text-purple-800",
  visitante: "bg-amber-100 text-amber-800",
};
const STATUS_LABELS: Record<GarageStatus, string> = {
  activa: "Activa", fuera_de_uso: "Fuera de uso",
};
const STATUS_COLORS: Record<GarageStatus, string> = {
  activa: "bg-green-100 text-green-800",
  fuera_de_uso: "bg-red-100 text-red-800",
};

const COLOR_DOT: Record<string, string> = {
  blanco: "bg-gray-100 border border-gray-300",
  negro: "bg-gray-900",
  gris: "bg-gray-400",
  plateado: "bg-gray-300 border border-gray-400",
  rojo: "bg-red-500",
  azul: "bg-blue-500",
  verde: "bg-green-500",
  amarillo: "bg-yellow-400",
  naranja: "bg-orange-500",
};
const colorDot = (color: string) => {
  const key = color.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return <span className={`inline-block w-3 h-3 rounded-full flex-shrink-0 ${COLOR_DOT[key] ?? "bg-indigo-400"}`} />;
};

const EMPTY_GARAGE_FORM = {
  number: "", location: "", type: "fija" as GarageType,
  status: "activa" as GarageStatus, apartmentId: "",
};

type FilterType   = "all" | GarageType;
type FilterStatus = "all" | GarageStatus;
type Tab = "cocheras" | "asignaciones" | "vehiculos" | "visitantes" | "solicitudes" | "cortesia";

// ─── props ────────────────────────────────────────────────────────────────────

interface Props {
  isOpen:  boolean;
  onClose: () => void;
  token:   string;
}

// ─── component ────────────────────────────────────────────────────────────────

export default function ParkingManagementModal({ isOpen, onClose, token }: Props) {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<Tab>("cocheras");

  // ── shared data ─────────────────────────────────────────────────────────────
  const [garages,    setGarages]    = useState<AdminGarage[]>([]);
  const [apartments, setApartments] = useState<AdminApartment[]>([]);
  const [vehicles,   setVehicles]   = useState<AdminVehicle[]>([]);
  const [loading,    setLoading]    = useState(false);

  // ── garage ABM state ─────────────────────────────────────────────────────────
  const [garageSearch,       setGarageSearch]       = useState("");
  const [garageFilterType,   setGarageFilterType]   = useState<FilterType>("all");
  const [garageFilterStatus, setGarageFilterStatus] = useState<FilterStatus>("all");
  const [showCreateModal,    setShowCreateModal]     = useState(false);
  const [showEditModal,      setShowEditModal]       = useState(false);
  const [showDeleteModal,    setShowDeleteModal]     = useState(false);
  const [selectedGarage,     setSelectedGarage]     = useState<AdminGarage | null>(null);
  const [garageForm,         setGarageForm]         = useState({ ...EMPTY_GARAGE_FORM });
  const [processingGarage,   setProcessingGarage]   = useState(false);

  // ── assignment state ─────────────────────────────────────────────────────────
  const [editingAssignId,   setEditingAssignId]   = useState<number | null>(null);
  const [selectedAssignApt, setSelectedAssignApt] = useState<string>("");
  const [processingAssign,  setProcessingAssign]  = useState<number | null>(null);

  // ── vehicle filter state ─────────────────────────────────────────────────────
  const [vehicleSearch,   setVehicleSearch]   = useState("");
  const [filterGarageId,  setFilterGarageId]  = useState("");
  const [filterAptId,     setFilterAptId]     = useState("");

  // ── visitor parking state ────────────────────────────────────────────────────
  const [visitorParkings,        setVisitorParkings]        = useState<AdminVisitorParking[]>([]);
  const [visitorParkingLoading,  setVisitorParkingLoading]  = useState(false);
  const [visitorSearch,          setVisitorSearch]          = useState("");

  // ── garage requests state ──────────────────────────────────────────────────
  const [garageRequests,    setGarageRequests]    = useState<AdminGarageRequest[]>([]);
  const [reqFilter,         setReqFilter]         = useState<string>("pendiente");
  const [resolvingReqId,    setResolvingReqId]    = useState<number | null>(null);
  const [noteMap,           setNoteMap]           = useState<Record<number, string>>({});

  // ── cortesía reservations state ───────────────────────────────────────────
  const [cortesiaReservations,  setCortesiaReservations]  = useState<CortesiaReservation[]>([]);
  const [cortesiaLoading,       setCortesiaLoading]       = useState(false);

  // ── load all ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && token) loadAll();
  }, [isOpen, token]);

  const loadAll = async () => {
    setLoading(true);
    setVisitorParkingLoading(true);
    setCortesiaLoading(true);
    try {
      const [g, a, v, vp, gr, cr] = await Promise.all([
        getAdminGarages(token),
        getAdminApartments(token),
        getAdminVehicles(token),
        adminGetAllVisitorParkings(token),
        adminGetAllGarageRequests(token),
        getCortesiaReservations(token),
      ]);
      setGarages(Array.isArray(g) ? g : []);
      setApartments(Array.isArray(a) ? a : []);
      setVehicles(Array.isArray(v) ? v : []);
      setVisitorParkings(Array.isArray(vp) ? vp : []);
      setGarageRequests(Array.isArray(gr) ? gr : []);
      setCortesiaReservations(Array.isArray(cr) ? cr : []);
    } catch {
      showToast("Error al cargar datos", "error");
    } finally {
      setLoading(false);
      setVisitorParkingLoading(false);
      setCortesiaLoading(false);
    }
  };

  const reloadGarages = async () => {
    try {
      const data = await getAdminGarages(token);
      setGarages(Array.isArray(data) ? data : []);
    } catch {
      showToast("Error al recargar cocheras", "error");
    }
  };

  // ── garage ABM handlers ──────────────────────────────────────────────────────
  const openCreate = () => {
    setGarageForm({ ...EMPTY_GARAGE_FORM });
    setShowCreateModal(true);
  };

  const openEdit = (g: AdminGarage) => {
    setSelectedGarage(g);
    setGarageForm({
      number:      g.number,
      location:    g.location ?? "",
      type:        g.type,
      status:      g.status,
      apartmentId: g.apartment?.id?.toString() ?? "",
    });
    setShowEditModal(true);
  };

  const openDelete = (g: AdminGarage) => {
    setSelectedGarage(g);
    setShowDeleteModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!garageForm.number.trim()) return showToast("El número de cochera es requerido", "error");
    setProcessingGarage(true);
    try {
      await createGarage(token, {
        number:      garageForm.number.trim(),
        location:    garageForm.location.trim() || undefined,
        type:        garageForm.type,
        status:      garageForm.status,
        apartmentId: garageForm.apartmentId ? parseInt(garageForm.apartmentId) : null,
      });
      await reloadGarages();
      setShowCreateModal(false);
      showToast("Cochera creada exitosamente", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al crear cochera", "error");
    } finally {
      setProcessingGarage(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGarage) return;
    setProcessingGarage(true);
    try {
      await updateGarage(token, selectedGarage.id, {
        number:      garageForm.number.trim(),
        location:    garageForm.location.trim() || undefined,
        type:        garageForm.type,
        status:      garageForm.status,
        apartmentId: garageForm.apartmentId ? parseInt(garageForm.apartmentId) : null,
      });
      await reloadGarages();
      setShowEditModal(false);
      setSelectedGarage(null);
      showToast("Cochera actualizada exitosamente", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al actualizar cochera", "error");
    } finally {
      setProcessingGarage(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedGarage) return;
    setProcessingGarage(true);
    try {
      await deleteGarage(token, selectedGarage.id);
      await reloadGarages();
      setShowDeleteModal(false);
      setSelectedGarage(null);
      showToast("Cochera eliminada exitosamente", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al eliminar cochera", "error");
    } finally {
      setProcessingGarage(false);
    }
  };

  // ── assignment handlers ──────────────────────────────────────────────────────
  const openAssignEdit = (g: AdminGarage) => {
    setEditingAssignId(g.id);
    setSelectedAssignApt(g.apartment?.id?.toString() ?? "");
  };

  const handleAssign = async (garageId: number) => {
    if (!selectedAssignApt) return;
    setProcessingAssign(garageId);
    try {
      await assignGarage(token, garageId, parseInt(selectedAssignApt));
      await reloadGarages();
      setEditingAssignId(null);
      showToast("Cochera asignada correctamente", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al asignar", "error");
    } finally {
      setProcessingAssign(null);
    }
  };

  const handleUnassign = async (garageId: number) => {
    setProcessingAssign(garageId);
    try {
      await unassignGarage(token, garageId);
      await reloadGarages();
      setEditingAssignId(null);
      showToast("Cochera desasignada correctamente", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al desasignar", "error");
    } finally {
      setProcessingAssign(null);
    }
  };

  // ── vehicle filter ───────────────────────────────────────────────────────────
  const applyVehicleFilters = async () => {
    setLoading(true);
    try {
      const filters: AdminVehicleFilters = {
        garageId:    filterGarageId ? parseInt(filterGarageId) : undefined,
        apartmentId: filterAptId    ? parseInt(filterAptId)    : undefined,
        licensePlate: vehicleSearch || undefined,
      };
      const data = await getAdminVehicles(token, filters);
      setVehicles(Array.isArray(data) ? data : []);
    } catch {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  // ── filtered lists ───────────────────────────────────────────────────────────
  const filteredGarages = garages.filter(g => {
    const matchSearch = !garageSearch || (
      g.number.toLowerCase().includes(garageSearch.toLowerCase()) ||
      (g.location ?? "").toLowerCase().includes(garageSearch.toLowerCase()) ||
      (g.apartment?.unit ?? "").toLowerCase().includes(garageSearch.toLowerCase())
    );
    const matchType   = garageFilterType   === "all" || g.type   === garageFilterType;
    const matchStatus = garageFilterStatus === "all" || g.status === garageFilterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const filteredVehicles = vehicles.filter(v => {
    if (!vehicleSearch) return true;
    const q = vehicleSearch.toLowerCase();
    return (
      v.licensePlate.toLowerCase().includes(q) ||
      v.brand.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      v.user?.name?.toLowerCase().includes(q) ||
      (v.user?.apartment?.unit ?? "").toLowerCase().includes(q)
    );
  });

  // ── render ───────────────────────────────────────────────────────────────────
  if (!isOpen) return null;

  const garageStats = {
    total:      garages.length,
    fijas:      garages.filter(g => g.type === "fija").length,
    cortesia:   garages.filter(g => g.type === "cortesia").length,
    visitante:  garages.filter(g => g.type === "visitante").length,
    fueraDeUso: garages.filter(g => g.status === "fuera_de_uso").length,
    asignadas:  garages.filter(g => g.apartment !== null).length,
  };

  const tabs = [
    { key: "cocheras"     as Tab, label: "Cocheras",     icon: Car           },
    { key: "asignaciones" as Tab, label: "Asignaciones", icon: Link2         },
    { key: "vehiculos"    as Tab, label: "Vehículos",    icon: Truck         },
    { key: "visitantes"   as Tab, label: "Visitantes",   icon: Clock         },
    { key: "cortesia"     as Tab, label: "Cortesía",     icon: Briefcase,
      badge: cortesiaReservations.filter(r => r.status === "activa").length || undefined },
    { key: "solicitudes"  as Tab, label: "Solicitudes",  icon: ClipboardList,
      badge: garageRequests.filter(r => r.status === "pendiente").length || undefined },
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto py-8"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl mx-4"
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
        >
          {/* ── Header ─────────────────────────────────────────────────────── */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-t-3xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Cocheras & Vehículos</h2>
                <p className="text-slate-300 text-sm">
                  {garageStats.total} cocheras · {vehicles.length} vehículos registrados
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── Tab bar ────────────────────────────────────────────────────── */}
          <div className="border-b border-gray-200 bg-gray-50 px-6">
            <nav className="flex">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all -mb-px ${
                    activeTab === tab.key
                      ? "border-slate-800 text-slate-800 bg-white rounded-t-lg shadow-sm"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 cursor-pointer"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {(tab as any).badge ? (
                    <span className="ml-0.5 min-w-[18px] h-[18px] px-1 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {(tab as any).badge}
                    </span>
                  ) : null}
                </button>
              ))}
            </nav>
          </div>

          {/* ── Tab: Cocheras ───────────────────────────────────────────────── */}
          {activeTab === "cocheras" && (
            <div className="p-6 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: "Total",        value: garageStats.total,      color: "bg-slate-50  border-slate-200"  },
                  { label: "Fijas",        value: garageStats.fijas,      color: "bg-blue-50   border-blue-200"   },
                  { label: "Cortesía",     value: garageStats.cortesia,   color: "bg-purple-50 border-purple-200" },
                  { label: "Visitante",    value: garageStats.visitante,  color: "bg-amber-50  border-amber-200"  },
                  { label: "Asignadas",    value: garageStats.asignadas,  color: "bg-green-50  border-green-200"  },
                  { label: "Fuera de uso", value: garageStats.fueraDeUso, color: "bg-red-50    border-red-200"    },
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
                    value={garageSearch}
                    onChange={e => setGarageSearch(e.target.value)}
                  />
                </div>
                <select
                  className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 cursor-pointer"
                  value={garageFilterType}
                  onChange={e => setGarageFilterType(e.target.value as FilterType)}
                >
                  <option value="all">Todos los tipos</option>
                  <option value="fija">Fija</option>
                  <option value="cortesia">Cortesía</option>
                  <option value="visitante">Visitante</option>
                </select>
                <select
                  className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 cursor-pointer"
                  value={garageFilterStatus}
                  onChange={e => setGarageFilterStatus(e.target.value as FilterStatus)}
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
              ) : filteredGarages.length === 0 ? (
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
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredGarages.map(g => {
                        const _now = new Date();
                        const activeVisitor = visitorParkings.find(
                          vp =>
                            vp.garageId === g.id &&
                            vp.status === "activa" &&
                            new Date(vp.startTime) <= _now &&
                            new Date(vp.endTime)   >= _now
                        );
                        const activeCortesia = cortesiaReservations.find(
                          cr =>
                            cr.garageId === g.id &&
                            cr.status === "activa" &&
                            new Date(cr.startTime) <= _now &&
                            new Date(cr.endTime)   >= _now
                        );
                        return (
                        <tr key={g.id} className={`transition-colors ${
                          activeVisitor  ? "bg-amber-50 hover:bg-amber-100" :
                          activeCortesia ? "bg-purple-50 hover:bg-purple-100" :
                          "hover:bg-gray-50"
                        }`}>
                          <td className="px-4 py-3 font-semibold text-gray-800">{g.number}</td>
                          <td className="px-4 py-3 text-gray-600">
                            {g.location
                              ? <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gray-400" />{g.location}</span>
                              : <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${TYPE_COLORS[g.type]}`}>
                              {TYPE_LABELS[g.type]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${STATUS_COLORS[g.status]}`}>
                              {g.status === "activa" ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                              {STATUS_LABELS[g.status]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {activeVisitor ? (
                              <span className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-300 rounded-full text-xs font-semibold">
                                  Visitante en reserva
                                </span>
                                <span className="text-amber-600 text-xs font-medium">{activeVisitor.licensePlate}</span>
                              </span>
                            ) : activeCortesia ? (
                              <span className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 border border-purple-300 rounded-full text-xs font-semibold">
                                  Cortesía activa
                                </span>
                                <span className="text-purple-600 text-xs font-medium truncate max-w-[120px]">{activeCortesia.personName}</span>
                              </span>
                            ) : g.apartment ? (
                              <span className="flex items-center gap-1 text-gray-700"><Building className="w-3.5 h-3.5 text-gray-400" />Unidad {g.apartment.unit} · Piso {g.apartment.floor}</span>
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
                              <button onClick={() => openEdit(g)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" title="Editar">
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openDelete(g)}
                                disabled={g.vehicleCount > 0}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${g.vehicleCount > 0 ? "text-gray-300 cursor-not-allowed" : "text-red-600 hover:bg-red-50"}`}
                                title={g.vehicleCount > 0 ? "Tiene vehículos asignados" : "Eliminar"}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Asignaciones ───────────────────────────────────────────── */}
          {activeTab === "asignaciones" && (
            <div className="p-6">
              {/* Summary */}
              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">{garages.filter(g => g.apartment).length} asignadas</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="font-medium text-amber-800">{garages.filter(g => !g.apartment).length} sin asignar</span>
                </div>
              </div>

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
                              {g.status === "activa" ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                              {g.status === "activa" ? "Activa" : "Fuera de uso"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {editingAssignId === g.id ? (
                              <div className="flex items-center gap-2">
                                <select
                                  className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
                                  value={selectedAssignApt}
                                  onChange={e => setSelectedAssignApt(e.target.value)}
                                >
                                  <option value="">Sin asignar</option>
                                  {apartments.map(a => (
                                    <option key={a.id} value={a.id}>Unidad {a.unit} · Piso {a.floor}</option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => handleAssign(g.id)}
                                  disabled={!selectedAssignApt || processingAssign === g.id}
                                  className="px-2 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-40 cursor-pointer"
                                >
                                  {processingAssign === g.id ? "..." : "OK"}
                                </button>
                                <button onClick={() => setEditingAssignId(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className={g.apartment ? "flex items-center gap-1 text-gray-700" : "text-gray-400"}>
                                {g.apartment
                                  ? <><Building className="w-3.5 h-3.5 text-gray-400" />Unidad {g.apartment.unit} · Piso {g.apartment.floor}</>
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
                                onClick={() => openAssignEdit(g)}
                                disabled={editingAssignId === g.id}
                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                                title="Cambiar asignación"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              {g.apartment && (
                                <button
                                  onClick={() => handleUnassign(g.id)}
                                  disabled={processingAssign === g.id}
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
          )}

          {/* ── Tab: Visitantes ─────────────────────────────────────────────── */}
          {activeTab === "visitantes" && (
            <VisitantesTab
              visitorParkings={visitorParkings}
              loading={visitorParkingLoading}
              visitorSearch={visitorSearch}
              setVisitorSearch={setVisitorSearch}
            />
          )}

          {/* ── Tab: Cortesía ────────────────────────────────────────────────── */}
          {activeTab === "cortesia" && (
            <CortesiaTab
              reservations={cortesiaReservations}
              loading={cortesiaLoading}
              garages={garages.filter(g => g.type === "cortesia" && g.status === "activa")}
              token={token}
              onCreated={(r) => setCortesiaReservations(prev => [r, ...prev])}
              onCancelled={(id) =>
                setCortesiaReservations(prev =>
                  prev.map(r => r.id === id ? { ...r, status: "cancelada" as const } : r)
                )
              }
            />
          )}

          {/* ── Tab: Solicitudes ────────────────────────────────────────────── */}
          {activeTab === "solicitudes" && (
            <SolicitudesTab
              garageRequests={garageRequests}
              reqFilter={reqFilter}
              setReqFilter={setReqFilter}
              resolvingReqId={resolvingReqId}
              noteMap={noteMap}
              setNoteMap={setNoteMap}
              onResolve={async (id, status, note) => {
                setResolvingReqId(id);
                try {
                  const updated = await adminResolveGarageRequest(token, id, status, note);
                  setGarageRequests(prev => prev.map(r => r.id === id ? updated : r));
                  showToast(status === "aprobada" ? "Solicitud aprobada" : "Solicitud rechazada", status === "aprobada" ? "success" : "error");
                  if (status === "aprobada") await loadAll();
                } catch (err) {
                  showToast(err instanceof Error ? err.message : "Error al resolver", "error");
                } finally {
                  setResolvingReqId(null);
                }
              }}
            />
          )}

          {/* ── Tab: Vehículos ──────────────────────────────────────────────── */}
          {activeTab === "vehiculos" && (
            <div className="p-6 space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                    placeholder="Buscar por patente, marca, modelo o propietario..."
                    value={vehicleSearch}
                    onChange={e => setVehicleSearch(e.target.value)}
                  />
                </div>
                <select
                  className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
                  value={filterGarageId}
                  onChange={e => setFilterGarageId(e.target.value)}
                >
                  <option value="">Todas las cocheras</option>
                  {garages.map(g => (
                    <option key={g.id} value={g.id}>C-{g.number}</option>
                  ))}
                </select>
                <select
                  className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
                  value={filterAptId}
                  onChange={e => setFilterAptId(e.target.value)}
                >
                  <option value="">Todas las unidades</option>
                  {apartments.map(a => (
                    <option key={a.id} value={a.id}>Unidad {a.unit} · P{a.floor}</option>
                  ))}
                </select>
                <button
                  onClick={applyVehicleFilters}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Filter className="w-4 h-4" />
                  Filtrar
                </button>
              </div>

              {/* Table */}
              {loading ? (
                <div className="text-center py-16 text-gray-400">Cargando vehículos...</div>
              ) : filteredVehicles.length === 0 ? (
                <div className="text-center py-16">
                  <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No se encontraron vehículos</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {["Patente", "Vehículo", "Color", "Propietario", "Unidad", "Cochera"].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredVehicles.map(v => (
                        <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <span className="font-mono font-semibold text-gray-800 bg-gray-100 px-2 py-1 rounded-lg">
                              {v.licensePlate}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700">{v.brand} {v.model}</td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1.5 text-gray-600">
                              {colorDot(v.color)}
                              {v.color}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1 text-gray-700">
                              <User className="w-3.5 h-3.5 text-gray-400" />
                              {v.user?.name ?? "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {v.user?.apartment
                              ? <span className="flex items-center gap-1 text-gray-600"><Building className="w-3.5 h-3.5 text-gray-400" />Unidad {v.user.apartment.unit} · P{v.user.apartment.floor}</span>
                              : <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            {v.garage
                              ? <span className="flex items-center gap-1 text-gray-700"><MapPin className="w-3.5 h-3.5 text-gray-400" />{v.garage.number}{v.garage.location && <span className="text-gray-400 text-xs">· {v.garage.location}</span>}</span>
                              : <span className="text-gray-400">Sin cochera</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* ── Create / Edit garage modal ──────────────────────────────────────── */}
      {(showCreateModal || showEditModal) && (
        <GarageFormModal
          title={showCreateModal ? "Nueva Cochera" : "Editar Cochera"}
          form={garageForm}
          setForm={setGarageForm}
          apartments={apartments}
          processing={processingGarage}
          onSubmit={showCreateModal ? handleCreate : handleEdit}
          onClose={() => { setShowCreateModal(false); setShowEditModal(false); setSelectedGarage(null); }}
        />
      )}

      {/* ── Delete confirmation modal ───────────────────────────────────────── */}
      {showDeleteModal && selectedGarage && (
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
              ¿Estás seguro de eliminar la cochera <strong>{selectedGarage.number}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setSelectedGarage(null); }}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={processingGarage}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {processingGarage ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Solicitudes tab ──────────────────────────────────────────────────────────

interface SolicitudesTabProps {
  garageRequests: AdminGarageRequest[];
  reqFilter:      string;
  setReqFilter:   (v: string) => void;
  resolvingReqId: number | null;
  noteMap:        Record<number, string>;
  setNoteMap:     (m: Record<number, string>) => void;
  onResolve:      (id: number, status: "aprobada" | "rechazada", note?: string) => Promise<void>;
}

function SolicitudesTab({
  garageRequests, reqFilter, setReqFilter,
  resolvingReqId, noteMap, setNoteMap, onResolve,
}: SolicitudesTabProps) {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });

  const filtered = reqFilter === "all"
    ? garageRequests
    : garageRequests.filter(r => r.status === reqFilter);

  const pendingCount = garageRequests.filter(r => r.status === "pendiente").length;

  const StatusBadge = ({ status }: { status: AdminGarageRequest["status"] }) => {
    const map: Record<string, string> = {
      pendiente: "bg-amber-100 text-amber-700",
      aprobada:  "bg-green-100 text-green-700",
      rechazada: "bg-red-100 text-red-700",
    };
    const labels: Record<string, string> = { pendiente: "Pendiente", aprobada: "Aprobada", rechazada: "Rechazada" };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status]}`}>{labels[status]}</span>;
  };

  return (
    <div className="p-6 space-y-5">
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { value: "pendiente", label: `Pendientes${pendingCount > 0 ? ` (${pendingCount})` : ""}` },
          { value: "aprobada",  label: "Aprobadas" },
          { value: "rechazada", label: "Rechazadas" },
          { value: "all",       label: "Todas" },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setReqFilter(f.value)}
            className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              reqFilter === f.value
                ? "bg-slate-800 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hay solicitudes{reqFilter !== "all" ? ` ${reqFilter}s` : ""}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(req => (
            <div
              key={req.id}
              className={`rounded-2xl border p-5 space-y-3 ${
                req.status === "pendiente" ? "border-amber-200 bg-amber-50" : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-800 text-sm">
                      {req.type === "nueva" ? "Solicitud de cochera nueva" : "Solicitud de cambio de cochera"}
                    </span>
                    <StatusBadge status={req.status} />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <User className="w-3 h-3" />
                    <span className="font-medium text-gray-700">{req.user.name}</span>
                    <span>·</span>
                    {req.user.apartment
                      ? <span>Unidad {req.user.apartment.unit} · P{req.user.apartment.floor}</span>
                      : <span className="text-gray-400">Sin unidad asignada</span>
                    }
                    <span>·</span>
                    <span>{fmt(req.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-600 space-y-1 bg-white rounded-xl p-3 border border-gray-100">
                {req.currentGarage && (
                  <p><span className="text-gray-400">Cochera actual:</span>{" "}<span className="font-medium text-gray-800">{req.currentGarage.number}{req.currentGarage.location ? ` · ${req.currentGarage.location}` : ""}</span></p>
                )}
                <p>
                  <span className="text-gray-400">Cochera solicitada:</span>{" "}
                  {req.requestedGarage
                    ? <span className="font-medium text-gray-800">{req.requestedGarage.number}{req.requestedGarage.location ? ` · ${req.requestedGarage.location}` : ""}</span>
                    : <span className="text-gray-400 italic">—</span>
                  }
                </p>
                {req.reason && <p><span className="text-gray-400">Motivo:</span> <span className="italic">"{req.reason}"</span></p>}
                {req.adminNote && <p><span className="text-gray-400">Nota del admin:</span> <span className="font-medium">{req.adminNote}</span></p>}
              </div>

              {req.status === "pendiente" && (
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    placeholder="Nota para el vecino (opcional)"
                    value={noteMap[req.id] ?? ""}
                    onChange={e => setNoteMap({ ...noteMap, [req.id]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      disabled={resolvingReqId === req.id}
                      onClick={() => onResolve(req.id, "aprobada", noteMap[req.id])}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-600 text-white rounded-xl text-xs font-semibold hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      {resolvingReqId === req.id ? "Procesando..." : "Aprobar"}
                    </button>
                    <button
                      disabled={resolvingReqId === req.id}
                      onClick={() => onResolve(req.id, "rechazada", noteMap[req.id])}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Rechazar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Cortesía tab ─────────────────────────────────────────────────────────────

const MAX_CORTESIA_HOURS = 8;

const toLocalInputValue = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

interface CortesiaTabProps {
  reservations: CortesiaReservation[];
  loading:      boolean;
  garages:      AdminGarage[];
  token:        string;
  onCreated:    (r: CortesiaReservation) => void;
  onCancelled:  (id: number) => void;
}

function CortesiaTab({ reservations, loading, garages, token, onCreated, onCancelled }: CortesiaTabProps) {
  const { showToast } = useToast();
  const now = new Date();

  const [showForm,     setShowForm]     = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [cancelling,   setCancelling]   = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("activa");

  // form
  const defaultStart = toLocalInputValue(new Date(now.getTime() + 5 * 60 * 1000));
  const defaultEnd   = toLocalInputValue(new Date(now.getTime() + 2 * 60 * 60 * 1000));
  const [garageId,     setGarageId]     = useState("");
  const [personName,   setPersonName]   = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [reason,       setReason]       = useState("");
  const [startTime,    setStartTime]    = useState(defaultStart);
  const [endTime,      setEndTime]      = useState(defaultEnd);

  const resetForm = () => {
    const s = toLocalInputValue(new Date(Date.now() + 5 * 60 * 1000));
    const e = toLocalInputValue(new Date(Date.now() + 2 * 60 * 60 * 1000));
    setGarageId(""); setPersonName(""); setLicensePlate(""); setReason("");
    setStartTime(s); setEndTime(e);
  };

  const diffHours = startTime && endTime
    ? (new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60)
    : null;

  // Cocheras libres en el rango horario seleccionado
  const availableGarages = garages.filter(g => {
    if (!startTime || !endTime) return true;
    const selStart = new Date(startTime);
    const selEnd   = new Date(endTime);
    return !reservations.some(
      r =>
        r.garageId === g.id &&
        r.status === "activa" &&
        new Date(r.startTime) < selEnd &&
        new Date(r.endTime)   > selStart
    );
  });
  const occupiedGarages = garages.filter(g => !availableGarages.includes(g));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!garageId || !personName.trim() || !reason.trim() || !startTime || !endTime) {
      return showToast("Completá todos los campos requeridos", "error");
    }
    if (diffHours !== null && diffHours <= 0) {
      return showToast("La hora de fin debe ser posterior a la de inicio", "error");
    }
    if (diffHours !== null && diffHours > MAX_CORTESIA_HOURS) {
      return showToast(`Máximo ${MAX_CORTESIA_HOURS} horas`, "error");
    }
    setSubmitting(true);
    try {
      const created = await createCortesiaReservation(token, {
        garageId:     parseInt(garageId),
        personName:   personName.trim(),
        licensePlate: licensePlate.trim() || undefined,
        reason:       reason.trim(),
        startTime:    new Date(startTime).toISOString(),
        endTime:      new Date(endTime).toISOString(),
      });
      onCreated(created);
      showToast("Reserva de cortesía creada", "success");
      setShowForm(false);
      resetForm();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al crear reserva", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: number) => {
    setCancelling(id);
    try {
      await cancelCortesiaReservation(token, id);
      onCancelled(id);
      showToast("Reserva cancelada", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al cancelar", "error");
    } finally {
      setCancelling(null);
    }
  };

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("es-AR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const StatusBadge = ({ status }: { status: CortesiaReservation["status"] }) => {
    const map = {
      activa:    "bg-purple-100 text-purple-800",
      cancelada: "bg-red-100 text-red-800",
      vencida:   "bg-gray-100 text-gray-600",
    };
    const labels = { activa: "Activa", cancelada: "Cancelada", vencida: "Vencida" };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status]}`}>{labels[status]}</span>;
  };

  const isOccupiedNow = (r: CortesiaReservation) =>
    r.status === "activa" && new Date(r.startTime) <= now && new Date(r.endTime) >= now;

  const filtered = filterStatus === "all"
    ? reservations
    : reservations.filter(r => r.status === filterStatus);

  const activeCount = reservations.filter(r => r.status === "activa").length;

  return (
    <div className="p-6 space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { value: "activa",    label: `Activas${activeCount > 0 ? ` (${activeCount})` : ""}` },
            { value: "vencida",   label: "Vencidas" },
            { value: "cancelada", label: "Canceladas" },
            { value: "all",       label: "Todas" },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilterStatus(f.value)}
              className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                filterStatus === f.value
                  ? "bg-slate-800 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setShowForm(true); resetForm(); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-700 text-white rounded-xl text-sm font-medium hover:bg-purple-800 transition-colors cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Nueva reserva
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <motion.form
          onSubmit={handleSubmit}
          className="bg-purple-50 border border-purple-200 rounded-2xl p-5 space-y-4"
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-purple-600" />
            Nueva reserva de cortesía
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Garage */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Cochera <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={garageId}
                onChange={e => setGarageId(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 cursor-pointer bg-white"
                disabled={submitting}
              >
                <option value="">Seleccioná una cochera</option>
                {availableGarages.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.number}{g.location ? ` · ${g.location}` : ""}
                  </option>
                ))}
                {occupiedGarages.length > 0 && (
                  <optgroup label="Ocupadas en ese horario">
                    {occupiedGarages.map(g => (
                      <option key={g.id} value={g.id} disabled>
                        {g.number}{g.location ? ` · ${g.location}` : ""} — ocupada
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              {availableGarages.length === 0 && garages.length > 0 && (
                <p className="text-xs text-amber-600 mt-1">Todas las cocheras de cortesía están ocupadas en ese horario</p>
              )}
              {garages.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">No hay cocheras de cortesía activas disponibles</p>
              )}
            </div>

            {/* Person / company */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Persona / empresa <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={personName}
                onChange={e => setPersonName(e.target.value)}
                placeholder="Ej: Plomero Juan García"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                disabled={submitting}
              />
            </div>

            {/* License plate */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Patente <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                value={licensePlate}
                onChange={e => setLicensePlate(e.target.value.toUpperCase())}
                placeholder="Ej: AB123CD"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 font-mono"
                disabled={submitting}
              />
            </div>

            {/* Start time */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Inicio <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="datetime-local"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                disabled={submitting}
              />
            </div>

            {/* End time */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Fin <span className="text-red-500">*</span>
                {diffHours !== null && diffHours > 0 && (
                  <span className={`ml-2 font-normal ${diffHours > MAX_CORTESIA_HOURS ? "text-red-500" : "text-gray-400"}`}>
                    ({Math.round(diffHours * 10) / 10}h / máx {MAX_CORTESIA_HOURS}h)
                  </span>
                )}
              </label>
              <input
                required
                type="datetime-local"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                disabled={submitting}
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Motivo <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Ej: Reunión de propietarios, proveedor de mantenimiento, visita técnica..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
              disabled={submitting}
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
              disabled={submitting || garages.length === 0}
              className="flex-1 py-2.5 bg-purple-700 text-white rounded-xl text-sm font-medium hover:bg-purple-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Creando..." : "Crear reserva"}
            </button>
          </div>
        </motion.form>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Cargando reservas de cortesía...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hay reservas de cortesía{filterStatus !== "all" ? ` ${filterStatus}s` : ""}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Cochera", "Persona / Empresa", "Patente", "Motivo", "Inicio", "Fin", "Estado", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(r => (
                <tr
                  key={r.id}
                  className={`transition-colors ${isOccupiedNow(r) ? "bg-purple-50 hover:bg-purple-100" : "hover:bg-gray-50"}`}
                >
                  <td className="px-4 py-3 font-semibold text-gray-800">
                    <span className="flex items-center gap-1">
                      {isOccupiedNow(r) && <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse flex-shrink-0" />}
                      {r.garage.number}
                      {r.garage.location && <span className="text-gray-400 font-normal text-xs">· {r.garage.location}</span>}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-gray-700">
                      <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      {r.personName}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.licensePlate
                      ? <span className="font-mono font-semibold text-gray-800 bg-gray-100 px-2 py-1 rounded-lg">{r.licensePlate}</span>
                      : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 max-w-[220px]">
                    <span className="text-gray-600 text-xs line-clamp-2" title={r.reason}>{r.reason}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{fmt(r.startTime)}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{fmt(r.endTime)}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3">
                    {r.status === "activa" && (
                      <button
                        onClick={() => handleCancel(r.id)}
                        disabled={cancelling === r.id}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                        title="Cancelar reserva"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


interface VisitantesTabProps {
  visitorParkings: AdminVisitorParking[];
  loading:         boolean;
  visitorSearch:   string;
  setVisitorSearch: (v: string) => void;
}

function VisitantesTab({ visitorParkings, loading, visitorSearch, setVisitorSearch }: VisitantesTabProps) {
  const now = new Date();

  const filtered = visitorParkings.filter(vp => {
    if (!visitorSearch) return true;
    const q = visitorSearch.toLowerCase();
    return (
      vp.licensePlate.toLowerCase().includes(q) ||
      (vp.visitorName ?? "").toLowerCase().includes(q) ||
      vp.requestedBy.name.toLowerCase().includes(q) ||
      vp.apartment.unit.toLowerCase().includes(q) ||
      vp.garage.number.toLowerCase().includes(q)
    );
  });

  const occupiedNow = filtered.filter(vp =>
    vp.status === "activa" &&
    new Date(vp.startTime) <= now &&
    new Date(vp.endTime) >= now
  );

  const upcoming = filtered.filter(vp =>
    vp.status === "activa" && new Date(vp.startTime) > now
  );

  const past = filtered.filter(vp =>
    vp.status === "cancelada" || vp.status === "vencida"
  );

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("es-AR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const StatusBadge = ({ status }: { status: AdminVisitorParking["status"] }) => {
    const map = {
      activa:    "bg-green-100 text-green-800",
      cancelada: "bg-red-100 text-red-800",
      vencida:   "bg-gray-100 text-gray-600",
    };
    const labels = { activa: "Activa", cancelada: "Cancelada", vencida: "Vencida" };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const Row = ({ vp, highlight }: { vp: AdminVisitorParking; highlight?: boolean }) => (
    <tr className={`transition-colors ${highlight ? "bg-amber-50 hover:bg-amber-100" : "hover:bg-gray-50"}`}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {highlight && <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 animate-pulse" />}
          <span className="font-mono font-semibold text-gray-800 bg-gray-100 px-2 py-1 rounded-lg">
            {vp.licensePlate}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-gray-700">{vp.visitorName ?? <span className="text-gray-400">—</span>}</td>
      <td className="px-4 py-3">
        <span className="flex items-center gap-1 text-gray-700">
          <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          {vp.garage.number}
          {vp.garage.location && <span className="text-gray-400 text-xs">· {vp.garage.location}</span>}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="flex items-center gap-1 text-gray-700">
          <Building className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          Unidad {vp.apartment.unit} · P{vp.apartment.floor}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="flex items-center gap-1 text-gray-600">
          <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          {vp.requestedBy.name}
        </span>
      </td>
      <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{fmt(vp.startTime)}</td>
      <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{fmt(vp.endTime)}</td>
      <td className="px-4 py-3"><StatusBadge status={vp.status} /></td>
    </tr>
  );

  const TableShell = ({ children }: { children: React.ReactNode }) => (
    <div className="overflow-x-auto rounded-2xl border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {["Patente", "Visitante", "Cochera", "Unidad", "Solicitado por", "Desde", "Hasta", "Estado"].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">{children}</tbody>
      </table>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          placeholder="Buscar por patente, visitante, unidad, cochera o solicitante..."
          value={visitorSearch}
          onChange={e => setVisitorSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Cargando reservas de visitantes...</div>
      ) : visitorParkings.length === 0 ? (
        <div className="text-center py-16">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hay reservas de cocheras para visitantes</p>
        </div>
      ) : (
        <>
          {/* Currently occupied */}
          {occupiedNow.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h3 className="font-semibold text-gray-800 text-sm">Ocupadas ahora ({occupiedNow.length})</h3>
              </div>
              <TableShell>
                {occupiedNow.map(vp => <Row key={vp.id} vp={vp} highlight />)}
              </TableShell>
            </div>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Próximas reservas ({upcoming.length})
              </h3>
              <TableShell>
                {upcoming.map(vp => <Row key={vp.id} vp={vp} />)}
              </TableShell>
            </div>
          )}

          {/* Past / cancelled */}
          {past.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800 text-sm text-gray-500">
                Historial ({past.length})
              </h3>
              <TableShell>
                {past.map(vp => <Row key={vp.id} vp={vp} />)}
              </TableShell>
            </div>
          )}

          {filtered.length === 0 && visitorSearch && (
            <div className="text-center py-10 text-gray-400">Sin resultados para "{visitorSearch}"</div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Garage form modal (create / edit) ────────────────────────────────────────

interface FormModalProps {
  title:       string;
  form:        typeof EMPTY_GARAGE_FORM;
  setForm:     (f: typeof EMPTY_GARAGE_FORM) => void;
  apartments:  AdminApartment[];
  processing:  boolean;
  onSubmit:    (e: React.FormEvent) => void;
  onClose:     () => void;
}

function GarageFormModal({ title, form, setForm, apartments, processing, onSubmit, onClose }: FormModalProps) {
  const set = (k: keyof typeof EMPTY_GARAGE_FORM) => (v: string) =>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número <span className="text-red-500">*</span></label>
            <input
              required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              placeholder="Ej: C-01, P-12"
              value={form.number}
              onChange={e => set("number")(e.target.value)}
              disabled={processing}
            />
          </div>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 cursor-pointer"
                value={form.type}
                onChange={e => {
                  const newType = e.target.value;
                  setForm({ ...form, type: newType as GarageType, apartmentId: newType === "visitante" ? "" : form.apartmentId });
                }}
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
          {form.type !== "visitante" && (
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
                  <option key={a.id} value={a.id}>Unidad {a.unit} · Piso {a.floor}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer">
              Cancelar
            </button>
            <button type="submit" disabled={processing} className="flex-1 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50">
              {processing ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
