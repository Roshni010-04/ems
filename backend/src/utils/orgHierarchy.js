/**
 * Checks whether setting `newManagerId` as the manager of `employeeId`
 * would create a circular reporting chain (i.e. newManagerId is already
 * a descendant of employeeId, or is employeeId itself).
 */
export const wouldCreateCycle = async (EmployeeModel, employeeId, newManagerId) => {
  if (String(employeeId) === String(newManagerId)) return true;

  let currentId = newManagerId;
  const visited = new Set();

  while (currentId) {
    if (String(currentId) === String(employeeId)) return true;
    if (visited.has(String(currentId))) break; // already-broken cycle upstream, avoid infinite loop
    visited.add(String(currentId));

    const manager = await EmployeeModel.findById(currentId).select("reportingManager");
    if (!manager) break;
    currentId = manager.reportingManager;
  }

  return false;
};

/**
 * Builds a nested organizational tree starting from root employees
 * (those with no reporting manager), or from a specific root id if given.
 */
export const buildOrgTree = async (EmployeeModel, rootId = null) => {
  const all = await EmployeeModel.find({}).select(
    "name email designation department employeeId role status reportingManager"
  );

  const byManager = new Map();
  all.forEach((emp) => {
    const key = emp.reportingManager ? String(emp.reportingManager) : "root";
    if (!byManager.has(key)) byManager.set(key, []);
    byManager.get(key).push(emp);
  });

  const attachChildren = (emp) => {
    const children = byManager.get(String(emp._id)) || [];
    return {
      id: emp._id,
      name: emp.name,
      email: emp.email,
      designation: emp.designation,
      department: emp.department,
      employeeId: emp.employeeId,
      role: emp.role,
      status: emp.status,
      children: children.map(attachChildren),
    };
  };

  if (rootId) {
    const rootEmp = all.find((e) => String(e._id) === String(rootId));
    if (!rootEmp) return null;
    return attachChildren(rootEmp);
  }

  const roots = byManager.get("root") || [];
  return roots.map(attachChildren);
};
