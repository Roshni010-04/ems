import api from "./axios";
import { Employee, EmployeeListResponse, DashboardStats } from "../types";

export interface EmployeeQuery {
  page?: number;
  limit?: number;
  q?: string;
  department?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

export const fetchEmployees = async (params: EmployeeQuery) => {
  const res = await api.get<EmployeeListResponse>("/employees", { params });
  return res.data;
};

export const fetchEmployeeById = async (id: string) => {
  const res = await api.get<{ data: Employee }>(`/employees/${id}`);
  return res.data.data;
};

export const createEmployee = async (payload: Partial<Employee> & { password: string }) => {
  const res = await api.post<{ data: Employee }>("/employees", payload);
  return res.data.data;
};

export const updateEmployee = async (id: string, payload: Partial<Employee>) => {
  const res = await api.put<{ data: Employee }>(`/employees/${id}`, payload);
  return res.data.data;
};

export const deleteEmployee = async (id: string) => {
  const res = await api.delete(`/employees/${id}`);
  return res.data;
};

export const fetchReportees = async (id: string) => {
  const res = await api.get<{ data: Employee[] }>(`/employees/${id}/reportees`);
  return res.data.data;
};

export const assignManager = async (id: string, managerId: string | null) => {
  const res = await api.patch<{ data: Employee }>(`/employees/${id}/manager`, { managerId });
  return res.data.data;
};

export const importEmployeesCSV = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("/employees/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const fetchDashboardStats = async () => {
  const res = await api.get<DashboardStats>("/dashboard/stats");
  return res.data;
};
