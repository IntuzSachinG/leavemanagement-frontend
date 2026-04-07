export type Role = "admin" | "manager" | "employee";
export type Gender = "male" | "female" | "other";
export type EmployeeStatus = "active" | "inactive";
export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface Department {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  departmentId: string;
  mobile?: string | null;
  gender: Gender;
  status: EmployeeStatus;
  role: Role;
  created_at?: string;
  updated_at?: string;
}

export interface LeaveRecord {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string | null;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string | null;
  created_at?: string;
  updated_at?: string;
  employee?: Pick<Employee, "id" | "name" | "email" | "departmentId">;
  approver?: Pick<Employee, "id" | "name" | "email">;
}

export interface LeaveSummary {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
  activeToday: number;
  lastUpdated: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId: string;
}

export interface ApiResponse<T> {
  success: boolean | string;
  message?: string;
  data: T;
}

export interface PaginatedLeaves {
  data: LeaveRecord[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ValidationErrorItem {
  msg?: string;
  message?: string;
}
