import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { LeadService } from '../../core/services/lead.service';

export interface UploadStats {
  message: string;
  inserted: number;
  skipped: number;
  totalAttempted: number;
}

@Component({
  selector: 'app-upload-excel',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './upload-excel.html'
})
export class UploadExcelComponent {
  private leadService = inject(LeadService);
  private router = inject(Router);

  selectedFile = signal<File | null>(null);
  isUploading = signal<boolean>(false);
  errorMessage = signal<string>('');
  uploadResult = signal<UploadStats | null>(null);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files ) {
      this.setFile(input.files[0]);
    }
  }

  setFile(file: File): void {
    this.errorMessage.set('');
    this.uploadResult.set(null);

    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      this.errorMessage.set('Please select a valid Excel file (.xlsx, .xls, or .csv).');
      this.selectedFile.set(null);
      return;
    }

    this.selectedFile.set(file);
  }

  clearFile(): void {
    this.selectedFile.set(null);
    this.errorMessage.set('');
    this.uploadResult.set(null);
  }

  uploadFile(): void {
    const file = this.selectedFile();
    if (!file) return;

    this.isUploading.set(true);
    this.errorMessage.set('');
    this.uploadResult.set(null);

    this.leadService.uploadExcelFile(file).subscribe({
      next: (response) => {
        this.isUploading.set(false);
        this.uploadResult.set({
          message: response.message || 'File processed successfully!',
          inserted: response.inserted ?? response.insertedCount ?? 0,
          skipped: response.skipped ?? 0,
          totalAttempted: response.totalAttempted ?? (response.insertedCount ?? 0) + (response.skipped ?? 0)
        });
      },
      error: (err) => {
        this.isUploading.set(false);
        console.error('Error uploading Excel file:', err);
        this.errorMessage.set(err.error?.error || err.error?.message || 'Failed to upload Excel file. Please try again.');
      }
    });
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
