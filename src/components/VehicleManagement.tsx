import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, Search, X, Building, User, MapPin, Filter } from "lucide-react";
import { getAdminVehicles, type AdminVehicle } from "../api_calls/vehicles";
import { getAdminGarages, type AdminGarage } from "../api_calls/garages";
import { getAdminApartments, type AdminApartment } from "../api_calls/admin";

interface Props {
  isOpen:  boolean;
  onClose: () => void;
  token:   string;
}

const COLOR_DOT: Record<string, string> = {
  blanco:   "bg-gray-100 border border-gray-300",
  negro:    "bg-gray-900",
  gris:     "bg-gray-400",
  plateado: "bg-gray-300 border border-gray-400",
  rojo:     "bg-red-500",
  azul:     "bg-blue-500",
  verde:    "bg-green-500",
  amarillo: "bg-yellow-400",
  naranja:  "bg-orange-500",
};

const colorDot = (color: string) => {
  const key = color.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const cls = COLOR_DOT[key] ?? "bg-indigo-400";
  return <span className={`inline-block w-3 h-3 rounded-full ${cls} flex-shrink-0`} />;
};

export default function VehicleManagement({ isOpen, onClose, token }: Props) {
  const [vehicles,   setVehicles]   = useState<AdminVehicle[]>([]);
  const [garages,    setGarages]    = useState<AdminGarage[]>([]);
  const [apartments, setApartments] = useState<AdminApartment[]>([]);
  const [loading,    setLoading]    = useState(false);

  const [search,       setSearch]       = useState("");
  const [filterGarage, setFilterGarage] = useState("");
  const [filterApt,    setFilterApt]    = useState("");

  useEffect(() => {
    if (isOpen && token) {
      loadData();
    }
  }, [isOpen, token]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [v, g, a] = await Promise.all([
        getAdminVehicles(token),
        getAdminGarages(token),
        getAdminApartments(token),
      ]);
      setVehicles(Array.isArray(v) ? v : []);
      setGarages(Array.isArray(g) ? g : []);
      setApartments(Array.isArray(a) ? a : []);
    } catch {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    setLoading(true);
    try {
      const data = await getAdminVehicles(token, {
        garageId:     filterGarage ? parseInt(filterGarage) : undefined,
        apartmentId:  filterApt    ? parseInt(filterApt)    : undefined,
        licensePlate: search || undefined,
      });
      setVehicles(Array.isArray(data) ? data : []);
    } catch {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = vehicles.filter(v => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      v.licensePlate.toLowerCase().includes(q) ||
      v.brand.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      v.user?.name?.toLowerCase().includes(q) ||
      (v.user?.apartment?.unit ?? "").toLowerCase().includes(q)
    );
  });

  if (!isOpen) return null;

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
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-t-3xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Vehículos del Edificio</h2>
                <p className="text-gray-300 text-sm">{filtered.length} vehículos</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                  placeholder="Buscar por patente, marca, modelo o propietario..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <select
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
                value={filterGarage}
                onChange={e => setFilterGarage(e.target.value)}
              >
                <option value="">Todas las cocheras</option>
                {garages.map(g => (
                  <option key={g.id} value={g.id}>C-{g.number}</option>
                ))}
              </select>

              <select
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
                value={filterApt}
                onChange={e => setFilterApt(e.target.value)}
              >
                <option value="">Todas las unidades</option>
                {apartments.map(a => (
                  <option key={a.id} value={a.id}>Unidad {a.unit} · P{a.floor}</option>
                ))}
              </select>

              <button
                onClick={applyFilters}
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
            ) : filtered.length === 0 ? (
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
                    {filtered.map(v => (
                      <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono font-semibold text-gray-800 bg-gray-100 px-2 py-1 rounded-lg">
                            {v.licensePlate}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {v.brand} {v.model}
                        </td>
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
                          {v.user?.apartment ? (
                            <span className="flex items-center gap-1 text-gray-600">
                              <Building className="w-3.5 h-3.5 text-gray-400" />
                              Unidad {v.user.apartment.unit} · P{v.user.apartment.floor}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {v.garage ? (
                            <span className="flex items-center gap-1 text-gray-700">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                              {v.garage.number}
                              {v.garage.location && <span className="text-gray-400 text-xs">· {v.garage.location}</span>}
                            </span>
                          ) : (
                            <span className="text-gray-400">Sin cochera</span>
                          )}
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
