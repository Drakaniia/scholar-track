import type { StudentTransitionDecision } from '@/types';

export const ARCHIVED_ITEMS_PAGE_SIZE = 10;
export const MANILA_TIME_ZONE = 'Asia/Manila';

export type ArchivedDeleteKind = 'student' | 'scholarship';

export interface ArchivedDeleteTarget {
  kind: ArchivedDeleteKind;
  ids: number[];
  label: string;
  selectAll?: boolean;
}

export interface PermanentDeleteResponse {
  success: boolean;
  data?: {
    deletedCount: number;
  };
  error?: string;
}

export interface SettingsConsoleUser {
  username?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  lastLogin: string | null;
  createdAt: string;
}

export interface SessionData {
  id: string;
  userId: number;
  expiresAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface CreateUserFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'STAFF' | 'VIEWER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface EditUserFormData {
  firstName: string;
  lastName: string;
  email: string;
}

export interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AcademicYearFormData {
  year: string;
  startDate: string;
  endDate: string;
  semester: string;
  promotionDate: string;
  isActive: boolean;
}

export interface AcademicYear {
  id: number;
  year: string;
  startDate: string;
  endDate: string;
  semester: string;
  isActive: boolean;
  promotionDate: string | null;
  promotionProcessedAt: string | null;
}

export interface PromotionPreview {
  activeAcademicYear: AcademicYear | null;
  latestRun: PromotionRun | null;
  totalStudents: number;
  preview: Array<{
    id: number;
    firstName: string;
    lastName: string;
    gradeLevel: string;
    yearLevel: string;
    nextGradeLevel: string | null;
    nextYearLevel: string | null;
    nextProgram: string | null;
    nextTermType: string | null;
    action: 'PROMOTE' | 'GRADUATE' | 'RETAIN' | 'SEPARATE' | 'SKIP';
    transitionDecision: StudentTransitionDecision | null;
    requiresDecision: boolean;
    reason?: string;
  }>;
}

export interface PromotionRun {
  id: number;
  academicYearId: number;
  academicYear: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REVERTED';
  source: string;
  requestedBy: number | null;
  totalStudents: number;
  promotedCount: number;
  graduatedCount: number;
  skippedCount: number;
  errorCount: number;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
}

export interface AuditLog {
  id: number;
  userId: number | null;
  action: string;
  resourceType: string | null;
  resourceId: number | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
  } | null;
}

export interface Student {
  id: number;
  lastName: string;
  firstName: string;
  middleInitial: string | null;
  program: string;
  gradeLevel: string;
  yearLevel: string;
  status: string;
  isArchived: boolean;
}

export interface Scholarship {
  id: number;
  scholarshipName: string;
  sponsor: string;
  type: string;
  source: string;
  amount: number;
  requirements: string | null;
  status: string;
  isArchived: boolean;
}

export interface ArchivedStudentsResponse {
  success: boolean;
  data: Student[];
  page: number;
  total: number;
  totalPages: number;
  error?: string;
}

export interface ArchivedScholarshipsResponse {
  success: boolean;
  data: Scholarship[];
  page: number;
  total: number;
  totalPages: number;
  error?: string;
}

export const initialCreateUserFormData: CreateUserFormData = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  role: 'STAFF',
  status: 'ACTIVE',
};

export function getDatePartsInManila(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: MANILA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  if (!year || !month || !day) {
    return null;
  }

  return { year, month, day };
}

export function formatDateForInput(value: string | null | undefined) {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const parts = getDatePartsInManila(date);
  return parts ? `${parts.year}-${parts.month}-${parts.day}` : '';
}

export function getDefaultAcademicYearFormData(now = new Date()): AcademicYearFormData {
  const parts = getDatePartsInManila(now);
  const currentYear = parts ? Number(parts.year) : now.getFullYear();
  const currentMonth = parts ? Number(parts.month) : now.getMonth() + 1;
  const startYear = currentMonth >= 6 ? currentYear : currentYear - 1;
  const endYear = startYear + 1;
  const endDate = `${endYear}-05-31`;

  return {
    year: `${startYear}-${endYear}`,
    startDate: `${startYear}-06-01`,
    endDate,
    semester: '1ST',
    promotionDate: endDate,
    isActive: true,
  };
}

export function formatDate(value: string | null) {
  if (!value) return 'Not set';
  return new Date(value).toLocaleDateString();
}

export function formatDateTime(value: string | null) {
  if (!value) return 'Not yet';
  return new Date(value).toLocaleString();
}

export function getPromotionRunBadge(run: PromotionRun) {
  if (run.status === 'REVERTED') {
    return { label: 'Undone', className: 'bg-gray-600 text-white' };
  }
  if (run.status === 'FAILED') {
    return { label: 'Failed', className: 'bg-red-600 text-white' };
  }
  if (run.status === 'COMPLETED') {
    return {
      label: run.errorCount > 0 ? 'Completed with issues' : 'Completed',
      className: run.errorCount > 0 ? 'bg-amber-500 text-white' : 'bg-green-600 text-white',
    };
  }
  return { label: 'Processing', className: 'bg-blue-600 text-white' };
}

export function getPromotionRunProcessedCount(run: PromotionRun) {
  return run.promotedCount + run.graduatedCount + run.skippedCount + run.errorCount;
}

export function getNextArchivedPageAfterDelete(
  currentVisibleCount: number,
  deletedIds: number[],
  currentPage: number
) {
  return deletedIds.length >= currentVisibleCount && currentPage > 1 ? currentPage - 1 : currentPage;
}
