const API_URL = import.meta.env.VITE_API_URL as string;

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";

export interface CreateTaskData {
  title: string;
  description: string;
  deadline: string; // formato: 2025-11-25T15:26
}

export interface CreateSubTaskData extends CreateTaskData {
  parentTaskId: string;
}

export interface ProjectFlowTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  deadline: string;
  parentTaskId: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  completedById: string | null;
  completedAt: string | null;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  parentTask: {
    id: string;
    title: string;
  } | null;
  completedBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
  subTasks?: ProjectFlowTask[];
  notes?: any[];
}



export async function createProjectFlowTask(
  token: string,
  taskData: CreateTaskData
): Promise<ProjectFlowTask> {
  const response = await fetch(`${API_URL}/projectflow/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(taskData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al crear tarea en Project Flow');
  }

  const result = await response.json();
  return result.data;
}


export async function createProjectFlowSubTask(
  token: string,
  parentTaskId: string,
  taskData: CreateTaskData
): Promise<ProjectFlowTask> {
  const response = await fetch(`${API_URL}/projectflow/tasks/${parentTaskId}/subtasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(taskData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al crear subtarea en Project Flow');
  }

  const result = await response.json();
  return result.data;
}


export async function getProjectFlowTask(
  token: string,
  taskId: string
): Promise<ProjectFlowTask> {
  const response = await fetch(`${API_URL}/projectflow/tasks/${taskId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al obtener tarea de Project Flow');
  }

  const result = await response.json();
  return result.data;
}


export async function getProjectFlowTasks(
  token: string
): Promise<ProjectFlowTask[]> {
  const response = await fetch(`${API_URL}/projectflow/tasks`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al obtener tareas de Project Flow');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Update a task in ProjectFlow via our backend
 */
export async function updateProjectFlowTask(
  token: string,
  taskId: string,
  updateData: Partial<CreateTaskData> & { status?: TaskStatus }
): Promise<ProjectFlowTask> {
  const response = await fetch(`${API_URL}/projectflow/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updateData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al actualizar tarea en Project Flow');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Delete a task from ProjectFlow via our backend
 */
export async function deleteProjectFlowTask(
  token: string,
  taskId: string
): Promise<void> {
  const response = await fetch(`${API_URL}/projectflow/tasks/${taskId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al eliminar tarea de Project Flow');
  }
}

