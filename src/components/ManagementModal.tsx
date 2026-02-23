import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, X } from "lucide-react";
import { useToast } from "./Toast";

interface BaseItem {
  id: number;
  [key: string]: any;
}

interface ManagementModalProps<T extends BaseItem> {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  token: string;
  
  loadItems: (token: string) => Promise<T[]>;
  createItem: (token: string, data: any) => Promise<T>;
  updateItem: (token: string, id: number, data: any) => Promise<T>;
  deleteItem: (token: string, id: number) => Promise<void>;
  
  renderItem: (item: T, onEdit: (item: T) => void, onDelete: (id: number) => void) => React.ReactNode;
  renderCreateForm: (formData: any, setFormData: (data: any) => void, onSubmit: (e: React.FormEvent) => void, processing: boolean) => React.ReactNode;
  renderEditForm: (item: T, formData: any, setFormData: (data: any) => void, onSubmit: (e: React.FormEvent) => void, processing: boolean) => React.ReactNode;
  
  searchFields: (keyof T)[];
  initialFormData: any;
  getFormDataFromItem: (item: T) => any;
  
  additionalFilters?: React.ReactNode;
  customFilter?: (items: T[], searchTerm: string, filters?: any) => T[];
  emptyStateMessage?: string;
  createButtonText?: string;
  
  createSuccessMessage?: string;
  updateSuccessMessage?: string;
  deleteSuccessMessage?: string;
  
  onCreateSuccess?: (item: T) => void;
  onUpdateSuccess?: (item: T) => void;
  onDeleteSuccess?: (deletedId: number) => void;
}

function ManagementModal<T extends BaseItem>({
  title,
  isOpen,
  onClose,
  token,
  loadItems,
  createItem,
  updateItem,
  deleteItem,
  renderItem,
  renderCreateForm,
  renderEditForm,
  searchFields,
  initialFormData,
  getFormDataFromItem,
  additionalFilters,
  customFilter,
  emptyStateMessage = "No hay elementos para mostrar",
  createButtonText = "Crear Nuevo",
  createSuccessMessage,
  updateSuccessMessage,
  deleteSuccessMessage,
  onCreateSuccess,
  onUpdateSuccess,
  onDeleteSuccess
}: ManagementModalProps<T>) {
  const { showToast } = useToast();
  const [items, setItems] = useState<T[]>([]);
  const [filteredItems, setFilteredItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);
  const [processing, setProcessing] = useState(false);
  
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    const loadAllItems = async () => {
      setLoading(true);
      try {
        const itemsData = await loadItems(token);
        setItems(Array.isArray(itemsData) ? itemsData : []);
      } catch (error) {
        console.error("Error loading items:", error);
        setItems([]);
        showToast(`Error al cargar ${title.toLowerCase()}`, "error");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && token) {
      loadAllItems();
    }
  }, [isOpen, token, loadItems, showToast, title]);

  useEffect(() => {
    let filtered = items;

    if (customFilter) {
      filtered = customFilter(items, searchTerm);
    } else if (searchTerm) {
      filtered = items.filter(item => 
        searchFields.some(field => 
          String(item[field] || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredItems(filtered);
  }, [items, searchTerm, customFilter, searchFields]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const newItem = await createItem(token, formData);
      const itemsData = await loadItems(token);
      setItems(Array.isArray(itemsData) ? itemsData : []);
      
      if (onCreateSuccess) {
        onCreateSuccess(newItem);
      } else {
        showToast(createSuccessMessage || `${title} creado exitosamente`, "success");
      }
      
      setShowCreateModal(false);
      setFormData(initialFormData);
    } catch (error) {
      console.error("Error creating item:", error);
      const errorMessage = error instanceof Error ? error.message : `Error al crear ${title.toLowerCase()}`;
      showToast(errorMessage, "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setProcessing(true);

    try {
      const updatedItem = await updateItem(token, selectedItem.id, formData);
      const itemsData = await loadItems(token);
      setItems(Array.isArray(itemsData) ? itemsData : []);
      
      if (onUpdateSuccess) {
        onUpdateSuccess(updatedItem);
      } else {
        showToast(updateSuccessMessage || `${title} actualizado exitosamente`, "success");
      }
      
      setShowEditModal(false);
      setSelectedItem(null);
      setFormData(initialFormData);
    } catch (error) {
      console.error("Error updating item:", error);
      const errorMessage = error instanceof Error ? error.message : `Error al actualizar ${title.toLowerCase()}`;
      showToast(errorMessage, "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteItem(token, itemToDelete.id);
      setItems(prev => prev.filter(item => item.id !== itemToDelete.id));

      if (onDeleteSuccess) {
        onDeleteSuccess(itemToDelete.id);
      } else {
        showToast(deleteSuccessMessage || `${title} eliminado exitosamente`, "success");
      }
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Error deleting item:", error);
      
      let errorMessage = `Error al eliminar ${title.toLowerCase()}`;
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (message.includes('reservas activas') || message.includes('active reservations')) {
          errorMessage = `No se puede eliminar este ${title.toLowerCase()} porque tiene reservas activas. Cancela las reservas primero.`;
        } else if (message.includes('reservas') || message.includes('reservations')) {
          errorMessage = `No se puede eliminar este ${title.toLowerCase()} porque tiene reservas asociadas.`;
        } else if (message.includes('acceso denegado') || message.includes('access denied')) {
          errorMessage = `No tienes permisos para eliminar este ${title.toLowerCase()}.`;
        } else if (message.includes('no encontrado') || message.includes('not found')) {
          errorMessage = `El ${title.toLowerCase()} no existe o ya fue eliminado.`;
        } else {
          errorMessage = error.message;
        }
      }
      
      showToast(errorMessage, "error");
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const openCreateModal = () => {
    setFormData(initialFormData);
    setShowCreateModal(true);
  };

  const openEditModal = (item: T) => {
    setSelectedItem(item);
    setFormData(getFormDataFromItem(item));
    setShowEditModal(true);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl max-w-7xl max-h-[90vh] w-full mx-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Gestión de {title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex h-full max-h-[calc(90vh-80px)]">
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* Controls */}
              <div className="p-6 border-b border-gray-200 space-y-4">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder={`Buscar ${title.toLowerCase()}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <Plus className="w-5 h-5" />
                    {createButtonText}
                  </button>
                </div>
                {additionalFilters}
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Cargando...</p>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">{emptyStateMessage}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredItems.map(item => (
                      <div key={item.id}>
                        {renderItem(item, openEditModal, handleDelete)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center backdrop-blur-sm bg-black/20"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {renderCreateForm(formData, setFormData, handleCreate, processing)}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center backdrop-blur-sm bg-black/20"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {renderEditForm(selectedItem, formData, setFormData, handleEdit, processing)}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && itemToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center backdrop-blur-sm bg-black/20"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Confirmar Eliminación
                </h3>
                <p className="text-gray-600 mb-6">
                  ¿Estás seguro de que quieres eliminar este {title.toLowerCase()}? Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}

export default ManagementModal;