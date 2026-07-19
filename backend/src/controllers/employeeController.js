
import { generateNextEmployeeId } from "../utils/generateEmployeeId.js";
import Employee from "../models/Employee.js";
import {
  filterBody,
  EMPLOYEE_SELF_EDITABLE_FIELDS,
  HR_FORBIDDEN_ROLE_VALUE,
} from "../middleware/rbac.js";
import { wouldCreateCycle } from "../utils/orgHierarchy.js";

// @route GET /api/employees
// Supports: pagination (page, limit), search (q), filter (department, role, status),
// sort (sortBy=joiningDate|name, order=asc|desc)
export const getEmployees = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      q,
      department,
      role,
      status,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const filter = {};

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }
    if (department) filter.department = department;
    if (role) filter.role = role;
    if (status) filter.status = status;

    const allowedSortFields = ["joiningDate", "name", "createdAt", "salary"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortOrder = order === "asc" ? 1 : -1;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (pageNum - 1) * limitNum;

    const [employees, total] = await Promise.all([
      Employee.find(filter)
        .populate("reportingManager", "name email designation employeeId")
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limitNum),
      Employee.countDocuments(filter),
    ]);

    res.status(200).json({
      data: employees,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/employees/:id
export const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id).populate(
      "reportingManager",
      "name email designation employeeId"
    );
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.status(200).json({ data: employee });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/employees  (Super Admin, HR Manager)
export const createEmployee = async (req, res, next) => {
  try {
    const body = { ...req.body };

    // HR cannot assign Super Admin role
    if (req.user.role === "HR Manager" && body.role === HR_FORBIDDEN_ROLE_VALUE) {
      return res
        .status(403)
        .json({ message: "HR Managers cannot assign the Super Admin role" });
    }

    if (body.reportingManager) {
      const manager = await Employee.findById(body.reportingManager);
      if (!manager) {
        return res.status(400).json({ message: "Reporting manager not found" });
      }
    }

    if (!body.employeeId) {
      body.employeeId = await generateNextEmployeeId(Employee);
    }

    const employee = await Employee.create(body);
    res.status(201).json({ data: employee.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/employees/:id
export const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const targetEmployee = await Employee.findById(id);

    if (!targetEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    let body = { ...req.body };
    const isSelf = req.user._id.toString() === id;

    if (req.user.role === "Employee") {
      if (!isSelf) {
        return res
          .status(403)
          .json({ message: "Employees can only edit their own profile" });
      }
      body = filterBody(body, EMPLOYEE_SELF_EDITABLE_FIELDS);
    }

    if (req.user.role === "HR Manager") {
      if (body.role === HR_FORBIDDEN_ROLE_VALUE) {
        return res
          .status(403)
          .json({ message: "HR Managers cannot assign the Super Admin role" });
      }
      if (targetEmployee.role === "Super Admin") {
        return res
          .status(403)
          .json({ message: "HR Managers cannot modify a Super Admin" });
      }
    }

    if (body.reportingManager) {
      if (body.reportingManager === id) {
        return res
          .status(400)
          .json({ message: "An employee cannot report to themselves" });
      }
      const wouldCycle = await wouldCreateCycle(Employee, id, body.reportingManager);
      if (wouldCycle) {
        return res
          .status(400)
          .json({ message: "This assignment would create a circular reporting structure" });
      }
    }

    Object.assign(targetEmployee, body);
    await targetEmployee.save();

    res.status(200).json({ data: targetEmployee.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/employees/:id  (Super Admin only) - soft delete
export const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user._id.toString() === id) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Reassign direct reports to the deleted employee's manager (or null)
    await Employee.updateMany(
      { reportingManager: id },
      { reportingManager: employee.reportingManager || null }
    );

    employee.isDeleted = true;
    employee.deletedAt = new Date();
    employee.status = "Inactive";
    await employee.save();

    res.status(200).json({ message: "Employee soft-deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/employees/:id/reportees
export const getReportees = async (req, res, next) => {
  try {
    const reportees = await Employee.find({ reportingManager: req.params.id }).select(
      "name email department designation employeeId status"
    );
    res.status(200).json({ data: reportees });
  } catch (err) {
    next(err);
  }
};

// @route PATCH /api/employees/:id/manager
export const assignManager = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { managerId } = req.body;

    if (managerId === id) {
      return res.status(400).json({ message: "An employee cannot report to themselves" });
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (managerId) {
      const manager = await Employee.findById(managerId);
      if (!manager) {
        return res.status(400).json({ message: "Manager not found" });
      }
      const wouldCycle = await wouldCreateCycle(Employee, id, managerId);
      if (wouldCycle) {
        return res
          .status(400)
          .json({ message: "This assignment would create a circular reporting structure" });
      }
    }

    employee.reportingManager = managerId || null;
    await employee.save();

    res.status(200).json({ data: employee.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/dashboard/stats
export const getDashboardStats = async (req, res, next) => {
  try {
    const [total, active, inactive, departments] = await Promise.all([
      Employee.countDocuments({}),
      Employee.countDocuments({ status: "Active" }),
      Employee.countDocuments({ status: "Inactive" }),
      Employee.distinct("department"),
    ]);

    const byDepartment = await Employee.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const byRole = await Employee.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      totalEmployees: total,
      activeEmployees: active,
      inactiveEmployees: inactive,
      departmentCount: departments.length,
      byDepartment,
      byRole,
    });
  } catch (err) {
    next(err);
  }
};
