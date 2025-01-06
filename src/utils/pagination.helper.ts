export interface PaginationParams {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export function parsePaginationAndSorting(params: PaginationParams) {
  const page = params.page && params.page > 0 ? params.page : 1;
  const pageSize =
    params.pageSize && params.pageSize > 0 ? params.pageSize : 10;
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const orderBy = params.orderBy || 'id';
  const orderDirection = params.orderDirection || 'asc';

  return { skip, take, orderBy, orderDirection };
}
