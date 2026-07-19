import React, { useEffect, useState } from "react";
import { Employee } from "../types";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

interface Props {
  initial?: Partial<Employee>;
  mode: "create" | "edit";
  onSubmit: (payload: any) => Promise<void>;
  submitting?: boolean;
}

interface FormState {
  name: string;
  email: string;
  password: string;
  phone: string;
  department: string;
  designation: string;
  salary: string;
  joiningDate: string;
  status: string;
  role: string;
  reportingManager: string;
}

const emptyForm: FormState = {
  name: "",
  email: "",
  password: "",
  phone: "",
  department: "",
  designation: "",
  salary: "",
  joiningDate: "",
  status: "Active",
  role: "Employee",
  reportingManager: "",
};

const EmployeeForm: React.FC<Props> = ({ initial, mode, onSubmit, submitting }) => {
  const { user, hasRole } = useAuth();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [managers, setManagers] = useState<Employee[]>([]);

  const isSelf = mode === "edit" && initial && user && initial._id === user._id;
  const isEmployeeRole = user?.role === "Employee";
  // Employees editing their own profile can only touch a limited set of fields
  const readOnlyForSelf = isEmployeeRole && isSelf;
  const isHR = user?.role === "HR Manager";

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || "",
        email: initial.email || "",
        password: "",
        phone: initial.phone || "",
        department: initial.department || "",
        designation: initial.designation || "",
        salary: initial.salary?.toString() || "",
        joiningDate: initial.joiningDate ? initial.joiningDate.substring(0, 10) : "",
        status: initial.status || "Active",
        role: initial.role || "Employee",
        reportingManager:
          typeof initial.reportingManager === "object" && initial.reportingManager
            ? initial.reportingManager._id
            : (initial.reportingManager as string) || "",
      });
    }
  }, [initial]);

  useEffect(() => {
    // Load potential managers for the dropdown
    api.get("/employees", { params: { limit: 100 } }).then((res) => {
      setManagers(res.data.data);
    });
  }, []);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!readOnlyForSelf) {
      if (!form.name || form.name.length < 2) newErrors.name = "Name must be at least 2 characters";
      if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = "Enter a valid email";
      if (mode === "create" && form.password.length < 6)
        newErrors.password = "Password must be at least 6 characters";
      if (!form.department) newErrors.department = "Department is required";
      if (!form.designation) newErrors.designation = "Designation is required";
      if (!form.salary || Number(form.salary) < 0) newErrors.salary = "Salary must be a positive number";
      if (!form.joiningDate) newErrors.joiningDate = "Joining date is required";
    }
    if (!/^[0-9+\-\s()]{7,15}$/.test(form.phone)) newErrors.phone = "Enter a valid phone number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let payload: any;
    if (readOnlyForSelf) {
      payload = { phone: form.phone };
      if (form.password) payload.password = form.password;
    } else {
      payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        department: form.department,
        designation: form.designation,
        salary: Number(form.salary),
        joiningDate: form.joiningDate,
        status: form.status,
        role: form.role,
        reportingManager: form.reportingManager || null,
      };
      if (mode === "create" || form.password) payload.password = form.password;
    }
    await onSubmit(payload);
  };

  const inputClass =
    "w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60 disabled:cursor-not-allowed";
  const labelClass = "block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Name</label>
          <input
            className={inputClass}
            value={form.name}
            disabled={!!readOnlyForSelf}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input
            className={inputClass}
            type="email"
            value={form.email}
            disabled={!!readOnlyForSelf}
            onChange={(e) => handleChange("email", e.target.value)}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>

        {(mode === "create" || readOnlyForSelf) && (
          <div>
            <label className={labelClass}>
              {mode === "create" ? "Password" : "New Password (optional)"}
            </label>
            <input
              className={inputClass}
              type="password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder={mode === "edit" ? "Leave blank to keep current" : ""}
            />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>
        )}

        <div>
          <label className={labelClass}>Phone</label>
          <input
            className={inputClass}
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label className={labelClass}>Department</label>
          <input
            className={inputClass}
            value={form.department}
            disabled={!!readOnlyForSelf}
            onChange={(e) => handleChange("department", e.target.value)}
          />
          {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
        </div>

        <div>
          <label className={labelClass}>Designation</label>
          <input
            className={inputClass}
            value={form.designation}
            disabled={!!readOnlyForSelf}
            onChange={(e) => handleChange("designation", e.target.value)}
          />
          {errors.designation && <p className="text-xs text-red-500 mt-1">{errors.designation}</p>}
        </div>

        <div>
          <label className={labelClass}>Salary</label>
          <input
            className={inputClass}
            type="number"
            value={form.salary}
            disabled={!!readOnlyForSelf}
            onChange={(e) => handleChange("salary", e.target.value)}
          />
          {errors.salary && <p className="text-xs text-red-500 mt-1">{errors.salary}</p>}
        </div>

        <div>
          <label className={labelClass}>Joining Date</label>
          <input
            className={inputClass}
            type="date"
            value={form.joiningDate}
            disabled={!!readOnlyForSelf}
            onChange={(e) => handleChange("joiningDate", e.target.value)}
          />
          {errors.joiningDate && <p className="text-xs text-red-500 mt-1">{errors.joiningDate}</p>}
        </div>

        <div>
          <label className={labelClass}>Status</label>
          <select
            className={inputClass}
            value={form.status}
            disabled={!!readOnlyForSelf}
            onChange={(e) => handleChange("status", e.target.value)}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Role</label>
          <select
            className={inputClass}
            value={form.role}
            disabled={!!readOnlyForSelf || isEmployeeRole}
            onChange={(e) => handleChange("role", e.target.value)}
          >
            <option value="Employee">Employee</option>
            <option value="HR Manager">HR Manager</option>
            {hasRole("Super Admin") && <option value="Super Admin">Super Admin</option>}
          </select>
          {isHR && (
            <p className="text-xs text-gray-400 mt-1">HR Managers cannot assign Super Admin</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Reporting Manager</label>
          <select
            className={inputClass}
            value={form.reportingManager}
            disabled={!!readOnlyForSelf}
            onChange={(e) => handleChange("reportingManager", e.target.value)}
          >
            <option value="">-- None --</option>
            {managers
              .filter((m) => m._id !== initial?._id)
              .map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.designation})
                </option>
              ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-md disabled:opacity-60"
      >
        {submitting ? "Saving..." : mode === "create" ? "Create Employee" : "Save Changes"}
      </button>
    </form>
  );
};

export default EmployeeForm;
