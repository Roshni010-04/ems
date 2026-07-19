import React from "react";
import { useNavigate } from "react-router-dom";
import { Employee } from "../types";
import { useAuth } from "../context/AuthContext";

interface Props {
  employees: Employee[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => void;
  sortBy: string;
  order: "asc" | "desc";
  onSortChange: (field: string) => void;
}

const SortableHeader: React.FC<{
  label: string;
  field: string;
  sortBy: string;
  order: "asc" | "desc";
  onClick: (field: string) => void;
}> = ({ label, field, sortBy, order, onClick }) => (
  <th
    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer select-none text-gray-500 dark:text-gray-400"
    onClick={() => onClick(field)}
  >
    {label} {sortBy === field ? (order === "asc" ? "▲" : "▼") : ""}
  </th>
);

const EmployeeTable: React.FC<Props> = ({
  employees,
  page,
  totalPages,
  onPageChange,
  onDelete,
  sortBy,
  order,
  onSortChange,
}) => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const canDelete = hasRole("Super Admin");

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/40">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Emp ID
              </th>
              <SortableHeader label="Name" field="name" sortBy={sortBy} order={order} onClick={onSortChange} />
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Department
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Designation
              </th>
              <SortableHeader
                label="Joining Date"
                field="joiningDate"
                sortBy={sortBy}
                order={order}
                onClick={onSortChange}
              />
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {employees.map((emp) => (
              <tr key={emp._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                <td className="px-4 py-3 text-sm">{emp.employeeId}</td>
                <td className="px-4 py-3 text-sm font-medium">{emp.name}</td>
                <td className="px-4 py-3 text-sm">{emp.email}</td>
                <td className="px-4 py-3 text-sm">{emp.department}</td>
                <td className="px-4 py-3 text-sm">{emp.designation}</td>
                <td className="px-4 py-3 text-sm">
                  {new Date(emp.joiningDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      emp.status === "Active"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                    }`}
                  >
                    {emp.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm space-x-2 whitespace-nowrap">
                  <button
                    className="text-primary-600 hover:underline"
                    onClick={() => navigate(`/employees/${emp._id}`)}
                  >
                    View/Edit
                  </button>
                  {canDelete && (
                    <button
                      className="text-red-500 hover:underline"
                      onClick={() => onDelete(emp._id)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-40"
        >
          Previous
        </button>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default EmployeeTable;
