export type Role = "Super Admin" | "HR Manager" | "Employee";
export type Status = "Active" | "Inactive";

export interface ManagerRef {
  _id: string;
  name: string;
  email: string;
  designation: string;
  employeeId: string;
}

export interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  salary: number;
  joiningDate: string;
  status: Status;
  role: Role;
  reportingManager: ManagerRef | string | null;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EmployeeListResponse {
  data: Employee[];
  pagination: Pagination;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  departmentCount: number;
  byDepartment: { _id: string; count: number }[];
  byRole: { _id: string; count: number }[];
}

export interface OrgNode {
  id: string;
  name: string;
  email: string;
  designation: string;
  department: string;
  employeeId: string;
  role: Role;
  status: Status;
  children: OrgNode[];
}

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: Role;
  employeeId: string;
  department: string;
  designation: string;
}
