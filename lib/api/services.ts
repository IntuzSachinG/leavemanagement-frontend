import { apiRequest } from "@/lib/api/client";
import {
  AuthUser,
  Department,
  Employee,
  LeaveRecord,
  LeaveSummary,
  PaginatedLeaves,
  Role,
} from "@/lib/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  gender: "male" | "female" | "other";
  mobile?: string;
  departmentId: string;
}

export interface EmployeePayload extends SignupPayload {
  role: Role;
  status?: "active" | "inactive";
}

export interface DepartmentPayload {
  name: string;
}

export interface LeavePayload {
  startDate: string;
  endDate: string;
  reason: string;
}

export interface LeaveHistoryQuery {
  page?: number;
  limit?: number;
  status?: string;
  employeeId?: string;
  startDate?: string;
  endDate?: string;
}

export async function loginUser(payload: LoginPayload) {
  return apiRequest<AuthUser>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUser() {
  return apiRequest<AuthUser>("/auth/me");
}

export async function signupUser(payload: SignupPayload) {
  return apiRequest<AuthUser>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function logoutUser() {
  return apiRequest<null>("/auth/logout", {
    method: "POST",
  });
}

export async function getPublicDepartments() {
  return apiRequest<Department[]>("/departments/public-departments");
}

export async function getDepartments() {
  return apiRequest<Department[]>("/departments/get-departments");
}

export async function createDepartment(payload: DepartmentPayload) {
  return apiRequest<Department>("/departments/admin-create-departments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateDepartment(
  departmentId: string,
  payload: DepartmentPayload,
) {
  return apiRequest<Department>(
    `/departments/${departmentId}/admin-update-department`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

export async function deleteDepartment(departmentId: string) {
  return apiRequest<null>(
    `/departments/${departmentId}/admin-delete-department`,
    {
      method: "DELETE",
    },
  );
}

export async function getAdminEmployees() {
  return apiRequest<Employee[]>("/employees/admin-get-employees");
}

export async function getVisibleEmployees() {
  return apiRequest<Employee[]>("/employees/visible-employees");
}

export async function createEmployee(payload: EmployeePayload) {
  return apiRequest<Employee[]>("/employees/admin-create-employees", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createManagerEmployee(payload: EmployeePayload) {
  return apiRequest<Employee[]>("/employees/manager-create-employees", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateEmployee(
  employeeId: string,
  payload: Partial<EmployeePayload>,
) {
  return apiRequest<Employee>(
    `/employees/${employeeId}/admin-update-employee`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

export async function deleteEmployee(employeeId: string) {
  return apiRequest<null>(`/employees/${employeeId}/admin-delete-employee`, {
    method: "DELETE",
  });
}

export async function getLeaveSummary() {
  return apiRequest<LeaveSummary>("/leaves/summary");
}

export async function getLeaveHistory(query: LeaveHistoryQuery = {}) {
  const search = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  });

  const suffix = search.toString() ? `?${search.toString()}` : "";

  return apiRequest<PaginatedLeaves>(`/leaves/get-leaves/${suffix}`);
}

export async function applyLeave(payload: LeavePayload) {
  return apiRequest<LeaveRecord[]>("/leaves/apply-leaves", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function approveLeave(leaveId: string) {
  return apiRequest<null>(`/leaves/${leaveId}/approve-leaves`, {
    method: "PATCH",
  });
}

export async function rejectLeave(leaveId: string) {
  return apiRequest<null>(`/leaves/${leaveId}/reject-leaves`, {
    method: "PATCH",
  });
}

export async function cancelLeave(leaveId: string) {
  return apiRequest<null>(`/leaves/${leaveId}/cancel-leaves`, {
    method: "PATCH",
  });
}
