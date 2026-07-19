import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Employee } from "../types";
import { fetchEmployees, deleteEmployee, importEmployeesCSV } from "../api/employees";
import EmployeeTable from "../components/EmployeeTable";
import { useAuth } from "../context/AuthContext";

const Employees: React.FC = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const canCreate = hasRole("Super Admin", "HR Manager");

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [importMsg, setImportMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchEmployees({
        page,
        limit: 10,
        q: search || undefined,
        department: department || undefined,
        role: role || undefined,
        status: status || undefined,
        sortBy,
        order,
      });
      setEmployees(res.data);
      setTotalPages(res.pagination.totalPages);
    } finally {
      setLoading(false);
    }
  }, [page, search, department, role, status, sortBy, order]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setOrder("asc");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee? This is a soft delete.")) return;
    await deleteEmployee(id);
    load();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await importEmployeesCSV(file);
      setImportMsg(res.message);
      load();
    } catch (err: any) {
      setImportMsg(err.response?.data?.message || "Import failed");
    } finally {
      e.target.value = "";
    }
  };

  const inputClass =
    "px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-bold">Employees</h2>
        <div className="flex gap-2">
          {canCreate && (
            <>
              <label className="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                Import CSV
                <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
              </label>
              <button
                onClick={() => navigate("/employees/new")}
                className="px-4 py-2 text-sm rounded-md bg-primary-600 hover:bg-primary-700 text-white"
              >
                + Add Employee
              </button>
            </>
          )}
        </div>
      </div>

      {importMsg && (
        <div className="mb-4 px-3 py-2 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm">
          {importMsg}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          className={inputClass}
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <input
          className={inputClass}
          placeholder="Department"
          value={department}
          onChange={(e) => {
            setPage(1);
            setDepartment(e.target.value);
          }}
        />
        <select
          className={inputClass}
          value={role}
          onChange={(e) => {
            setPage(1);
            setRole(e.target.value);
          }}
        >
          <option value="">All Roles</option>
          <option value="Super Admin">Super Admin</option>
          <option value="HR Manager">HR Manager</option>
          <option value="Employee">Employee</option>
        </select>
        <select
          className={inputClass}
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading employees...</p>
      ) : (
        <EmployeeTable
          employees={employees}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          onDelete={handleDelete}
          sortBy={sortBy}
          order={order}
          onSortChange={handleSortChange}
        />
      )}
    </div>
  );
};

export default Employees;
