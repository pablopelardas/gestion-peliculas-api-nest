export class PaginatedDataResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;

  constructor(data: T[] = [], total: number = 0, limit: number = 0, offset: number = 0) {
    this.data = data;
    this.total = total;
    this.limit = limit;
    this.offset = offset;
  }
}
