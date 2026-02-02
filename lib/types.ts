export type UserRole = 'priest' | 'admin' | 'employee' | 'sacristan' | 'parent'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  visible_to: UserRole[]
  author_id: string
  author?: Profile
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  assigned_to: string | null
  assignee?: Profile
  created_by: string
  creator?: Profile
  due_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface ChurchEvent {
  id: string
  title: string
  description: string | null
  event_type: 'mass' | 'confession' | 'baptism' | 'wedding' | 'funeral' | 'meeting' | 'other'
  start_time: string
  end_time: string | null
  location: string | null
  recurring: boolean
  recurrence_rule: string | null
  created_by: string
  creator?: Profile
  created_at: string
  updated_at: string
}

export const ROLE_LABELS: Record<UserRole, string> = {
  priest: 'Priest',
  admin: 'Administrator',
  employee: 'Employee',
  sacristan: 'Sacristan',
  parent: 'Parent',
}

export const ROLE_PERMISSIONS: Record<UserRole, {
  canManageUsers: boolean
  canManageAnnouncements: boolean
  canManageTasks: boolean
  canManageEvents: boolean
  canViewReports: boolean
}> = {
  priest: {
    canManageUsers: true,
    canManageAnnouncements: true,
    canManageTasks: true,
    canManageEvents: true,
    canViewReports: true,
  },
  admin: {
    canManageUsers: true,
    canManageAnnouncements: true,
    canManageTasks: true,
    canManageEvents: true,
    canViewReports: true,
  },
  employee: {
    canManageUsers: false,
    canManageAnnouncements: false,
    canManageTasks: false,
    canManageEvents: false,
    canViewReports: false,
  },
  sacristan: {
    canManageUsers: false,
    canManageAnnouncements: false,
    canManageTasks: false,
    canManageEvents: true,
    canViewReports: false,
  },
  parent: {
    canManageUsers: false,
    canManageAnnouncements: false,
    canManageTasks: false,
    canManageEvents: false,
    canViewReports: false,
  },
}
