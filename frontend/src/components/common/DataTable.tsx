import React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DataTableProps<TData> {
  data: TData[];
  columns: any[];
  isLoading?: boolean;
  emptyMessage?: string;
  pageIndex?: number;
  pageCount?: number;
  onPageChange?: (page: number) => void;
}

export function DataTable<TData>({
  data,
  columns,
  isLoading = false,
  emptyMessage = 'No records found.',
  pageIndex = 0,
  pageCount = 1,
  onPageChange,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    state: { pagination: { pageIndex, pageSize: 20 } },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="animate-spin rounded-full h-9 w-9 border-2 border-primary/20 border-t-primary" />
        <span className="text-xs font-medium text-slate-400">Loading data...</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-slate-200/70 bg-slate-50/60">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50/80 transition-colors duration-150 group"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-5 py-3.5 text-sm text-slate-700 whitespace-nowrap align-middle"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {onPageChange && pageCount > 1 && (
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/40">
          <button
            onClick={() => onPageChange(pageIndex - 1)}
            disabled={pageIndex === 0}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200/80 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 shadow-xs"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Previous
          </button>
          <span className="text-xs font-medium text-slate-500">
            Page <span className="font-bold text-slate-800">{pageIndex + 1}</span> of{' '}
            <span className="font-bold text-slate-800">{pageCount}</span>
          </span>
          <button
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={pageIndex >= pageCount - 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200/80 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 shadow-xs"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default DataTable;
