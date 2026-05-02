"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export interface GroupedTableColumn<T> {
  header: string;
  key?: keyof T;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export interface GroupedTableProps<T> {
  /** All rows to display */
  rows: T[];
  /** Function to extract the group key from a row (e.g. educationType) */
  groupBy: (row: T) => string;
  /** Label for the group key (shown in the group header) */
  groupLabel?: string;
  /** Secondary label per row (e.g. institution) */
  subGroupBy?: (row: T) => string;
  /** Column definitions for the inner table */
  columns: GroupedTableColumn<T>[];
  /** Render the action cell for a row */
  renderActions?: (row: T) => React.ReactNode;
  /** Key extractor for rows (used as React key) */
  rowKey: (row: T) => string | number;
  /** Empty state message */
  emptyMessage?: string;
  /** Whether all groups should start expanded */
  defaultExpanded?: boolean;
}

export default function GroupedTable<T>({
  rows,
  groupBy,
  subGroupBy,
  columns,
  renderActions,
  rowKey,
  emptyMessage = "No data available",
  defaultExpanded = true,
}: GroupedTableProps<T>) {
  // Build groups
  const groups: Record<string, T[]> = {};
  rows.forEach((row) => {
    const key = groupBy(row) || "Uncategorized";
    if (!groups[key]) groups[key] = [];
    groups[key].push(row);
  });

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    Object.keys(groups).forEach((k) => {
      initial[k] = defaultExpanded;
    });
    return initial;
  });

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (rows.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-sm text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {Object.entries(groups).map(([groupKey, groupRows]) => {
        const isOpen = openGroups[groupKey] ?? defaultExpanded;

        // Optionally sub-group within the group
        const subGroups: Record<string, T[]> | null = subGroupBy
          ? (() => {
              const sg: Record<string, T[]> = {};
              groupRows.forEach((r) => {
                const sub = subGroupBy(r) || "—";
                if (!sg[sub]) sg[sub] = [];
                sg[sub].push(r);
              });
              return sg;
            })()
          : null;

        return (
          <div key={groupKey}>
            {/* ── Group Header ── */}
            <button
              onClick={() => toggleGroup(groupKey)}
              className="flex w-full items-center gap-3 bg-gradient-to-r from-blue-900/90 to-blue-800/70 px-6 py-3.5 text-left hover:from-blue-900 hover:to-blue-800/80 transition-all"
            >
              <span className="flex items-center justify-center rounded-md bg-white/10 p-0.5">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-blue-200" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-blue-200" />
                )}
              </span>
              <span className="flex-1 text-sm font-bold text-white">
                {groupKey}
              </span>
              <span className="rounded-full bg-blue-500/30 px-2.5 py-0.5 text-[10px] font-black text-blue-100 border border-blue-400/30">
                {groupRows.length} {groupRows.length === 1 ? "record" : "records"}
              </span>
            </button>

            {/* ── Group Body ── */}
            {isOpen && (
              <div className="animate-in slide-in-from-top-1 duration-200">
                {subGroups ? (
                  // Render sub-groups
                  Object.entries(subGroups).map(([subKey, subRows]) => (
                    <div key={subKey}>
                      <div className="flex items-center gap-2 bg-blue-50/60 border-b border-blue-100/60 px-8 py-2">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-700">
                          {subKey}
                        </span>
                        <span className="ml-auto text-[10px] text-blue-500 font-bold">
                          {subRows.length} employee{subRows.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <TableBody
                        rows={subRows}
                        columns={columns}
                        renderActions={renderActions}
                        rowKey={rowKey}
                      />
                    </div>
                  ))
                ) : (
                  <TableBody
                    rows={groupRows}
                    columns={columns}
                    renderActions={renderActions}
                    rowKey={rowKey}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TableBody<T>({
  rows,
  columns,
  renderActions,
  rowKey,
}: {
  rows: T[];
  columns: GroupedTableColumn<T>[];
  renderActions?: (row: T) => React.ReactNode;
  rowKey: (row: T) => string | number;
}) {
  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-gray-50/80 border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        <tr>
          {columns.map((col, i) => (
            <th key={i} className={`px-6 py-3 ${col.className ?? ""}`}>
              {col.header}
            </th>
          ))}
          {renderActions && (
            <th className="px-6 py-3 text-right">Actions</th>
          )}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {rows.map((row) => (
          <tr
            key={rowKey(row)}
            className="hover:bg-blue-50/20 transition-colors group"
          >
            {columns.map((col, i) => (
              <td
                key={i}
                className={`px-6 py-4 text-xs ${col.className ?? ""}`}
              >
                {col.render
                  ? col.render(row)
                  : col.key
                    ? String((row as any)[col.key] ?? "—")
                    : "—"}
              </td>
            ))}
            {renderActions && (
              <td className="px-6 py-4 text-right">
                {renderActions(row)}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
