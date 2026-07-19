import api from "./axios";
import { OrgNode } from "../types";

export const fetchOrgTree = async (rootId?: string) => {
  const res = await api.get<{ data: OrgNode | OrgNode[] }>("/organization/tree", {
    params: rootId ? { rootId } : {},
  });
  return res.data.data;
};
