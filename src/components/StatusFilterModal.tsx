import { Clock, PlayCircle, CheckCircle, XCircle, Filter } from 'lucide-react';
import GenericFilterModal from './GenericFilterModal';
import type { FilterOption } from './GenericFilterModal';

interface StatusFilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedStatus: string;
  onStatusSelect: (status: string) => void;
}

const statusOptions: FilterOption[] = [
  { 
    value: 'all', 
    label: 'Todos los Estados', 
    icon: Filter,
    description: 'Ver todos los reclamos sin filtro'
  },
  { 
    value: 'pendiente', 
    label: 'Pendiente', 
    icon: Clock,
    description: 'Reclamos que están esperando revisión'
  },
  { 
    value: 'en_progreso', 
    label: 'En Progreso', 
    icon: PlayCircle,
    description: 'Reclamos que se están resolviendo actualmente'
  },
  { 
    value: 'resuelto', 
    label: 'Resuelto', 
    icon: CheckCircle,
    description: 'Reclamos que han sido completados'
  },
  { 
    value: 'rechazado', 
    label: 'Rechazado', 
    icon: XCircle,
    description: 'Reclamos que no pudieron ser procesados'
  }
];

function StatusFilterModal({ isVisible, onClose, selectedStatus, onStatusSelect }: StatusFilterModalProps) {
  return (
    <GenericFilterModal
      isVisible={isVisible}
      onClose={onClose}
      selectedValue={selectedStatus}
      onValueSelect={onStatusSelect}
      options={statusOptions}
      title="Filtrar por Estado"
      subtitle="Selecciona un estado para filtrar los reclamos"
      headerIcon={Filter}
      headerIconColor="text-blue-600"
      maxWidth="2xl"
    />
  );
}

export default StatusFilterModal;