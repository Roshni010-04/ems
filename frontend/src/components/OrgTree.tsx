import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OrgNode } from "../types";

const NodeCard: React.FC<{ node: OrgNode; depth: number }> = ({ node, depth }) => {
  const [expanded, setExpanded] = useState(true);
  const navigate = useNavigate();
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="relative" style={{ marginLeft: depth === 0 ? 0 : 24 }}>
      <div className="flex items-center gap-2 my-1">
        {hasChildren ? (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-5 h-5 flex items-center justify-center text-xs rounded border border-gray-300 dark:border-gray-600"
          >
            {expanded ? "−" : "+"}
          </button>
        ) : (
          <span className="w-5 h-5" />
        )}
        <div
          onClick={() => navigate(`/employees/${node.id}`)}
          className="cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 shadow-sm hover:shadow-md transition min-w-[220px]"
        >
          <p className="text-sm font-semibold">{node.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {node.designation} · {node.department}
          </p>
          <p className="text-xs text-gray-400">{node.employeeId}</p>
        </div>
      </div>
      {expanded && hasChildren && (
        <div className="border-l border-dashed border-gray-300 dark:border-gray-600 pl-2">
          {node.children.map((child) => (
            <NodeCard key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const OrgTree: React.FC<{ tree: OrgNode | OrgNode[] | null }> = ({ tree }) => {
  if (!tree) return <p className="text-gray-400">No organizational data available.</p>;

  const roots = Array.isArray(tree) ? tree : [tree];

  if (roots.length === 0) {
    return <p className="text-gray-400">No employees found in the hierarchy.</p>;
  }

  return (
    <div className="space-y-4">
      {roots.map((root) => (
        <NodeCard key={root.id} node={root} depth={0} />
      ))}
    </div>
  );
};

export default OrgTree;
