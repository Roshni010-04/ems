import React, { useEffect, useState } from "react";
import { OrgNode } from "../types";
import { fetchOrgTree } from "../api/organization";
import OrgTree from "../components/OrgTree";

const OrgChart: React.FC = () => {
  const [tree, setTree] = useState<OrgNode | OrgNode[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrgTree()
      .then(setTree)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Organizational Hierarchy</h2>
      {loading ? (
        <p className="text-gray-400">Loading organization tree...</p>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 overflow-x-auto">
          <OrgTree tree={tree} />
        </div>
      )}
    </div>
  );
};

export default OrgChart;
