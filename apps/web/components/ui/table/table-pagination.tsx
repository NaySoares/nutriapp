import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

type TablePaginationProps = {
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
  };
  onPageChange: (page: number) => void;
};

export function TablePagination({
  pagination,
  onPageChange,
}: TablePaginationProps) {
  const { page, pageSize, totalItems } = pagination;

  const totalPages = Math.ceil(totalItems / pageSize);

  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  const getPages = () => {
    const pages: (number | "...")[] = [];

    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);

    if (page > 3) pages.push("...");

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (page < totalPages - 2) pages.push("...");

    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="flex flex-col gap-2 border-t border-[#edf1ed] px-5 py-3.5 sm:flex-row sm:justify-between">
      <span className="text-[10px] text-[#87948b]">
        Exibindo <span className="font-medium text-gray-700">{startItem}-{endItem}</span> de{" "}
        <span className="font-medium text-gray-700">{totalItems}</span> registros
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Página anterior"
          className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition hover:bg-[#fbfdfb] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft size={14} />
        </button>

        {getPages().map((item, index) =>
          item === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-7 w-6 items-center justify-center text-gray-400"
            >
              <MoreHorizontal size={13} />
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-label={`Página ${item}`}
              aria-current={page === item ? "page" : undefined}
              className={`flex h-7 min-w-7 items-center justify-center rounded-md px-2 text-[9px] transition ${
                page === item
                  ? "bg-green-700 font-semibold text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Próxima página"
          className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}