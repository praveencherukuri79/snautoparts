import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@environments/environment';
import { MockDataService } from './mock-data.service';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  data: T;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private mockData = inject(MockDataService);
  private baseUrl = environment.apiBaseUrl;

  /**
   * GET request - returns unwrapped data
   * When mock data is enabled, returns mock response instead of making HTTP call
   */
  async get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> {
    // Check for mock data first
    if (this.mockData.isEnabled()) {
      const mockResponse = this.mockData.mockEndpoint<ApiResponse<T>>(endpoint, params);
      if (mockResponse) {
        // Simulate async behavior
        await this.simulateLatency();
        return mockResponse.data;
      }
    }

    // Make real HTTP call
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    const response = await firstValueFrom(
      this.http.get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, { 
        params: httpParams,
        withCredentials: true,
      }),
    );
    return response.data;
  }

  /**
   * GET request for paginated data - returns full paginated response
   * When mock data is enabled, returns mock response instead of making HTTP call
   */
  async getPaginated<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<PaginatedResponse<T>> {
    // Check for mock data first
    if (this.mockData.isEnabled()) {
      const mockResponse = this.mockData.mockEndpoint<PaginatedResponse<T>>(endpoint, params);
      if (mockResponse) {
        await this.simulateLatency();
        return mockResponse;
      }
    }

    // Make real HTTP call
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return firstValueFrom(
      this.http.get<PaginatedResponse<T>>(`${this.baseUrl}${endpoint}`, { 
        params: httpParams,
        withCredentials: true,
      }),
    );
  }

  /**
   * POST request
   * When mock data is enabled, simulates success and returns mock response
   */
  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    // For mock mode, simulate successful POST by returning the body or a mock response
    if (this.mockData.isEnabled()) {
      await this.simulateLatency();
      // Try to get a mock response, otherwise return the body as-is
      const mockResponse = this.mockData.mockEndpoint<ApiResponse<T>>(endpoint);
      if (mockResponse) {
        return mockResponse.data;
      }
      // For create operations, return the body with a generated ID
      return { id: `mock-${Date.now()}`, ...(body as object) } as T;
    }

    const response = await firstValueFrom(
      this.http.post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body, { withCredentials: true }),
    );
    return response.data;
  }

  /**
   * PATCH request
   * When mock data is enabled, simulates success and returns the patched data
   */
  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    if (this.mockData.isEnabled()) {
      await this.simulateLatency();
      // For update operations, return the body merged with mock data
      const mockResponse = this.mockData.mockEndpoint<ApiResponse<T>>(endpoint);
      if (mockResponse) {
        return { ...(mockResponse.data as object), ...(body as object) } as T;
      }
      return body as T;
    }

    const response = await firstValueFrom(
      this.http.patch<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body, { withCredentials: true }),
    );
    return response.data;
  }

  /**
   * PUT request
   * When mock data is enabled, simulates success
   */
  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    if (this.mockData.isEnabled()) {
      await this.simulateLatency();
      return body as T;
    }

    const response = await firstValueFrom(
      this.http.put<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body, { withCredentials: true }),
    );
    return response.data;
  }

  /**
   * DELETE request
   * When mock data is enabled, simulates success
   */
  async delete<T>(endpoint: string): Promise<T> {
    if (this.mockData.isEnabled()) {
      await this.simulateLatency();
      return { success: true } as T;
    }

    const response = await firstValueFrom(
      this.http.delete<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, { withCredentials: true }),
    );
    return response.data;
  }

  /**
   * Download a file (returns Blob)
   * Not mocked - returns empty blob in mock mode
   */
  async download(endpoint: string): Promise<Blob> {
    if (this.mockData.isEnabled()) {
      await this.simulateLatency();
      // Return an empty blob for mock mode
      return new Blob(['Mock CSV data'], { type: 'text/csv' });
    }

    return firstValueFrom(
      this.http.get(`${this.baseUrl}${endpoint}`, { responseType: 'blob', withCredentials: true }),
    );
  }

  /**
   * Upload a file (FormData)
   * When mock data is enabled, returns mock success response
   */
  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    if (this.mockData.isEnabled()) {
      await this.simulateLatency();
      // Return mock upload success response
      return {
        success: true,
        totalRows: 100,
        processedRows: 100,
        createdProducts: 50,
        updatedProducts: 50,
        errors: [],
      } as T;
    }

    const response = await firstValueFrom(
      this.http.post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, formData, { withCredentials: true }),
    );
    return response.data;
  }

  /**
   * Simulate network latency for mock mode (50-200ms)
   */
  private simulateLatency(): Promise<void> {
    const delay = 50 + Math.random() * 150;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}
