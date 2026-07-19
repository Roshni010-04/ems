export const generateNextEmployeeId = async (EmployeeModel) => {
  const lastEmployee = await EmployeeModel.findOne({ includeDeleted: true })
    .sort({ employeeId: -1 })
    .collation({ locale: "en_US", numericOrdering: true });

  let nextNum = 1;
  if (lastEmployee && lastEmployee.employeeId) {
    const match = lastEmployee.employeeId.match(/(\d+)\s*$/);
    if (match) {
      nextNum = parseInt(match[1], 10) + 1;
    }
  }

  return `EMP${String(nextNum).padStart(4, "0")}`;
};
