import React from 'react';
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Paper,
  Box,
  Typography,
  Skeleton,
} from '@mui/material';

export interface TableColumn<T = any> {
  /** Unique identifier for the column */
  id: string;
  /** Column header label */
  label: string;
  /** Whether column is sortable */
  sortable?: boolean;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Minimum width */
  minWidth?: number;
  /** Custom render function */
  render?: (row: T, index: number) => React.ReactNode;
  /** Field key for accessing data */
  field?: keyof T;
}

export type SortDirection = 'asc' | 'desc';

export interface TableProps<T = any> {
  /** Column definitions */
  columns: TableColumn<T>[];
  /** Table data */
  data: T[];
  /** Unique key field for rows */
  keyField?: keyof T | ((row: T) => string | number);
  /** Loading state */
  loading?: boolean;
  /** Number of skeleton rows when loading */
  loadingRows?: number;
  /** Empty state message */
  emptyMessage?: string;
  /** Current sort field */
  sortBy?: string;
  /** Current sort direction */
  sortDirection?: SortDirection;
  /** Sort change handler */
  onSort?: (field: string, direction: SortDirection) => void;
  /** Pagination enabled */
  pagination?: boolean;
  /** Current page (0-indexed) */
  page?: number;
  /** Rows per page */
  rowsPerPage?: number;
  /** Total row count for pagination */
  totalCount?: number;
  /** Page change handler */
  onPageChange?: (page: number) => void;
  /** Rows per page change handler */
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  /** Rows per page options */
  rowsPerPageOptions?: number[];
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Whether rows are clickable */
  hoverable?: boolean;
  /** Dense padding */
  dense?: boolean;
  /** Whether to use Paper wrapper */
  elevation?: number;
}

/**
 * Table Component
 * 
 * Data table with sorting, pagination, and loading states.
 * 
 * @example
 * ```tsx
 * <Table
 *   columns={[
 *     { id: 'name', label: 'Product Name', sortable: true },
 *     { id: 'price', label: 'Price', align: 'right' },
 *     { id: 'stock', label: 'Stock', render: (row) => <Badge>{row.stock}</Badge> },
 *   ]}
 *   data={products}
 *   keyField="id"
 *   pagination
 *   page={page}
 *   rowsPerPage={10}
 *   totalCount={100}
 *   onPageChange={setPage}
 * />
 * ```
 */
export function Table<T extends Record<string, any>>({
  columns,
  data,
  keyField = 'id' as keyof T,
  loading = false,
  loadingRows = 5,
  emptyMessage = 'No data available',
  sortBy,
  sortDirection = 'asc',
  onSort,
  pagination = false,
  page = 0,
  rowsPerPage = 10,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 25, 50],
  onRowClick,
  hoverable = false,
  dense = false,
  elevation = 1,
}: TableProps<T>) {
  const getRowKey = (row: T, index: number): string | number => {
    if (typeof keyField === 'function') {
      return keyField(row);
    }
    return row[keyField] ?? index;
  };

  const getCellValue = (row: T, column: TableColumn<T>, index: number) => {
    if (column.render) {
      return column.render(row, index);
    }
    if (column.field) {
      return row[column.field];
    }
    return row[column.id];
  };

  const handleSort = (columnId: string) => {
    if (!onSort) return;
    const newDirection = sortBy === columnId && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(columnId, newDirection);
  };

  const renderLoadingRows = () => {
    return Array.from({ length: loadingRows }).map((_, rowIndex) => (
      <TableRow key={`loading-${rowIndex}`}>
        {columns.map((column) => (
          <TableCell key={column.id} align={column.align}>
            <Skeleton variant="text" width="80%" />
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  const renderEmptyState = () => (
    <TableRow>
      <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          {emptyMessage}
        </Typography>
      </TableCell>
    </TableRow>
  );

  return (
    <Box>
      <TableContainer component={Paper} elevation={elevation}>
        <MuiTable size={dense ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  sx={{
                    minWidth: column.minWidth,
                    fontWeight: 600,
                    bgcolor: 'background.default',
                  }}
                >
                  {column.sortable && onSort ? (
                    <TableSortLabel
                      active={sortBy === column.id}
                      direction={sortBy === column.id ? sortDirection : 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? renderLoadingRows()
              : data.length === 0
              ? renderEmptyState()
              : data.map((row, index) => (
                  <TableRow
                    key={getRowKey(row, index)}
                    hover={hoverable || Boolean(onRowClick)}
                    onClick={() => onRowClick?.(row)}
                    sx={{
                      cursor: onRowClick ? 'pointer' : 'default',
                    }}
                  >
                    {columns.map((column) => (
                      <TableCell key={column.id} align={column.align}>
                        {getCellValue(row, column, index)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
          </TableBody>
        </MuiTable>
      </TableContainer>

      {pagination && (
        <TablePagination
          component="div"
          count={totalCount ?? data.length}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={rowsPerPageOptions}
          onPageChange={(_, newPage) => onPageChange?.(newPage)}
          onRowsPerPageChange={(e) =>
            onRowsPerPageChange?.(parseInt(e.target.value, 10))
          }
        />
      )}
    </Box>
  );
}

Table.displayName = 'Table';

export default Table;
