import { useMemo, useState } from "react";

function compareValues(left, right) {
  if (left == null) return right == null ? 0 : -1;
  if (right == null) return 1;
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }
  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

export default function DataTable({
  columns,
  rows,
  rowKey,
  emptyMessage = "No records found.",
  searchPlaceholder = "Search...",
  pageSize = 10,
  searchValue,
  onSearchChange,
  toolbarActions,
  showSearch = true,
  showPagination = true,
  className,
  cardClassName,
  tableClassName,
}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState(null);
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const matchingRows = query && !onSearchChange
      ? rows.filter((row) =>
        columns.some(
          (column) =>
            column.searchable !== false &&
            typeof column.value === "function" &&
            String(column.value(row) ?? "")
              .toLocaleLowerCase()
              .includes(query),
        ),
      )
      : rows;

    if (!sort) return matchingRows;
    const column = columns.find((item) => item.key === sort.key);
    if (!column || typeof column.value !== "function") return matchingRows;

    return [...matchingRows].sort(
      (left, right) =>
        compareValues(column.value(left), column.value(right)) * sort.direction,
    );
  }, [columns, onSearchChange, rows, search, sort]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleRows = filteredRows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  function updateSearch(value) {
    setSearch(value);
    setPage(1);
  }

  function toggleSort(column) {
    if (column.sortable === false || typeof column.value !== "function") return;
    setSort((current) => ({
      key: column.key,
      direction:
        current?.key === column.key && current.direction === 1 ? -1 : 1,
    }));
    setPage(1);
  }

  return (
    <div className={className}>
      {(showSearch || toolbarActions) && (
        <div className="data-table-toolbar">
          {showSearch && (
            <label className="data-table-search">
              <span>Search</span>
              <input
                type="search"
                value={searchValue ?? search}
                onChange={(event) =>
                  onSearchChange
                    ? onSearchChange(event.target.value)
                    : updateSearch(event.target.value)
                }
                placeholder={searchPlaceholder}
              />
            </label>
          )}
          {showSearch && (
            <span className="data-table-count">
              {filteredRows.length} {filteredRows.length === 1 ? "record" : "records"}
            </span>
          )}
          {toolbarActions}
        </div>
      )}
      <div className={`table-card ${cardClassName || ""}`}>
        <table className={tableClassName}>
          <thead>
            <tr>
              {columns.map((column) => {
                const direction =
                  sort?.key === column.key ? sort.direction : null;
                return (
                  <th
                    key={column.key}
                    aria-sort={
                      direction === 1
                        ? "ascending"
                        : direction === -1
                          ? "descending"
                          : "none"
                    }
                  >
                    {column.sortable === false ||
                      typeof column.value !== "function" ? (
                      column.header
                    ) : (
                      <button
                        className="data-table-sort"
                        type="button"
                        onClick={() => toggleSort(column)}
                      >
                        {column.header}
                        {direction === 1
                          ? " ↑"
                          : direction === -1
                            ? " ↓"
                            : ""}
                      </button>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visibleRows.length ? (
              visibleRows.map((row) => (
                <tr key={rowKey(row)}>
                  {columns.map((column) => (
                    <td key={column.key} className={column.cellClassName}>
                      {column.render
                        ? column.render(row)
                        : column.value(row)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="data-table-empty">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showPagination && filteredRows.length > pageSize && (
        <div className="pagination-controls" aria-label="Table pagination">
          <span>
            Showing {(currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, filteredRows.length)} of{" "}
            {filteredRows.length}
          </span>
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {pageCount}
          </span>
          <button
            type="button"
            disabled={currentPage === pageCount}
            onClick={() => setPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
