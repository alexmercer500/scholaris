import { useGetStudentsQuery } from "../api/studentApi";
import { PageHeader } from "@components/ui/PageHeader";
import { studentColumns } from "../column/column";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

export function StudentsPage() {
  const { data = [], isLoading, error } = useGetStudentsQuery(undefined);
  const table = useReactTable({
    data: data,
    columns: studentColumns,
    getCoreRowModel: getCoreRowModel(),
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
      <PageHeader
        title="Students Directory"
        subtitle="Manage, filter, and review student records and academic standing."
      />

      {/* Bento table card */}
      <div className="bg-surface-container-lowest rounded-xl shadow-soft border border-outline-variant/30 overflow-hidden grow">
        <div className="overflow-x-auto h-full">
          <table className="w-full text-left border-collapse min-w-225">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="bg-surface-container text-on-surface-variant border-b border-outline-variant/50 text-sm tracking-wide uppercase font-label"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={header.column.columnDef.meta?.thClassName}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
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
        </div>
      </div>
    </>
  );
}
