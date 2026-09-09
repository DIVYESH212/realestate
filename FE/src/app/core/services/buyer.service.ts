import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BuyerRecord, BuyerFilterParams } from '../models/buyer.model';

const BACKEND_PORT = 5000;

@Injectable({
  providedIn: 'root'
})
export class BuyerService {
  private apiUrl = `http://localhost:${BACKEND_PORT}/api/v1/buyer`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  getBuyers(page: number = 1, limit: number = 10, filters: BuyerFilterParams = {}): Observable<{ buyers: BuyerRecord[], totalItems: number, count?: number }> {
    const payload = {
      page,
      limit,
      filters: {
        name: filters.name || null,
        email: filters.email || null,
        mobilenumber: filters.mobilenumber || null,
        address: filters.address || null,
        buyerStatus: filters.buyerStatus && filters.buyerStatus !== 'all' ? filters.buyerStatus : null,
        lead_id: filters.lead_id || null,
        search: filters.search || null,
        propertyInfo: filters.search || null
      }
    };

    return this.http.post<any>(`${this.apiUrl}/search`, payload, { headers: this.getAuthHeaders() }).pipe(
      map(response => {
        const resData = response?.data || response;
        const buyersList = Array.isArray(resData) ? resData : (resData.items || resData.data || []);
        return {
          buyers: buyersList,
          totalItems: resData.pagination?.totalItems || resData.totalItems || resData.count || response.count || buyersList.length,
          count: resData.count || response.count || buyersList.length
        };
      })
    );
  }

  getBuyerById(id: string): Observable<BuyerRecord> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      map(response => response?.data || response)
    );
  }

  createBuyer(buyer: Partial<BuyerRecord>): Observable<BuyerRecord> {
    return this.http.post<any>(this.apiUrl, buyer, { headers: this.getAuthHeaders() }).pipe(
      map(response => response?.data || response)
    );
  }

  updateBuyer(id: string, buyer: Partial<BuyerRecord>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, buyer, { headers: this.getAuthHeaders() }).pipe(
      map(response => response?.data || response)
    );
  }

  deleteBuyer(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      map(response => response?.data || response)
    );
  }
}
