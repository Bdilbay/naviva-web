'use client'

import React from 'react'
import { ChevronLeft, ChevronRight, Search, Trash2, Edit2 } from 'lucide-react'

interface Column {
  key: string
  label: string
  render?: (value: any, row: any) => React.ReactNode
  width?: string
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  loading?: boolean
  onDelete?: (id: string) => void
  onEdit?: (row: any) => void
  searchable?: boolean
  pageable?: boolean
  pageSize?: number
}

export function DataTable({
  columns,
  data,
  loading = false,
  onDelete,
  onEdit,
  searchable = true,
  pageable = true,
  pageSize = 10,
}: DataTableProps) {
  const [search, setSearch] = React.useState('')
  const [page, setPage] = React.useState(0)

  const filteredData = data.filter(row =>
    columns.some(col =>
      String(row[col.key] || '').toLowerCase().includes(search.toLowerCase())
    )
  )

  const paginatedData = pageable
    ? filteredData.slice(page * pageSize, (page + 1) * pageSize)
    : filteredData

  const totalPages = Math.ceil(filteredData.length / pageSize)

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => {
              setSearch(e.target.value)
              setPage(0)
            }}
            className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-orange-500"
          />
        </div>
      )}

      <div className="overflow-x-auto border border-slate-700 rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-800 border-b border-slate-700">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider ${
                    col.width || ''
                  }`}
                >
                  {col.label}
                </th>
              ))}
              {(onDelete || onEdit) && (
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (onDelete || onEdit ? 1 : 0)}
                  className="px-6 py-8 text-center text-slate-400"
                >
                  Loading...
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onDelete || onEdit ? 1 : 0)}
                  className="px-6 py-8 text-center text-slate-400"
                >
                  No data found
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  className="border-b border-slate-700 hover:bg-slate-800/50 transition-colors"
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={`px-6 py-4 text-sm text-slate-300 ${col.width || ''}`}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key] || '-'}
                    </td>
                  ))}
                  {(onDelete || onEdit) && (
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="text-blue-400 hover:text-blue-300 p-1"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => {
                              if (
                                confirm('Are you sure you want to delete this item?')
                              ) {
                                onDelete(row.id)
                              }
                            }}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pageable && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-slate-400 text-sm">
            Showing {Math.min(page * pageSize + 1, filteredData.length)} to{' '}
            {Math.min((page + 1) * pageSize, filteredData.length)} of {filteredData.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="flex items-center gap-1 px-3 py-2 rounded border border-slate-600 text-slate-300 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              Prev
            </button>
            <span className="flex items-center px-3 text-slate-300 text-sm">
              {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              className="flex items-center gap-1 px-3 py-2 rounded border border-slate-600 text-slate-300 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
