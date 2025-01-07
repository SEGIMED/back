export interface PaginationParams {
  page?: number | string;
  pageSize?: number | string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export function parsePaginationAndSorting(params: PaginationParams) {
  const page = params.page && Number(params.page) > 0 ? Number(params.page) : 1;
  const pageSize =
    params.pageSize && Number(params.pageSize) > 0
      ? Number(params.pageSize)
      : 10;
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const orderBy = params.orderBy || 'id';
  const orderDirection = params.orderDirection || 'asc';

  return { skip, take, orderBy, orderDirection };
}
