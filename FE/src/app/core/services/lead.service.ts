import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LeadRecord } from '../models/lead.model';

const BACKEND_PORT = 5000;

@Injectable({
  providedIn: 'root'
})
export class LeadService {
  private apiUrl = `http://localhost:${BACKEND_PORT}/api/v1/leads`;

  // Navigation State for Filtered Leads
  navigationLeads = signal<any[]>([]);
  navigationContextTitle = signal<string>('');
  allLeads = signal<any[]>([]);

  setNavigationLeads(leads: any[], contextTitle: string = '', allLeadsList: any[] = []): void {
    this.navigationLeads.set(leads || []);
    this.navigationContextTitle.set(contextTitle);
    this.allLeads.set(allLeadsList && allLeadsList.length > 0 ? allLeadsList : (leads || []));
  }

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  getLeads(page: number = 1, limit: number = 10, filters: any = {}): Observable<{ leads: LeadRecord[], totalItems: number }> {
  const payload = {
    page,
    limit,
    propertyInfo: filters.propertyInfo || null,
    startDate: filters.startDate || null,
    endDate: filters.endDate || null,
    market_segment: filters.market_segment !== 'all' ? filters.market_segment : null,
    addressAvailability: filters.addressAvailability !== 'all' ? filters.addressAvailability : null,
    propertyValueOperator: filters.propertyValueOperator || null,
    propertyValueMin: filters.propertyValueMin || null,
    propertyValueMax: filters.propertyValueMax || null,
    loanAmountOperator: filters.loanAmountOperator || null,
    loanAmountMin: filters.loanAmountMin || null,
    loanAmountMax: filters.loanAmountMax || null,
    buyerName: filters.buyerName || null,
    buyerAddress: filters.buyerAddress || null,
    buyerMobileNumber: filters.buyerMobileNumber || filters.buyerMobile || null,
    buyerEmail: filters.buyerEmail || null
  };

  // POST request body instead of GET query params
  return this.http.post<any>(`${this.apiUrl}/search`, payload, { headers: this.getAuthHeaders() }).pipe(
    map(response => {
      const resData = response?.data || response;
      return {
        leads: Array.isArray(resData) ? resData : (resData.data || []),
        totalItems: resData.pagination?.totalItems || response.pagination?.totalItems || (Array.isArray(resData) ? resData.length : 0),
        count: resData.count || response.count
      };
    })
  );
} 


 getLeadById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  createLead(lead: Omit<LeadRecord, 'id'>): Observable<LeadRecord> {
    return this.http.post<LeadRecord>(this.apiUrl, lead, { headers: this.getAuthHeaders() });
  }

  updateLead(id: string, lead: Partial<LeadRecord> | Record<string, any>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, lead, { headers: this.getAuthHeaders() });
  }

  deleteLead(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
  
  createBuyer(buyerData: any): Observable<any> {
    const buyerUrl = `http://localhost:${BACKEND_PORT}/api/v1/buyer`;
    return this.http.post<any>(buyerUrl, buyerData, { headers: this.getAuthHeaders() });
  }
   
  exportLeadsToExcel(filters: any): Observable<any[]> {
    const payload = {
      export: 'excel',
      propertyInfo: filters.propertyInfo || null,
      startDate: filters.startDate || null,
      endDate: filters.endDate || null,
      market_segment: filters.market_segment !== 'all' ? filters.market_segment : null,
      addressAvailability: filters.addressAvailability !== 'all' ? filters.addressAvailability : null,
      propertyValueOperator: filters.propertyValueOperator || null,
      propertyValueMin: filters.propertyValueMin || null,
      propertyValueMax: filters.propertyValueMax || null,
      loanAmountOperator: filters.loanAmountOperator || null,
      loanAmountMin: filters.loanAmountMin || null,
      loanAmountMax: filters.loanAmountMax || null,
      buyerName: filters.buyerName || null,
      buyerAddress: filters.buyerAddress || null,
      buyerMobileNumber: filters.buyerMobileNumber || filters.buyerMobile || null,
      buyerEmail: filters.buyerEmail || null
    };

    return this.http.post<any>(`${this.apiUrl}/search`, payload, { headers: this.getAuthHeaders() }).pipe(
      map(response => {
        const resData = response?.data || response;
        if (Array.isArray(resData)) return resData;
        if (Array.isArray(resData?.data)) return resData.data;
        return [];
      })
    );
  }

  uploadExcelFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('excelFile', file);

    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post<any>(`${this.apiUrl}/upload-excel`, formData, { headers });
  }

  getLeadAiSummary(leadId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ai-summary/${leadId}`, { headers: this.getAuthHeaders() }).pipe(
      map(res => res?.data || res)
    );
  }
}
