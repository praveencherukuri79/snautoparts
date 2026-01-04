import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

// Backend response wrapper types
interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private buildParams(params?: Record<string, string | number | boolean>): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return httpParams;
  }

  // Unwrap backend response - extracts data from { data: T } wrapper
  private unwrap<T>(response: ApiResponse<T> | T): T {
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as ApiResponse<T>).data;
    }
    return response as T;
  }

  get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Observable<T> {
    return this.http.get<ApiResponse<T> | T>(`${this.baseUrl}${endpoint}`, { params: this.buildParams(params) })
      .pipe(map(res => this.unwrap(res)));
  }

  // Get raw response without unwrapping - useful for endpoints with non-standard response shapes
  getRaw<T>(endpoint: string, params?: Record<string, string | number | boolean>): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { params: this.buildParams(params) });
  }

  // For paginated endpoints - transforms { data: [], meta: {} } to { [itemsKey]: [], page, total, ... }
  getPaginated<T, R>(endpoint: string, itemsKey: string, params?: Record<string, string | number | boolean>): Observable<R> {
    return this.http.get<ApiResponse<T[]>>(`${this.baseUrl}${endpoint}`, { params: this.buildParams(params) })
      .pipe(map(res => {
        const items = res.data || [];
        const meta = res.meta || { page: 1, limit: 20, total: 0, totalPages: 0 };
        return {
          [itemsKey]: items,
          total: meta.total,
          page: meta.page,
          pageSize: meta.limit,
          totalPages: meta.totalPages,
        } as R;
      }));
  }

  post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.post<ApiResponse<T> | T>(`${this.baseUrl}${endpoint}`, body)
      .pipe(map(res => this.unwrap(res)));
  }

  put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.put<ApiResponse<T> | T>(`${this.baseUrl}${endpoint}`, body)
      .pipe(map(res => this.unwrap(res)));
  }

  patch<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.patch<ApiResponse<T> | T>(`${this.baseUrl}${endpoint}`, body)
      .pipe(map(res => this.unwrap(res)));
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<ApiResponse<T> | T>(`${this.baseUrl}${endpoint}`)
      .pipe(map(res => this.unwrap(res)));
  }
}

