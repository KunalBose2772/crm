'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Download, ChevronLeft, ChevronRight, ArrowUpDown, Filter, X } from 'lucide-react';
import { Button } from './Button';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface FilterOption {
  label: string;
  value: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  initialSearch?: string;
  filters?: {
    key: keyof T;
    label: string;
    options: FilterOption[];
  }[];
  actions?: React.ReactNode;
  pageSize?: number;
  emptyMessage?: string;
  exportFilename?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  searchPlaceholder = 'Search records...',
  searchKeys = [],
  initialSearch = '',
  filters = [],
  actions,
  pageSize = 10,
  emptyMessage = 'No records found matching your criteria.',
  exportFilename = 'export.csv',
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  // Synchronize with URL query parameter (?search=...) and custom table search events
  useEffect(() => {
    const syncSearchFromUrl = (event?: Event) => {
      const customEvent = event as CustomEvent<string> | undefined;
      if (customEvent && customEvent.detail !== undefined) {
        setSearchTerm(customEvent.detail);
        setCurrentPage(1);
        return;
      }
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const query = params.get('search');
        if (query !== null) {
          setSearchTerm(query);
          setCurrentPage(1);
        }
      }
    };

    syncSearchFromUrl();
    window.addEventListener('popstate', syncSearchFromUrl);
    window.addEventListener('crm-table-search', syncSearchFromUrl);

    return () => {
      window.removeEventListener('popstate', syncSearchFromUrl);
      window.removeEventListener('crm-table-search', syncSearchFromUrl);
    };
  }, []);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Filtering
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Search term
      if (searchTerm) {
        const matches = searchKeys.some(key => {
          const val = item[key];
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(searchTerm.toLowerCase());
        });
        if (!matches) return false;
      }

      // Dropdown filters
      for (const [key, value] of Object.entries(activeFilters)) {
        if (value && value !== 'all') {
          if (String(item[key as keyof T]).toLowerCase() !== value.toLowerCase()) {
            return false;
          }
        }
      }

      return true;
    });
  }, [data, searchTerm, activeFilters, searchKeys]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      const comparison = aVal > bVal ? 1 : -1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key?: keyof T) => {
    if (!key) return;
    if (sortKey === key) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleExportCSV = () => {
    if (!sortedData.length) return;
    const headers = columns.map(c => c.header).join(',');
    const rows = sortedData.map(row => {
      return columns.map(col => {
        if (col.accessorKey) {
          const val = row[col.accessorKey];
          return `"${String(val ?? '').replace(/"/g, '""')}"`;
        }
        return '""';
      }).join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', exportFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-9 py-2 bg-white border border-slate-200/90 rounded-full text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all shadow-xs"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  if (typeof window !== 'undefined' && window.location.search.includes('search=')) {
                    const url = new URL(window.location.href);
                    url.searchParams.delete('search');
                    const newUrl = url.pathname + (url.search ? url.search : '');
                    window.history.replaceState({}, '', newUrl);
                  }
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          {filters.map(f => (
            <div key={String(f.key)} className="relative inline-flex items-center">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <select
                value={activeFilters[String(f.key)] || 'all'}
                onChange={e => {
                  setActiveFilters(prev => ({ ...prev, [String(f.key)]: e.target.value }));
                  setCurrentPage(1);
                }}
                className="pl-9 pr-8 py-2 bg-white border border-slate-200/90 rounded-full text-xs font-semibold text-slate-700 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 appearance-none cursor-pointer shadow-xs transition-all"
              >
                <option value="all">All {f.label}</option>
                {f.options.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Toolbar Actions & Export */}
        <div className="flex items-center gap-2 justify-end">
          {actions}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-3xl border border-slate-200/90 bg-white shadow-xs overflow-hidden transition-all duration-200">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold text-slate-600 uppercase tracking-wider font-heading">
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    onClick={() => col.sortable && handleSort(col.accessorKey)}
                    className={`py-3.5 px-4 ${col.className || ''} ${
                      col.sortable ? 'cursor-pointer select-none hover:text-purple-700 transition-colors' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <ArrowUpDown className={`w-3.5 h-3.5 ${sortKey === col.accessorKey ? 'text-purple-600 font-bold' : 'text-slate-400'}`} />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-sans">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className="hover:bg-purple-50/30 transition-colors group"
                  >
                    {columns.map((col, cIdx) => (
                      <td key={cIdx} className={`py-3.5 px-4 text-slate-700 ${col.className || ''}`}>
                        {col.cell ? col.cell(row) : String(col.accessorKey ? row[col.accessorKey] ?? '-' : '-')}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-slate-500">
                    <p className="text-sm">{emptyMessage}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/60 text-xs text-slate-500 gap-3">
          <div>
            Showing <span className="font-bold text-slate-800 tabular-nums">{sortedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-bold text-slate-800 tabular-nums">{Math.min(currentPage * pageSize, sortedData.length)}</span> of{' '}
            <span className="font-bold text-slate-800 tabular-nums">{sortedData.length}</span> results
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1.5 rounded-full border border-slate-200 bg-white text-slate-600 hover:text-purple-700 hover:bg-purple-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-bold text-slate-800 tabular-nums">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-full border border-slate-200 bg-white text-slate-600 hover:text-purple-700 hover:bg-purple-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
