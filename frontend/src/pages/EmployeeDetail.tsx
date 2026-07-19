import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Employee } from "../types";
import {
  fetchEmployeeById,
  createEmployee,
  updateEmployee,
  fetchReportees,
} from "../api/employees";
import EmployeeForm from "../components/EmployeeForm";

const EmployeeDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [reportees, setReportees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isNew) return;
    if (!id) return;
    setLoading(true);
    Promise.all([fetchEmployeeById(id), fetchReportees(id)])
      .then(([emp, reps]) => {
        setEmployee(emp);
        setReportees(reps);
      })
      .catch(() => setError("Failed to load employee"))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const handleSubmit = async (payload: any) => {
    setSubmitting(true);
    setError("");
    try {
      if (isNew) {
        const created = await createEmployee(payload);
        navigate(`/employees/${created._id}`);
      } else if (id) {
        const updated = await updateEmployee(id, payload);
        setEmployee(updated);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save employee");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-gray-400">Loading...</p>;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="text-sm text-primary-600 mb-4">
        ← Back
      </button>
      <h2 className="text-xl font-bold mb-6">
        {isNew ? "Add New Employee" : `Edit: ${employee?.name}`}
      </h2>

      {error && (
        <div className="mb-4 px-3 py-2 rounded-md bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm max-w-2xl">
          {error}
        </div>
      )}

      <EmployeeForm
        mode={isNew ? "create" : "edit"}
        initial={employee || undefined}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      {!isNew && (
        <div className="mt-10 max-w-2xl">
          <h3 className="text-lg font-semibold mb-3">Direct Reports</h3>
          {reportees.length === 0 ? (
            <p className="text-gray-400 text-sm">No direct reports.</p>
          ) : (
            <ul className="space-y-2">
              {reportees.map((r) => (
                <li
                  key={r._id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 cursor-pointer hover:shadow-sm"
                  onClick={() => navigate(`/employees/${r._id}`)}
                >
                  <p className="text-sm font-medium">{r.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {r.designation} · {r.department}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeDetail;
