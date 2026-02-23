import { Users, User, Globe, Filter } from 'lucide-react';
import GenericFilterModal from './GenericFilterModal';
import type { FilterOption } from './GenericFilterModal';

interface OwnershipFilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedOwnership: 'all' | 'mine' | 'others';
  onOwnershipSelect: (ownership: 'all' | 'mine' | 'others') => void;
}

const ownershipOptions: FilterOption[] = [
  { 
    value: 'all', 
    label: 'Todos los Reclamos', 
    icon: Globe,
    description: 'Ver todos los reclamos de la comunidad'
  },
  { 
    value: 'mine', 
    label: 'Mis Reclamos', 
    icon: User,
    description: 'Solo los reclamos que he creado'
  },
  { 
    value: 'others', 
    label: 'Reclamos de Otros', 
    icon: Users,
    description: 'Reclamos creados por otros usuarios'
  }
];

function OwnershipFilterModal({ isVisible, onClose, selectedOwnership, onOwnershipSelect }: OwnershipFilterModalProps) {
  const handleSelect = (ownership: string) => {
    onOwnershipSelect(ownership as 'all' | 'mine' | 'others');
  };

  return (
    <GenericFilterModal
      isVisible={isVisible}
      onClose={onClose}
      selectedValue={selectedOwnership}
      onValueSelect={handleSelect}
      options={ownershipOptions}
      title="Filtrar por Propiedad"
      subtitle="Selecciona qué reclamos ver"
      headerIcon={Filter}
      headerIconColor="text-gray-600"
      maxWidth="2xl"
    />
  );
}

export default OwnershipFilterModal;