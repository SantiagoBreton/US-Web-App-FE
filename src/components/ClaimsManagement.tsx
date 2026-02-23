import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  AlertTriangle,
  Wrench,
  Droplets,
  Zap,
  Wind,
  Users,
  Building,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  PlayCircle,
  XCircle,
  User,
  Calendar,
  CalendarDays,
  Filter,
  ChevronDown,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Send,
  ExternalLink,
  Plus
} from 'lucide-react';
import {
  getAdminClaims,
  updateClaimStatus,
  deleteAdminClaim,
  linkClaimToProjectFlowTask,
  type Claim
} from '../api_calls/claims';
import { createProjectFlowTask, createProjectFlowSubTask, updateProjectFlowTask, getProjectFlowTask, deleteProjectFlowTask, type TaskStatus } from '../api_calls/projectFlow';
import ClaimSuccessToast from './ClaimSuccessToast';
import ClaimErrorToast from './ClaimErrorToast';
import CategoryFilterModal from './CategoryFilterModal';
import StatusFilterModal from './StatusFilterModal';
import DateFilterModal, { type DateFilterOption } from './DateFilterModal';
import UserBadge from './UserBadge';
import ExportToProjectFlowModal from './ExportToProjectFlowModal';
import ProjectFlowTaskCreatedToast from './ProjectFlowTaskCreatedToast';
import CreateSubTaskModal from './CreateSubTaskModal';
import SubTaskCreatedToast from './SubTaskCreatedToast';
import ProjectFlowTaskDetailsModal from './ProjectFlowTaskDetailsModal';

interface ClaimsManagementProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
}

const categoryIcons = {
  ascensor: Wrench,
  plomeria: Droplets,
  electricidad: Zap,
  temperatura: Wind,
  areas_comunes: Users,
  edificio: Building,
  otro: AlertTriangle
};

const categoryLabels = {
  ascensor: 'Ascensor',
  plomeria: 'Plomería',
  electricidad: 'Eléctrico',
  temperatura: 'Calefacción/Aire',
  areas_comunes: 'Áreas Comunes',
  edificio: 'Edificio',
  otro: 'Otros'
};

const priorityColors = {
  baja: 'bg-blue-100 text-blue-800 border-blue-200',
  media: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  alta: 'bg-orange-100 text-orange-800 border-orange-200',
  urgente: 'bg-red-100 text-red-800 border-red-200'
};



const statusColors = {
  pendiente: 'bg-gray-100 text-gray-800 border-gray-200',
  en_progreso: 'bg-blue-100 text-blue-800 border-blue-200',
  resuelto: 'bg-green-100 text-green-800 border-green-200',
  rechazado: 'bg-red-100 text-red-800 border-red-200'
};

const statusLabels = {
  pendiente: 'Pendiente',
  en_progreso: 'En Progreso',
  resuelto: 'Resuelto',
  rechazado: 'Rechazado'
};

const statusIcons = {
  pendiente: Clock,
  en_progreso: PlayCircle,
  resuelto: CheckCircle,
  rechazado: XCircle
};

function ClaimsManagement({ isOpen, onClose, token }: ClaimsManagementProps) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');
  const [dateFilterOption, setDateFilterOption] = useState<DateFilterOption | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClaims, setTotalClaims] = useState(0);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [claimToDelete, setClaimToDelete] = useState<Claim | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showStatusFilterModal, setShowStatusFilterModal] = useState(false);
  const [showDateFilterModal, setShowDateFilterModal] = useState(false);
  const [claimToUpdateStatus, setClaimToUpdateStatus] = useState<Claim | null>(null);
  
  const [showExportModal, setShowExportModal] = useState(false);
  const [claimToExport, setClaimToExport] = useState<Claim | null>(null);
  const [showTaskCreatedToast, setShowTaskCreatedToast] = useState(false);
  const [createdTaskTitle, setCreatedTaskTitle] = useState<string>('');
  const [createdTaskId, setCreatedTaskId] = useState<string>('');
  
  const [showSubTaskModal, setShowSubTaskModal] = useState(false);
  const [showSubTaskCreatedToast, setShowSubTaskCreatedToast] = useState(false);
  const [createdSubTaskTitle, setCreatedSubTaskTitle] = useState<string>('');
  
  const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [selectedClaimForTask, setSelectedClaimForTask] = useState<Claim | null>(null);
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastAction, setToastAction] = useState<'created' | 'updated' | 'deleted'>('created');
  const [toastSubject, setToastSubject] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const getCurrentCategoryLabel = () => {
    if (selectedCategory === 'all') return 'Todas las categorías';
    return categoryLabels[selectedCategory as keyof typeof categoryLabels];
  };

  const getCurrentStatusLabel = () => {
    if (selectedStatus === 'all') return 'Todos los estados';
    return statusLabels[selectedStatus as keyof typeof statusLabels];
  };

  const getCurrentDateLabel = () => {
    if (!dateFilterOption || filterDate === 'all') return 'Todas las fechas';
    return dateFilterOption.label;
  };

  const handleDateFilterSelect = (option: DateFilterOption) => {
    setFilterDate(option.value);
    setDateFilterOption(option);
  };

  const loadClaims = useCallback(async () => {
    try {
      console.log(' [CLAIMS LOAD DEBUG] Loading claims...');
      setLoading(true);
      const response = await getAdminClaims(token, {
        page: currentPage,
        limit: 10,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        search: searchTerm || undefined
      });
      
      console.log(' [CLAIMS LOAD DEBUG] Loaded claims:', response.claims.length);
      response.claims.forEach(claim => {
        if (claim.adminNotes) {
          console.log(` [CLAIMS LOAD DEBUG] Claim ${claim.id} has adminNotes:`, claim.adminNotes);
        }
      });

      const sortedClaims = response.claims.sort((a, b) => {

        const aFinalized = a.status?.name === 'resuelto' || a.status?.name === 'rechazado';
        const bFinalized = b.status?.name === 'resuelto' || b.status?.name === 'rechazado';
        
        if (aFinalized && !bFinalized) return 1;
        if (!aFinalized && bFinalized) return -1;

        const aOpinionCount = (a.adhesion_counts?.support || 0) + (a.adhesion_counts?.disagree || 0);
        const bOpinionCount = (b.adhesion_counts?.support || 0) + (b.adhesion_counts?.disagree || 0);
        
        if (aOpinionCount !== bOpinionCount) {
          return bOpinionCount - aOpinionCount;
        }

        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
      
      setClaims(sortedClaims);
      setTotalClaims(response.total);
      setTotalPages(Math.ceil(response.total / 10));
    } catch (error) {
      console.error('Error loading claims:', error);
      setErrorMessage('Error al cargar los reclamos');
      setShowErrorToast(true);
    } finally {
      setLoading(false);
    }
  }, [token, currentPage, selectedCategory, selectedStatus, searchTerm]);

  useEffect(() => {
    if (isOpen) {
      loadClaims();
    }
  }, [isOpen, loadClaims]);

  useEffect(() => {
    if (claims.length === 0) {
      setFilteredClaims([]);
      return;
    }

    let filtered = claims;

    if (dateFilterOption && dateFilterOption.value !== 'all') {
      const now = new Date();
      let startDate: Date | null = null;
      let endDate: Date | null = null;

      switch (dateFilterOption.value) {
        case 'today': {
          startDate = new Date(now.setHours(0, 0, 0, 0));
          endDate = new Date(now.setHours(23, 59, 59, 999));
          break;
        }
        case 'yesterday': {
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          startDate = new Date(yesterday.setHours(0, 0, 0, 0));
          endDate = new Date(yesterday.setHours(23, 59, 59, 999));
          break;
        }
        case 'this-week': {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startDate = new Date(startOfWeek.setHours(0, 0, 0, 0));
          endDate = new Date(now.setHours(23, 59, 59, 999));
          break;
        }
        case 'last-7-days': {
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 7);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now.setHours(23, 59, 59, 999));
          break;
        }
        case 'this-month': {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
          break;
        }
        case 'last-30-days': {
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 30);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now.setHours(23, 59, 59, 999));
          break;
        }
        case 'custom': {
          if (dateFilterOption.startDate && dateFilterOption.endDate) {
            startDate = new Date(dateFilterOption.startDate);
            endDate = new Date(dateFilterOption.endDate);
            endDate.setHours(23, 59, 59, 999);
          }
          break;
        }
        default:
          break;
      }

      if (startDate && endDate) {
        console.log(' [CLAIMS DATE FILTER DEBUG] Filtering claims with date range:', {
          filterOption: dateFilterOption.value,
          startDate,
          endDate
        });
        
        filtered = filtered.filter(claim => {
          const claimDate = new Date(claim.createdAt);
          claimDate.setHours(0, 0, 0, 0);
          
          const normalizedStartDate = new Date(startDate!);
          normalizedStartDate.setHours(0, 0, 0, 0);
          
          const normalizedEndDate = new Date(endDate!);
          normalizedEndDate.setHours(23, 59, 59, 999);
          
          const isInRange = claimDate >= normalizedStartDate && claimDate <= normalizedEndDate;
          
          if (dateFilterOption.value === 'custom') {
            console.log(' [CUSTOM CLAIMS FILTER] Checking claim:', {
              claimId: claim.id,
              createdAt: claim.createdAt,
              normalizedClaimDate: claimDate,
              filterStartDate: normalizedStartDate,
              filterEndDate: normalizedEndDate,
              isInRange
            });
          }
          
          return isInRange;
        });
        
        console.log(` [CLAIMS DATE FILTER DEBUG] Filtered to ${filtered.length} claims`);
      }
    }

    setFilteredClaims(filtered);
  }, [claims, dateFilterOption]);

  const handleStatusUpdate = async (claim: Claim, newStatus: string, adminNotes?: string) => {
    try {
      console.log('📝 [ADMIN NOTES DEBUG] Updating claim:', claim.id);
      console.log('📝 [ADMIN NOTES DEBUG] New status:', newStatus);
      console.log('📝 [ADMIN NOTES DEBUG] Admin notes:', adminNotes);
      
      setIsUpdatingStatus(true);
      const updatedClaim = await updateClaimStatus(token, claim.id, newStatus as any, adminNotes);
      
      console.log('📝 [ADMIN NOTES DEBUG] Updated claim response:', updatedClaim);
      
      
      if (claim.projectFlowTaskId) {
        try {
          let projectFlowStatus: TaskStatus = 'TODO';
          

          switch (newStatus) {
            case 'pendiente':
              projectFlowStatus = 'TODO';
              break;
            case 'en_progreso':
              projectFlowStatus = 'IN_PROGRESS';
              break;
            case 'resuelto':
              projectFlowStatus = 'DONE';
              break;
            case 'rechazado':
              projectFlowStatus = 'CANCELLED';
              break;
          }
          
          await updateProjectFlowTask(token, claim.projectFlowTaskId, { status: projectFlowStatus });
          console.log('✅ Estado sincronizado con ProjectFlow:', projectFlowStatus);


          if (newStatus === 'resuelto') {
            try {
              const taskDetails = await getProjectFlowTask(token, claim.projectFlowTaskId);
              if (taskDetails.subTasks && taskDetails.subTasks.length > 0) {
                console.log('🔄 Completando', taskDetails.subTasks.length, 'subtareas...');
                

                await Promise.all(
                  taskDetails.subTasks
                    .filter(subTask => subTask.status !== 'DONE')
                    .map(subTask => 
                      updateProjectFlowTask(token, subTask.id, { status: 'DONE' })
                        .catch(err => console.error('⚠️ Error al completar subtarea:', subTask.id, err))
                    )
                );
                
                console.log('✅ Todas las subtareas completadas');
              }
            } catch (subTaskError) {
              console.error('⚠️ Error al completar subtareas (no crítico):', subTaskError);
            }
          }
        } catch (pfError) {
          console.error('⚠️ Error al sincronizar con ProjectFlow (no crítico):', pfError);
        }
      }
      
      await loadClaims();
      setToastAction('updated');
      setToastSubject(claim.subject);
      setShowSuccessToast(true);
      setShowStatusModal(false);
      setClaimToUpdateStatus(null);
    } catch (error: any) {
      console.error('❌ [ADMIN NOTES DEBUG] Error updating claim:', error);
      setErrorMessage(error.message || 'Error al actualizar el estado');
      setShowErrorToast(true);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async (deleteProjectFlowTaskOption: boolean) => {
    if (!claimToDelete) return;
    
    try {
      setIsDeleting(true);
      
      await deleteAdminClaim(token, claimToDelete.id);
      
      // Si el usuario eligió eliminar la tarea de ProjectFlow y existe
      if (deleteProjectFlowTaskOption && claimToDelete.projectFlowTaskId) {
        try {
          await deleteProjectFlowTask(token, claimToDelete.projectFlowTaskId);
        } catch (error) {
          console.error('Error al eliminar tarea de ProjectFlow:', error);
        }
      }
      
      await loadClaims();
      setToastAction('deleted');
      setToastSubject(claimToDelete.subject);
      setShowSuccessToast(true);
      setShowDeleteModal(false);
      setClaimToDelete(null);
    } catch (error: any) {
      setErrorMessage(error.message || 'Error al eliminar el reclamo');
      setShowErrorToast(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportClick = (claim: Claim) => {
    setClaimToExport(claim);
    setShowExportModal(true);
  };

  const handleExport = async (title: string, description: string, deadline: string) => {
    if (!claimToExport) return;

    try {
      const task = await createProjectFlowTask(token, {
        title,
        description,
        deadline
      });
      

      await linkClaimToProjectFlowTask(token, claimToExport.id, task.id);
      

      setCreatedTaskId(task.id);
      setCreatedTaskTitle(title);
      setShowExportModal(false);
      setShowTaskCreatedToast(true);
      setClaimToExport(null);
      

      loadClaims();
    } catch (error: any) {
      setErrorMessage(error.message || 'Error al exportar a Project Flow');
      setShowErrorToast(true);
    }
  };

  const handleOpenSubTaskModal = () => {
    setShowSubTaskModal(true);
  };

  const handleCreateSubTask = async (title: string, description: string, deadline: string) => {
    if (!createdTaskId) return;

    try {
      await createProjectFlowSubTask(token, createdTaskId, {
        title,
        description,
        deadline
      });
      
      setCreatedSubTaskTitle(title);
      setShowSubTaskModal(false);
      setShowSubTaskCreatedToast(true);
    } catch (error: any) {
      setErrorMessage(error.message || 'Error al crear subtarea');
      setShowErrorToast(true);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-xl w-[1400px] max-w-[95vw] h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Gestión de Reclamos
                </h2>
                <p className="text-sm text-gray-500">
                  {totalClaims} reclamos en total
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Controls */}
          <div className="flex-shrink-0 p-6 border-b border-gray-100">
            <div className="flex gap-4 items-center">
              {/* Search */}
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar reclamos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2 ml-auto">
                {/* Category Filter Button */}
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="flex items-center justify-between px-4 py-2 border border-gray-200 rounded-xl hover:border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-left cursor-pointer min-w-[180px]"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <span className={selectedCategory === 'all' ? 'text-gray-500' : 'text-gray-900 font-medium'}>
                      {getCurrentCategoryLabel()}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {/* Status Filter Button */}
                <button
                  onClick={() => setShowStatusFilterModal(true)}
                  className="flex items-center justify-between px-4 py-2 border border-gray-200 rounded-xl hover:border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-left cursor-pointer min-w-[160px]"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <span className={selectedStatus === 'all' ? 'text-gray-500' : 'text-gray-900 font-medium'}>
                      {getCurrentStatusLabel()}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {/* Date Filter Button */}
                <button
                  onClick={() => setShowDateFilterModal(true)}
                  className="flex items-center justify-between px-4 py-2 border border-gray-200 rounded-xl hover:border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-left cursor-pointer min-w-[180px]"
                >
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-gray-400" />
                    <span className={!dateFilterOption || dateFilterOption.value === 'all' ? 'text-gray-500' : 'text-gray-900 font-medium'}>
                      {getCurrentDateLabel()}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
              </div>


            </div>
          </div>

          {/* Claims List */}
          <div className="flex-1 overflow-y-auto p-6 min-h-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : filteredClaims.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay reclamos
                </h3>
                <p className="text-gray-500">
                  No se encontraron reclamos con los filtros actuales.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredClaims.map((claim, index) => {
                  const CategoryIcon = categoryIcons[claim.category?.name as keyof typeof categoryIcons] || AlertTriangle;
                  const StatusIcon = statusIcons[claim.status?.name as keyof typeof statusIcons] || CheckCircle;
                  
                  // Ensure we have a valid key - use index as fallback if claim.id is missing
                  const claimKey = claim.id ? `claim-${claim.id}` : `claim-index-${index}`;
                  
                  return (
                    <motion.div
                      key={claimKey}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                        {/* Category Icon */}
                        <div className={`self-start p-2 rounded-xl flex-shrink-0 ${
                          claim.category?.name === 'ascensor' ? 'bg-purple-100 text-purple-600' :
                          claim.category?.name === 'plomeria' ? 'bg-blue-100 text-blue-600' :
                          claim.category?.name === 'electricidad' ? 'bg-yellow-100 text-yellow-600' :
                          claim.category?.name === 'temperatura' ? 'bg-green-100 text-green-600' :
                          claim.category?.name === 'areas_comunes' ? 'bg-indigo-100 text-indigo-600' :
                          claim.category?.name === 'edificio' ? 'bg-gray-100 text-gray-600' :
                          'bg-orange-100 text-orange-600'
                        }`}>
                          <CategoryIcon className="w-5 h-5" />
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900 break-words flex-1">
                                  {claim.subject}
                                </h3>
                                {/* User gamification badge in top-right */}
                                {claim.user && (
                                  <div className="flex-shrink-0">
                                    <UserBadge
                                      gamification={claim.user.gamification}
                                      userName={claim.createdBy}
                                      size="sm"
                                      showName={false}
                                    />
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2 break-words">
                                {claim.description}
                              </p>
                              
                              {/* Admin Notes Comment Section */}
                              {claim.adminNotes && (
                                <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 rounded-r-lg">
                                  <div className="flex items-start gap-2">
                                    <div className="flex-shrink-0">
                                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                        <MessageSquare className="w-3 h-3 text-white" />
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-semibold text-blue-800">Administración</span>
                                        <span className="text-xs text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">
                                          Nota oficial
                                        </span>
                                      </div>
                                      <p className="text-xs text-blue-700 leading-relaxed break-words">{claim.adminNotes}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3 flex-shrink-0" />
                                  {/* Admins always see the real username, regardless of anonymity */}
                                  <span className="truncate">{claim.createdBy}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Building className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{claim.location}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 flex-shrink-0" />
                                  <span className="whitespace-nowrap">{new Date(claim.createdAt).toLocaleDateString('es-ES')}</span>
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 self-start">
                              {claim.projectFlowTaskId ? (
                                <button
                                  onClick={() => {
                                    setCreatedTaskId(claim.projectFlowTaskId!);
                                    setCreatedTaskTitle(claim.subject);
                                    setShowSubTaskModal(true);
                                  }}
                                  className="p-2 hover:bg-white rounded-lg transition-colors cursor-pointer group"
                                  title="Añadir subtarea en ProjectFlow"
                                >
                                  <Plus className="w-4 h-4 text-purple-500 group-hover:text-purple-600" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleExportClick(claim)}
                                  className="p-2 hover:bg-white rounded-lg transition-colors cursor-pointer group"
                                  title="Exportar a Project Flow"
                                >
                                  <Send className="w-4 h-4 text-purple-500 group-hover:text-purple-600" />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setClaimToUpdateStatus(claim);
                                  setShowStatusModal(true);
                                }}
                                className="p-2 hover:bg-white rounded-lg transition-colors cursor-pointer"
                                title="Cambiar estado"
                              >
                                <Edit className="w-4 h-4 text-gray-500" />
                              </button>
                              <button
                                onClick={() => {
                                  setClaimToDelete(claim);
                                  setShowDeleteModal(true);
                                }}
                                className="p-2 hover:bg-white rounded-lg transition-colors cursor-pointer"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${priorityColors[claim.priority?.name as keyof typeof priorityColors] || 'bg-gray-100 text-gray-600 border-gray-300'}`}>
                              {claim.priority?.label || claim.priority?.name || 'Sin prioridad'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[claim.status?.name as keyof typeof statusColors] || 'bg-gray-100 text-gray-600 border-gray-300'} flex items-center gap-1`}>
                              <StatusIcon className="w-3 h-3" />
                              <span className="hidden sm:inline">{claim.status?.label || claim.status?.name || 'Sin estado'}</span>
                              <span className="sm:hidden">{(claim.status?.label || claim.status?.name || 'Sin').substring(0, 3)}</span>
                            </span>
                            
                            {/* ProjectFlow Badge */}
                            {claim.projectFlowTaskId && (
                              <button
                                onClick={() => {
                                  setSelectedTaskId(claim.projectFlowTaskId!);
                                  setSelectedClaimForTask(claim);
                                  setShowTaskDetailsModal(true);
                                }}
                                className="px-2 py-1 rounded-full text-xs font-medium border bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1 hover:bg-purple-100 transition-colors cursor-pointer"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Ver en ProjectFlow</span>
                              </button>
                            )}
                            
                            {/* Adhesion counters for admin */}
                            {claim.adhesion_counts && (claim.adhesion_counts.support > 0 || claim.adhesion_counts.disagree > 0) && (
                              <div key={`adhesion-${claim.id}`} className="contents">
                                {claim.adhesion_counts.support > 0 && (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                                    <ThumbsUp className="w-3 h-3 flex-shrink-0" />
                                    <span>{claim.adhesion_counts.support}</span>
                                  </span>
                                )}
                                {claim.adhesion_counts.disagree > 0 && (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium border bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
                                    <ThumbsDown className="w-3 h-3 flex-shrink-0" />
                                    <span>{claim.adhesion_counts.disagree}</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
                >
                  Anterior
                </button>
                <span className="px-4 py-2 text-sm text-gray-600">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
                >
                  Siguiente
                </button>
              </div>
            )}

            {/* Stats Footer */}
            <div className="border-t border-gray-200 pt-4 mt-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-orange-600">{Array.isArray(claims) ? claims.length : 0}</div>
                  <div className="text-sm text-gray-500">Total Reclamos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-600">{Array.isArray(claims) ? claims.filter(c => c.status?.name === 'pendiente').length : 0}</div>
                  <div className="text-sm text-gray-500">Pendientes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{Array.isArray(claims) ? claims.filter(c => c.status?.name === 'en_progreso').length : 0}</div>
                  <div className="text-sm text-gray-500">En Progreso</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{Array.isArray(claims) ? claims.filter(c => c.status?.name === 'resuelto').length : 0}</div>
                  <div className="text-sm text-gray-500">Resueltos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{Array.isArray(claims) ? claims.filter(c => c.status?.name === 'rechazado').length : 0}</div>
                  <div className="text-sm text-gray-500">Rechazados</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Status Update Modal */}
        {showStatusModal && claimToUpdateStatus && (
          <StatusUpdateModal
            claim={claimToUpdateStatus}
            isVisible={showStatusModal}
            onClose={() => {
              setShowStatusModal(false);
              setClaimToUpdateStatus(null);
            }}
            onUpdate={handleStatusUpdate}
            isLoading={isUpdatingStatus}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && claimToDelete && (
          <DeleteConfirmationModal
            claim={claimToDelete}
            isVisible={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setClaimToDelete(null);
            }}
            onConfirm={handleDelete}
            isLoading={isDeleting}
          />
        )}
      </div>

      {/* Success Toast */}
      <ClaimSuccessToast
        isVisible={showSuccessToast}
        onComplete={() => setShowSuccessToast(false)}
        action={toastAction}
        claimSubject={toastSubject}
      />

      {/* Error Toast */}
      <ClaimErrorToast
        isVisible={showErrorToast}
        onComplete={() => setShowErrorToast(false)}
        errorMessage={errorMessage}
      />

      {/* Task Created Toast with SubTask Option */}
      <ProjectFlowTaskCreatedToast
        isVisible={showTaskCreatedToast}
        onComplete={() => setShowTaskCreatedToast(false)}
        onCreateSubTask={handleOpenSubTaskModal}
        taskTitle={createdTaskTitle}
      />

      {/* SubTask Created Toast */}
      <SubTaskCreatedToast
        isVisible={showSubTaskCreatedToast}
        onComplete={() => setShowSubTaskCreatedToast(false)}
        subTaskTitle={createdSubTaskTitle}
      />

      {/* ProjectFlow Task Details Modal */}
      <ProjectFlowTaskDetailsModal
        isOpen={showTaskDetailsModal}
        onClose={() => {
          setShowTaskDetailsModal(false);
          setSelectedClaimForTask(null);
        }}
        taskId={selectedTaskId}
        token={token}
        claimId={selectedClaimForTask?.id}
        currentClaimStatus={selectedClaimForTask?.status as string | undefined}
        onClaimStatusSync={loadClaims}
        onAddSubTask={() => {
          setCreatedTaskId(selectedTaskId);
          setShowSubTaskModal(true);
        }}
      />

      {/* Export Modal */}
      {claimToExport && (
        <ExportToProjectFlowModal
          isOpen={showExportModal}
          onClose={() => {
            setShowExportModal(false);
            setClaimToExport(null);
          }}
          onExport={handleExport}
          claimTitle={claimToExport.subject}
          claimDescription={claimToExport.description}
        />
      )}

      {/* SubTask Modal */}
      <CreateSubTaskModal
        isOpen={showSubTaskModal}
        onClose={() => setShowSubTaskModal(false)}
        onCreateSubTask={handleCreateSubTask}
        parentTaskTitle={createdTaskTitle}
      />

      {/* Category Filter Modal */}
      <CategoryFilterModal
        isVisible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      {/* Status Filter Modal */}
      <StatusFilterModal
        isVisible={showStatusFilterModal}
        onClose={() => setShowStatusFilterModal(false)}
        selectedStatus={selectedStatus}
        onStatusSelect={setSelectedStatus}
      />

      {/* Date Filter Modal */}
      <DateFilterModal
        isVisible={showDateFilterModal}
        onClose={() => setShowDateFilterModal(false)}
        selectedValue={dateFilterOption?.value || 'all'}
        onDateFilterSelect={handleDateFilterSelect}
        title="Filtrar por Fecha"
        subtitle="Selecciona el rango de fechas para filtrar los reclamos"
      />
    </AnimatePresence>
  );
}

// Status Update Modal Component
interface StatusUpdateModalProps {
  claim: Claim;
  isVisible: boolean;
  onClose: () => void;
  onUpdate: (claim: Claim, status: string, adminNotes?: string) => void;
  isLoading: boolean;
}

function StatusUpdateModal({ claim, isVisible, onClose, onUpdate, isLoading }: StatusUpdateModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>(claim.status?.name || '');
  const [adminNotes, setAdminNotes] = useState(claim.adminNotes || '');

  // Update state when claim changes or modal becomes visible
  useEffect(() => {
    if (isVisible) {
      console.log('🔍 [MODAL DEBUG] Opening modal for claim:', claim.id);
      console.log('🔍 [MODAL DEBUG] Claim adminNotes:', claim.adminNotes);
      setSelectedStatus(claim.status?.name || '');
      setAdminNotes(claim.adminNotes || '');
    }
  }, [claim, isVisible]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-60"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Actualizar Estado del Reclamo
        </h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Reclamo: <strong>{claim.subject}</strong></p>
          <p className="text-sm text-gray-500">Estado actual: {claim.status?.label || claim.status?.name || 'Sin estado'}</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nuevo Estado
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
          >
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas Administrativas
          </label>
          {claim.adminNotes && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Notas existentes:</span>
              </div>
              <p className="text-sm text-blue-700">{claim.adminNotes}</p>
            </div>
          )}
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
            placeholder={claim.adminNotes ? "Editar o añadir más notas..." : "Añadir notas sobre el cambio de estado..."}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={() => onUpdate(claim, selectedStatus, adminNotes)}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Delete Confirmation Modal Component
interface DeleteConfirmationModalProps {
  claim: Claim;
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (deleteProjectFlowTask: boolean) => void;
  isLoading: boolean;
}

function DeleteConfirmationModal({ claim, isVisible, onClose, onConfirm, isLoading }: DeleteConfirmationModalProps) {
  const [deleteTask, setDeleteTask] = useState(false);
  
  if (!isVisible) return null;

  const handleConfirm = () => {
    onConfirm(deleteTask);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-60"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Eliminar Reclamo
          </h3>
        </div>
        
        <p className="text-gray-600 mb-2">
          ¿Estás seguro de que deseas eliminar este reclamo?
        </p>
        <p className="text-sm text-gray-500 mb-4">
          <strong>{claim.subject}</strong><br />
          Esta acción no se puede deshacer.
        </p>

        {/* ProjectFlow Task Option */}
        {claim.projectFlowTaskId && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={deleteTask}
                onChange={(e) => setDeleteTask(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                disabled={isLoading}
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">
                  ¿También eliminar la tarea de ProjectFlow?
                </span>
                <p className="text-xs text-gray-600 mt-1">
                  Este reclamo tiene una tarea asociada en ProjectFlow. Si deseas eliminarla también, marca esta opción.
                </p>
              </div>
            </label>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default ClaimsManagement;