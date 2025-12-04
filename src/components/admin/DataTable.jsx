import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter,
  Download,
  MoreHorizontal 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DataTable({
  columns,
  data,
  searchable = true,
  searchPlaceholder = "Search...",
  selectable = false,
  onSelectionChange,
  actions,
  pageSize = 10,
  emptyMessage = "No data found",
  filters,
  onExport,
  loading = false
}) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});

  // Filter data
  let filteredData = data.filter(row => {
    if (!search) return true;
    return columns.some(col => {
      const value = row[col.key];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(search.toLowerCase());
      }
      return false;
    });
  });

  // Apply custom filters
  Object.entries(activeFilters).forEach(([key, value]) => {
    if (value && value !== 'all') {
      filteredData = filteredData.filter(row => row[key] === value);
    }
  });

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(paginatedData.map(row => row.id));
    } else {
      setSelectedRows([]);
    }
    onSelectionChange?.(checked ? paginatedData : []);
  };

  const handleSelectRow = (id, checked) => {
    const newSelection = checked 
      ? [...selectedRows, id]
      : selectedRows.filter(rowId => rowId !== id);
    setSelectedRows(newSelection);
    onSelectionChange?.(data.filter(row => newSelection.includes(row.id)));
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          {searchable && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 w-64 bg-white"
              />
            </div>
          )}
          
          {filters?.map((filter) => (
            <Select
              key={filter.key}
              value={activeFilters[filter.key] || 'all'}
              onValueChange={(value) => {
                setActiveFilters(prev => ({ ...prev, [filter.key]: value }));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-40 bg-white">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {filter.label}</SelectItem>
                {filter.options.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>

        <div className="flex gap-2">
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Selected count */}
      {selectable && selectedRows.length > 0 && (
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm">
          {selectedRows.length} item(s) selected
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                {selectable && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                )}
                {columns.map((column) => (
                  <TableHead 
                    key={column.key}
                    className={`text-xs font-semibold text-slate-600 uppercase tracking-wider ${column.className || ''}`}
                  >
                    {column.label}
                  </TableHead>
                ))}
                {actions && <TableHead className="w-12"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} className="text-center py-12">
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} className="text-center py-12 text-slate-500">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row) => (
                  <TableRow key={row.id} className="hover:bg-slate-50 transition-colors">
                    {selectable && (
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.includes(row.id)}
                          onCheckedChange={(checked) => handleSelectRow(row.id, checked)}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={column.key} className={column.cellClassName || ''}>
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </TableCell>
                    ))}
                    {actions && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {actions.map((action, idx) => (
                              <DropdownMenuItem 
                                key={idx}
                                onClick={() => action.onClick(row)}
                                className={action.destructive ? 'text-red-600' : ''}
                              >
                                {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                                {action.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-slate-600 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}