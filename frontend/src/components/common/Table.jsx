import React from "react";

/**
 * Table — dark-theme data table
 *
 * Props:
 *   columns    Array<{ key, label, className?, align? }>
 *              key       — used to read row[key] by default
 *              label     — header text
 *              className — extra class on each <td>
 *              align     — "left"|"center"|"right" (default "left")
 *   rows       Array<object>
 *   loading    boolean?           — show skeleton row
 *   emptyText  string?            — message when rows is empty
 *   emptyIcon  string?            — emoji / text shown above emptyText
 *   renderCell (row, col) => node — override cell content per column
 *   rowKey     string|function    — unique key for each row (default "id")
 */
export default function Table({
  columns   = [],
  rows      = [],
  loading   = false,
  emptyText = "Өгөгдөл байхгүй",
  emptyIcon = "📋",
  renderCell,
  rowKey = "id",
}) {
  const getKey = typeof rowKey === "function"
    ? rowKey
    : (row, i) => row[rowKey] ?? i;

  const alignCls = { left: "text-left", center: "text-center", right: "text-right" };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-y border-white/5 bg-[#1a1a1a] text-gray-500 uppercase tracking-wider text-[10px]">
            {columns.map(col => (
              <th key={col.key}
                  className={`px-4 py-3 font-semibold ${alignCls[col.align || "left"]} ${col.className || ""}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-white/5">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-10 text-gray-600">
                <svg className="w-4 h-4 animate-spin mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Уншиж байна...
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-gray-600">
                {emptyIcon && <p className="text-2xl mb-2">{emptyIcon}</p>}
                <p className="text-sm">{emptyText}</p>
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={getKey(row, i)} className="hover:bg-white/2 transition">
                {columns.map(col => (
                  <td key={col.key}
                      className={`px-4 py-3 ${alignCls[col.align || "left"]} ${col.className || ""}`}>
                    {renderCell ? renderCell(row, col) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
