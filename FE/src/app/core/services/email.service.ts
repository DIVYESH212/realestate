import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EmailRecord, SendEmailPayload } from '../models/email.model';

const BACKEND_PORT = 5000;

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = `http://localhost:${BACKEND_PORT}/api/v1/email`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  getEmails(options: {
    lead_id?: string;
    search?: string;
  } = {}): Observable<{ emails: EmailRecord[]; total: number }> {
    let params = new HttpParams();

    if (options.lead_id) {
      params = params.set('lead_id', options.lead_id);
    }
    if (options.search) {
      params = params.set('search', options.search);
    }

    return this.http.get<any>(this.apiUrl, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      map(response => {
        const data = response?.data !== undefined ? response.data : response;
        if (Array.isArray(data)) {
          return { emails: data, total: data.length };
        }
        return {
          emails: Array.isArray(data?.emails) ? data.emails : (Array.isArray(data?.items) ? data.items : []),
          total: typeof data?.total === 'number' ? data.total : (Array.isArray(data?.emails) ? data.emails.length : 0)
        };
      })
    );
  }

  sendEmail(payload: SendEmailPayload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/send`, payload, {
      headers: this.getAuthHeaders()
    });
  }

  deleteEmail(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
