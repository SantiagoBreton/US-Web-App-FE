import { BarChart3 } from 'lucide-react';
import GenericFilterModal from './GenericFilterModal';
import type { FilterOption } from './GenericFilterModal';

interface AmenityFilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedAmenity: string;
  onAmenitySelect: (amenity: string) => void;
  availableAmenities: Array<{id: number, name: string}>;
}

function AmenityFilterModal({ 
  isVisible, 
  onClose, 
  selectedAmenity, 
  onAmenitySelect, 
  availableAmenities 
}: AmenityFilterModalProps) {
  
  const amenityOptions: FilterOption[] = [
    { 
      value: 'all', 
      label: 'Todas las Amenities', 
      icon: BarChart3,
      description: 'Ver análisis de todas las amenities'
    },
    ...availableAmenities.map(amenity => ({
      value: amenity.name,
      label: amenity.name,
      icon: BarChart3,
      description: `Ver análisis específico de ${amenity.name}`
    }))
  ];

  return (
    <GenericFilterModal
      isVisible={isVisible}
      onClose={onClose}
      selectedValue={selectedAmenity}
      onValueSelect={onAmenitySelect}
      options={amenityOptions}
      title="Filtrar por Amenity"
      subtitle="Selecciona una amenity para ver análisis específico"
      headerIcon={BarChart3}
      headerIconColor="text-blue-600"
      maxWidth="2xl"
    />
  );
}

export default AmenityFilterModal;