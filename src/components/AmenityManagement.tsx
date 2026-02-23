import { useState } from "react";
import { Users, Clock, Edit3, Trash2, AlertTriangle } from "lucide-react";
import ManagementModal from "./ManagementModal";
import FormInput from "./FormInput";
import AdminTimePicker from "./AdminTimePicker";
import AmenitySuccessToast from "./AmenitySuccessToast";
import { 
    getAdminAmenities, 
    createAmenity, 
    updateAmenity, 
    deleteAmenity,
    type AdminAmenity
} from "../api_calls/admin";

interface AmenityManagementProps {
    isOpen: boolean;
    onClose: () => void;
    token: string;
}

const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
        return `${minutes} min`;
    } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
    }
};

function AmenityManagement({ isOpen, onClose, token }: AmenityManagementProps) {
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [toastAction, setToastAction] = useState<'created' | 'updated' | 'deleted'>('created');
    const [toastAmenityName, setToastAmenityName] = useState<string>('');
    const transformFormDataForCreate = (formData: any) => {
        const capacity = parseInt(formData.capacity);
        const maxDuration = parseInt(formData.maxDuration);
        
        if (!formData.name?.trim()) {
            throw new Error("El nombre es obligatorio");
        }
        if (isNaN(capacity) || capacity <= 0) {
            throw new Error("La capacidad debe ser un número positivo");
        }
        if (isNaN(maxDuration) || maxDuration <= 0) {
            throw new Error("La duración máxima debe ser un número positivo");
        }

        return {
            name: formData.name.trim(),
            capacity: capacity,
            maxDuration: maxDuration,
            openTime: formData.openTime || undefined,
            closeTime: formData.closeTime || undefined,
            isActive: formData.isActive,
            requiresApproval: formData.requiresApproval || false
        };
    };

    const transformFormDataForUpdate = (formData: any) => {
        const capacity = parseInt(formData.capacity);
        const maxDuration = parseInt(formData.maxDuration);
        
        if (!formData.name?.trim()) {
            throw new Error("El nombre es obligatorio");
        }
        if (isNaN(capacity) || capacity <= 0) {
            throw new Error("La capacidad debe ser un número positivo");
        }
        if (isNaN(maxDuration) || maxDuration <= 0) {
            throw new Error("La duración máxima debe ser un número positivo");
        }

        return {
            name: formData.name.trim(),
            capacity: capacity,
            maxDuration: maxDuration,
            openTime: formData.openTime || undefined,
            closeTime: formData.closeTime || undefined,
            isActive: formData.isActive,
            requiresApproval: formData.requiresApproval || false
        };
    };

    const createAmenityWithTransform = async (token: string, formData: any) => {
        const transformedData = transformFormDataForCreate(formData);
        return await createAmenity(token, transformedData);
    };

    const updateAmenityWithTransform = async (token: string, id: number, formData: any) => {
        const transformedData = transformFormDataForUpdate(formData);
        return await updateAmenity(token, id, transformedData);
    };
    const renderItem = (
        amenity: AdminAmenity, 
        onEdit: (item: AdminAmenity) => void, 
        onDelete: (id: number) => void
    ) => (
        <div className={`bg-white border rounded-2xl p-6 hover:shadow-lg transition-all duration-300 ${!amenity.isActive ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-800">{amenity.name}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                amenity.isActive 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {amenity.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                            {amenity.requiresApproval && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                                    Requiere Aprobación
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span>{amenity.capacity} personas</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span>{formatDuration(amenity.maxDuration)}</span>
                            </div>
                        </div>
                        {(amenity.openTime || amenity.closeTime) && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span>
                                    Horario: {amenity.openTime || '00:00'} - {amenity.closeTime || '23:59'}
                                </span>
                            </div>
                        )}
                        
                        {(amenity.activeReservationCount ?? amenity._count?.activeReservations ?? 0) > 0 && (
                            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                                <AlertTriangle className="w-4 h-4" />
                                <span>
                                    {amenity.activeReservationCount ?? amenity._count?.activeReservations} reserva(s) activa(s)
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(amenity)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Editar amenity"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(amenity.id)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                            (amenity.activeReservationCount ?? amenity._count?.activeReservations ?? 0) > 0
                                ? 'text-gray-400 hover:bg-gray-50 cursor-not-allowed opacity-50'
                                : 'text-red-600 hover:bg-red-50'
                        }`}
                        title={
                            (amenity.activeReservationCount ?? amenity._count?.activeReservations ?? 0) > 0
                                ? 'No se puede eliminar: tiene reservas activas'
                                : 'Eliminar amenity'
                        }
                        disabled={(amenity.activeReservationCount ?? amenity._count?.activeReservations ?? 0) > 0}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );

    const renderCreateForm = (
        formData: any, 
        setFormData: (data: any) => void, 
        onSubmit: (e: React.FormEvent) => void,
        processing: boolean
    ) => (
        <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Crear Nuevo Amenity</h3>
            <form onSubmit={onSubmit} className="space-y-4">
                <FormInput
                    label="Nombre"
                    placeholder="Ej: Piscina, Gimnasio, Salón de eventos"
                    value={formData.name}
                    onChange={(value) => setFormData({...formData, name: value})}
                    required
                    disabled={processing}
                />
                
                <FormInput
                    label="Capacidad"
                    placeholder="Número de personas"
                    value={formData.capacity}
                    onChange={(value) => setFormData({...formData, capacity: value})}
                    type="number"
                    min="1"
                    inputClassName="no-spinner"
                    required
                    disabled={processing}
                />
                
                <FormInput
                    label="Duración máxima (minutos)"
                    placeholder="Ej: 120"
                    value={formData.maxDuration}
                    onChange={(value) => setFormData({...formData, maxDuration: value})}
                    type="number"
                    min="15"
                    step="15"
                    inputClassName="no-spinner"
                    required
                    disabled={processing}
                />

                <div className="grid grid-cols-2 gap-4">
                    <AdminTimePicker
                        label="Hora de apertura"
                        placeholder="09:00"
                        value={formData.openTime}
                        onChange={(value) => setFormData({...formData, openTime: value})}
                        disabled={processing}
                    />
                    
                    <AdminTimePicker
                        label="Hora de cierre"
                        placeholder="22:00"
                        value={formData.closeTime}
                        onChange={(value) => setFormData({...formData, closeTime: value})}
                        disabled={processing}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="isActive-create"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                        className="w-4 h-4 text-cyan-600 border-2 border-gray-300 rounded focus:ring-cyan-500 focus:ring-2"
                        disabled={processing}
                    />
                    <label htmlFor="isActive-create" className="text-sm font-medium text-gray-700">
                        Amenity activo
                    </label>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="requiresApproval-create"
                        checked={formData.requiresApproval || false}
                        onChange={(e) => setFormData({...formData, requiresApproval: e.target.checked})}
                        className="w-4 h-4 text-amber-600 border-2 border-gray-300 rounded focus:ring-amber-500 focus:ring-2"
                        disabled={processing}
                    />
                    <label htmlFor="requiresApproval-create" className="text-sm font-medium text-gray-700">
                        Requiere aprobación del administrador
                        <span className="block text-xs text-gray-500 mt-1">
                            Si está marcado, las reservas necesitarán ser aprobadas por un admin antes de confirmarse
                        </span>
                    </label>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors disabled:opacity-50 cursor-pointer"
                        disabled={processing}
                    >
                        {processing ? 'Creando...' : 'Crear Amenity'}
                    </button>
                </div>
            </form>
        </div>
    );

    const renderEditForm = (
        item: AdminAmenity,
        formData: any, 
        setFormData: (data: any) => void, 
        onSubmit: (e: React.FormEvent) => void,
        processing: boolean
    ) => (
        <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Editar {item.name}</h3>
            <form onSubmit={onSubmit} className="space-y-4">
                <FormInput
                    label="Nombre"
                    placeholder="Nombre del amenity"
                    value={formData.name}
                    onChange={(value) => setFormData({...formData, name: value})}
                    required
                    disabled={processing}
                />
                
                <FormInput
                    label="Capacidad"
                    placeholder="Número de personas"
                    value={formData.capacity}
                    onChange={(value) => setFormData({...formData, capacity: value})}
                    type="number"
                    min="1"
                    inputClassName="no-spinner"
                    required
                    disabled={processing}
                />
                
                <FormInput
                    label="Duración máxima (minutos)"
                    placeholder="Ej: 120"
                    value={formData.maxDuration}
                    onChange={(value) => setFormData({...formData, maxDuration: value})}
                    type="number"
                    min="15"
                    step="15"
                    inputClassName="no-spinner"
                    required
                    disabled={processing}
                />

                <div className="grid grid-cols-2 gap-4">
                    <AdminTimePicker
                        label="Hora de apertura"
                        placeholder="09:00"
                        value={formData.openTime}
                        onChange={(value) => setFormData({...formData, openTime: value})}
                        disabled={processing}
                    />
                    
                    <AdminTimePicker
                        label="Hora de cierre"
                        placeholder="22:00"
                        value={formData.closeTime}
                        onChange={(value) => setFormData({...formData, closeTime: value})}
                        disabled={processing}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="isActive-edit"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                        className="w-4 h-4 text-cyan-600 border-2 border-gray-300 rounded focus:ring-cyan-500 focus:ring-2"
                        disabled={processing}
                    />
                    <label htmlFor="isActive-edit" className="text-sm font-medium text-gray-700">
                        Amenity activo
                    </label>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="requiresApproval-edit"
                        checked={formData.requiresApproval || false}
                        onChange={(e) => setFormData({...formData, requiresApproval: e.target.checked})}
                        className="w-4 h-4 text-amber-600 border-2 border-gray-300 rounded focus:ring-amber-500 focus:ring-2"
                        disabled={processing}
                    />
                    <label htmlFor="requiresApproval-edit" className="text-sm font-medium text-gray-700">
                        Requiere aprobación del administrador
                        <span className="block text-xs text-gray-500 mt-1">
                            Si está marcado, las reservas necesitarán ser aprobadas por un admin antes de confirmarse
                        </span>
                    </label>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors disabled:opacity-50 cursor-pointer"
                        disabled={processing}
                    >
                        {processing ? 'Actualizando...' : 'Actualizar Amenity'}
                    </button>
                </div>
            </form>
        </div>
    );
    
    const handleCreateSuccess = (amenity: AdminAmenity) => {
        setToastAction('created');
        setToastAmenityName(amenity.name);
        setShowSuccessToast(true);
    };

    const handleUpdateSuccess = (amenity: AdminAmenity) => {
        setToastAction('updated');
        setToastAmenityName(amenity.name);
        setShowSuccessToast(true);
    };

    const handleDeleteSuccess = (deletedId: number) => {
        console.log(`Deleted amenity with ID: ${deletedId}`);
        setToastAction('deleted');
        setToastAmenityName('');
        setShowSuccessToast(true);
    };

    const handleToastComplete = () => {
        setShowSuccessToast(false);
        setToastAmenityName('');
    };

    return (
        <>
            <AmenitySuccessToast
                isVisible={showSuccessToast}
                onComplete={handleToastComplete}
                amenityName={toastAmenityName}
                action={toastAction}
            />
            
            <ManagementModal<AdminAmenity>
                title="Amenity"
                isOpen={isOpen}
                onClose={onClose}
                token={token}
                loadItems={getAdminAmenities}
                createItem={createAmenityWithTransform}
                updateItem={updateAmenityWithTransform}
                deleteItem={deleteAmenity}
                renderItem={renderItem}
                renderCreateForm={renderCreateForm}
                renderEditForm={renderEditForm}
                searchFields={['name']}
                initialFormData={{ 
                    name: "", 
                    capacity: "", 
                    maxDuration: "", 
                    openTime: "", 
                    closeTime: "", 
                    isActive: true,
                    requiresApproval: false
                }}
                getFormDataFromItem={(amenity) => ({
                    name: amenity.name,
                    capacity: amenity.capacity.toString(),
                    maxDuration: amenity.maxDuration.toString(),
                    openTime: amenity.openTime || "",
                    closeTime: amenity.closeTime || "",
                    isActive: amenity.isActive ?? true,
                    requiresApproval: amenity.requiresApproval ?? false
                })}
                createButtonText="Crear Amenity"
                emptyStateMessage="No hay amenities registrados"
                onCreateSuccess={handleCreateSuccess}
                onUpdateSuccess={handleUpdateSuccess}
                onDeleteSuccess={handleDeleteSuccess}
            />
        </>
    );
}

export default AmenityManagement;