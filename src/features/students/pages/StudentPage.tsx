import { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { useGetStudentsQuery } from '../api/studentApi';
import { studentColumns } from '../column/column';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';

import { useVirtualizer } from '@tanstack/react-virtual';
import { Pagination } from '@components/ui/Pagination';
import { TopAppBar } from '@components/layout/TopAppBar';
import { SkeletonTable } from '@components/ui/SkeletonTable';
import { useDebouncedValue } from '@hooks/useDebouncedValue';

export function StudentsPage() {
  const { data = [], isLoading, error } = useGetStudentsQuery(undefined);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') ?? '1') - 1;
  const pageSizeParam = searchParams.get('pageSize') ?? '10';

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const filteredData = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) {
      return data;
    }
    return data.filter(
      (student) =>
        student.name.toLowerCase().includes(q) ||
        student.rollNumber.toLowerCase().includes(q) ||
        student.guardian.toLowerCase().includes(q),
    );
  }, [data, debouncedSearch]);
  const pageSize =
    pageSizeParam === 'all'
      ? Math.max(filteredData.length, 1)
      : Number(pageSizeParam) || 10;

  const paginationPageSize =
    pageSizeParam === 'all' ? 'all' : pageSize;
  useEffect(() => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);

      if (params.get('page') !== '1') {
        params.set('page', '1');
      }

      return params;
    });
  }, [debouncedSearch, setSearchParams]);

  const onPageChange = (newPageIndex: number) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set('page', String(newPageIndex + 1));
      return params;
    });
  };

  const onPageSizeChange = (newPageSize: number | 'all') => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set('pageSize', String(newPageSize));
      params.set('page', '1');
      return params;
    });
  };

  const table = useReactTable({
    data: filteredData,
    columns: studentColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

    state: {
      pagination: {
        pageIndex: page,
        pageSize,
      },
    },

    onPaginationChange: (updater) => {
      const currentPagination = {
        pageIndex: page,
        pageSize,
      };

      const nextPagination =
        typeof updater === 'function'
          ? updater(currentPagination)
          : updater;

      if (nextPagination.pageIndex !== page) {
        onPageChange(nextPagination.pageIndex);
      }
    },
  });
  const rows = table.getRowModel().rows;
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 52,
    overscan: 8,
    getItemKey: (index) => rows[index]?.id ?? index,
  });

  if (isLoading) {
    return <SkeletonTable />;
  }
  if (error) {
    return (
      <div className="p-8 font-body text-error">
        Error loading students
      </div>
    );
  }

  const virtualRows = rowVirtualizer.getVirtualItems();
  const paddingTop =
    virtualRows.length > 0
      ? virtualRows[0].start
      : 0;

  const paddingBottom =
    virtualRows.length > 0
      ? rowVirtualizer.getTotalSize() -
      virtualRows[virtualRows.length - 1].end
      : 0;

  return (
    <>
      <TopAppBar>
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface mb-1">
            Students
          </h2>
        </div>
      </TopAppBar>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />

        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          placeholder="Search by name, roll, or guardian..."
          className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-on-surface placeholder:text-outline font-body focus:outline-none" />
      </div>

      {/* Table card */}
      <div
        className="bg-surface-container-lowest rounded-xl shadow-soft border border-outline-variant/30 overflow-hidden grow flex flex-col min-h-0">
        <div
          ref={tableContainerRef}
          className="overflow-auto flex-1 min-h-0 scrollbar-thin">
          <table
            className="w-full text-left border-collapse min-w-225">
            <thead className="sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="bg-surface-container text-on-surface-variant border-b border-outline-variant/50 text-sm tracking-wide uppercase font-label">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={
                        header.column.columnDef.meta?.thClassName
                      }
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div
                        className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap">
                        <span>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                        </span>

                        <span>
                          {header.column.getIsSorted() === 'asc'
                            ? ' ↑'
                            : header.column.getIsSorted() === 'desc'
                              ? ' ↓'
                              : ''}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody
              className="text-on-background font-body text-base divide-y divide-outline-variant/20">
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={table.getVisibleLeafColumns().length}
                    className="py-16 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="w-8 h-8 text-outline" />
                      <p className="font-semibold text-on-surface">
                        No students found
                      </p>
                      <p className="text-sm text-on-surface-variant">
                        Try adjusting your search.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {paddingTop > 0 && (
                    <tr>
                      <td
                        colSpan={table.getVisibleLeafColumns().length}
                        style={{
                          height: `${paddingTop}px`,
                          padding: 0,
                        }}
                      />
                    </tr>
                  )}

                  {virtualRows.map((virtualRow) => {
                    const row = rows[virtualRow.index];

                    return (
                      <tr
                        key={row.id}
                        data-index={virtualRow.index}
                        ref={rowVirtualizer.measureElement}
                        className="hover:bg-surface-container/30 transition-colors group">
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className={
                              cell.column.columnDef.meta?.tdClassName
                            }
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}

                  {paddingBottom > 0 && (
                    <tr>
                      <td
                        colSpan={table.getVisibleLeafColumns().length}
                        style={{
                          height: `${paddingBottom}px`,
                          padding: 0,
                        }}
                      />
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredData.length > 0 && (
          <Pagination
            pageIndex={page}
            pageSize={paginationPageSize}
            totalItems={filteredData.length}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            pageSizeOptions={[10, 25, 50, 100, 'all',]}
            className="shrink-0"
          />
        )}
      </div>
    </>
  );
}