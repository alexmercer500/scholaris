import { useGetStudentsQuery } from "../api/studentApi";
import { TopHeader } from "@components/ui/TopHeader";
import { studentColumns } from "../column/column";
import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { useSearchParams } from "react-router";
import { Pagination } from "@components/ui/Pagination";
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { TopAppBar } from "@components/layout/TopAppBar";

export function StudentsPage() {
  const { data = [], isLoading, error } = useGetStudentsQuery(undefined);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') ?? '1') - 1;

  // Search (debounced) + filtering BEFORE the table.
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);

  const filteredData = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return data;
    return data.filter((s) =>
      s.name.toLowerCase().includes(q) ||
      s.rollNumber.toLowerCase().includes(q) ||
      s.guardian.toLowerCase().includes(q),
    );
  }, [data, debouncedSearch]);

  const onPageChange = (newPageIndex: number) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev)
      params.set('page', String(newPageIndex + 1))  // store 1-based
      return params
    })
  }
  const table = useReactTable({
    data: filteredData,
    columns: studentColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { pagination: { pageIndex: page, pageSize: 10 } },
    onPaginationChange: (updater) => {
      const nextPageIndex = typeof updater === 'function' ?
        updater({ pageIndex: page, pageSize: 10 }).pageIndex : updater.pageIndex;

      onPageChange(nextPageIndex)
    }
  });
  if (isLoading) {
    return (
      <div className="p-8 font-body text-on-surface-variant">
        Loading students...
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-8 font-body text-error">Error loading students</div>
    );
  }

  return (
    <>
      <TopAppBar>
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface mb-1">
            Students
          </h2>
        </div>
      </TopAppBar>
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            onPageChange(0) // reset to page 1 when searching
          }}
          placeholder="Search by name, roll, or guardian..."
          className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-on-surface placeholder:text-outline font-body focus:outline-none"
        />
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-soft border border-outline-variant/30 overflow-hidden grow">
        <div className="overflow-x-auto h-full scrollbar-thin flex flex-col">
          <table className="w-full text-left border-collapse min-w-225">
            <thead className="sticky top-0">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="bg-surface-container text-on-surface-variant border-b border-outline-variant/50 text-sm tracking-wide uppercase font-label"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={header.column.columnDef.meta?.thClassName}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap">
                        <span>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</span>
                        <span>{header.column.getIsSorted() === 'asc' ? ' ↑' : header.column.getIsSorted() === 'desc' ? ' ↓' : ''}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="text-on-background font-body text-base divide-y divide-outline-variant/20">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-surface-container/30 transition-colors group"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cell.column.columnDef.meta?.tdClassName}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            pageIndex={page}
            pageSize={10}
            totalItems={filteredData.length}
            onPageChange={onPageChange}
            className="sticky bottom-0 mt-auto"
          />
        </div>
      </div>
    </>
  );
}

