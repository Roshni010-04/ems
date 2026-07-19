// Fields an "Employee" role is allowed to edit on their own profile
export const EMPLOYEE_SELF_EDITABLE_FIELDS = ["phone", "profileImage", "password"];

// Fields HR Manager is NOT allowed to touch when creating/editing employees
export const HR_FORBIDDEN_FIELDS = ["role"]; // HR cannot assign Super Admin or change roles at all
export const HR_FORBIDDEN_ROLE_VALUE = "Super Admin";

/**
 * Filters the request body down to only the fields a given role is allowed
 * to modify. Returns the sanitized body.
 */
export const filterBody = (body, allowedFields) => {
  const filtered = {};
  Object.keys(body || {}).forEach((key) => {
    if (allowedFields.includes(key)) {
      filtered[key] = body[key];
    }
  });
  return filtered;
};

export const canDelete = (role) => role === "Super Admin";

export const canAssignRole = (role, targetRole) => {
  if (role === "Super Admin") return true;
  if (role === "HR Manager" && targetRole !== "Super Admin") return true;
  return false;
};
