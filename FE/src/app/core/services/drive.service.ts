import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { DriveItemDTO, DriveListResponse } from '../models/drive.model';

export * from '../models/drive.model';

@Injectable({
  providedIn: 'root',
})
export class DriveService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/v1/drive';

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  getItems(folderPath = '/'): Observable<DriveListResponse> {
    return this.http.get<any>(`${this.apiUrl}/items`, {
      headers: this.getAuthHeaders(),
      params: { folderPath }
    }).pipe(
      map(res => res?.data || res)
    );
  }

  createFolder(name: string, folderPath = '/'): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create-folder`, { name, folderPath }, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => res?.data || res)
    );
  }

  upload(files: File[], folderPath = '/'): Observable<any> {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    formData.append('folderPath', folderPath);
    return this.http.post<any>(`${this.apiUrl}/upload`, formData, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => res?.data || res)
    );
  }

  rename(id: string, name: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/items/${id}/rename`, { name }, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => res?.data || res)
    );
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/items/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => res?.data || res)
    );
  }

  getTrashItems(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/trash`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => res?.data || res)
    );
  }

  restore(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/trash/restore/${id}`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => res?.data || res)
    );
  }

  hardDelete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/trash/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => res?.data || res)
    );
  }

  emptyTrash(): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/trash/empty`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => res?.data || res)
    );
  }

  downloadBlob(publicUrl: string): Observable<Blob> {
    const fullUrl = this.getFileViewUrl(publicUrl);
    return this.http.get(fullUrl, {
      responseType: 'blob'
    });
  }

  getFileViewUrl(publicUrl?: string): string {
    if (!publicUrl) return '';
    if (publicUrl.startsWith('http')) return publicUrl;
    return `http://localhost:5000${publicUrl.startsWith('/') ? '' : '/'}${publicUrl}`;
  }
}

