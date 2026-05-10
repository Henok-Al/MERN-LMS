import { useState } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export function DataTable({ columns, data, searchKey = "", searchPlaceholder = "Search..." }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchQuery, setSearchQuery] = useState("");

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const filteredData = searchKey
    ? data.filter((row) =>
        String(row[searchKey] || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    : data;

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ChevronsUpDown className="h-3 w-3 ml-1 text-muted-foreground" />;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="h-3 w-3 ml-1" />
    ) : (
      <ChevronDown className="h-3 w-3 ml-1" />
    );
  };

  return (
    <div className="space-y-4">
      {searchKey && (
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-8"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`text-left p-3 text-sm font-semibold ${
                    col.sortable ? "cursor-pointer hover:bg-muted/80 select-none" : ""
                  }`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center">
                    {col.label}
                    {col.sortable && <SortIcon columnKey={col.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-muted-foreground">
                  No data available
                </td>
              </tr>
            ) : (
              sortedData.map((row, rowIdx) => (
                <tr key={row._id || row.id || rowIdx} className="border-b hover:bg-muted/50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="p-3 text-sm">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="text-sm text-muted-foreground">
        Showing {sortedData.length} of {data.length} results
      </div>
    </div>
  );
}