import { AlertTriangle, Wrench, Droplets, Zap, Wind, Users, Building } from 'lucide-react';
import GenericFilterModal from './GenericFilterModal';
import type { FilterOption } from './GenericFilterModal';

interface CategoryFilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

const categoryOptions: FilterOption[] = [
  { 
    value: 'all', 
    label: 'Todas las Categorías', 
    icon: AlertTriangle,
    description: 'Ver todos los reclamos sin filtro de categoría'
  },
  { 
    value: 'ascensor', 
    label: 'Ascensor', 
    icon: Wrench,
    description: 'Problemas relacionados con el ascensor'
  },
  { 
    value: 'plomeria', 
    label: 'Plomería', 
    icon: Droplets,
    description: 'Problemas de tuberías, filtraciones y agua'
  },
  { 
    value: 'electricidad', 
    label: 'Eléctrico', 
    icon: Zap,
    description: 'Problemas eléctricos e iluminación'
  },
  { 
    value: 'temperatura', 
    label: 'Calefacción/Aire', 
    icon: Wind,
    description: 'Problemas de climatización y ventilación'
  },
  { 
    value: 'areas_comunes', 
    label: 'Áreas Comunes', 
    icon: Users,
    description: 'Problemas en espacios compartidos'
  },
  { 
    value: 'edificio', 
    label: 'Edificio', 
    icon: Building,
    description: 'Problemas estructurales del edificio'
  },
  { 
    value: 'otro', 
    label: 'Otros', 
    icon: AlertTriangle,
    description: 'Otros tipos de reclamos'
  }
];

function CategoryFilterModal({ isVisible, onClose, selectedCategory, onCategorySelect }: CategoryFilterModalProps) {
  return (
    <GenericFilterModal
      isVisible={isVisible}
      onClose={onClose}
      selectedValue={selectedCategory}
      onValueSelect={onCategorySelect}
      options={categoryOptions}
      title="Filtrar por Categoría"
      subtitle="Selecciona una categoría para filtrar los reclamos"
      headerIcon={AlertTriangle}
      headerIconColor="text-blue-600"
      maxWidth="2xl"
    />
  );
}

export default CategoryFilterModal;