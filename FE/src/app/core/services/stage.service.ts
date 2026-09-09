import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const BACKEND_PORT = 5000;

@Injectable({
  providedIn: 'root'
})
export class StageService {
  private apiUrl = `http://localhost:${BACKEND_PORT}/api/v1/stage`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  getStages(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      map(res => res?.data || res || [])
    );
  }

  addStage(stage: { name: string; order?: number }): Observable<any> {
    return this.http.post<any>(this.apiUrl, stage, { headers: this.getAuthHeaders() }).pipe(
      map(res => res?.data || res)
    );
  }

  updateStage(stageId: string, stage: { name?: string; order?: number }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${stageId}`, stage, { headers: this.getAuthHeaders() }).pipe(
      map(res => res?.data || res)
    );
  }

  deleteStage(stageId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${stageId}`, { headers: this.getAuthHeaders() }).pipe(
      map(res => res?.data || res)
    );
  }
}
