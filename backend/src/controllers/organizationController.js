import Employee from "../models/Employee.js";
import { buildOrgTree } from "../utils/orgHierarchy.js";

// @route GET /api/organization/tree
// Optional query param ?rootId= to get subtree for a specific manager
export const getOrgTree = async (req, res, next) => {
  try {
    const { rootId } = req.query;
    const tree = await buildOrgTree(Employee, rootId || null);
    res.status(200).json({ data: tree });
  } catch (err) {
    next(err);
  }
};
