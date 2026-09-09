import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { DriveService } from '../../core/services/drive.service';
import { DriveItemDTO } from '../../core/models/drive.model';

@Component({
  selector: 'app-drive',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './drive.html',
})
export class DriveComponent implements OnInit {
  protected driveService = inject(DriveService);

  searchQuery = signal<string>('');
  selectedCategory = signal<string>('all');
  viewMode = signal<'grid' | 'list'>('grid');
  isLoading = signal<boolean>(false);
  currentFolderPath = signal<string>('/');
  
  // Menus and modals
  activeMenuId = signal<string | null>(null);
  previewFile = signal<DriveItemDTO | null>(null);
  renameFile = signal<DriveItemDTO | null>(null);
  newFileName = '';
  isCreateFolderOpen = signal<boolean>(false);
  newFolderName = '';
  isDragOver = false;

  // Data: All items fetched from backend for current folder/search/trash
  allItems = signal<DriveItemDTO[]>([]);
  totalStorage = signal<string>('0 Bytes');

  categories = [
    { key: 'all', label: 'All files', icon: 'fa-solid fa-layer-group' },
    { key: 'folder', label: 'Folders', icon: 'fa-solid fa-folder' },
    { key: 'doc', label: 'Documents', icon: 'fa-solid fa-file-word' },
    { key: 'sheet', label: 'Spreadsheets', icon: 'fa-solid fa-file-excel' },
    { key: 'slide', label: 'Presentations', icon: 'fa-solid fa-file-powerpoint' },
    { key: 'pdf', label: 'PDFs', icon: 'fa-solid fa-file-pdf' },
    { key: 'image', label: 'Images', icon: 'fa-solid fa-file-image' },
    { key: 'video', label: 'Videos', icon: 'fa-solid fa-file-video' },
    { key: 'trash', label: 'Trash', icon: 'fa-solid fa-trash-can' },
  ];

  isTrashView = computed(() => this.selectedCategory() === 'trash');

  // Filter all items linearly based on selected category and search query
  filteredItems = computed(() => {
    const cat = this.selectedCategory();
    const query = this.searchQuery().toLowerCase().trim();
    let items = this.allItems();

    // 1. Category Filter
    if (cat === 'trash') {
      // Show all trash items
    } else if (cat === 'folder') {
      items = items.filter(item => item.isDirectory || item.category === 'folder');
    } else if (cat !== 'all') {
      items = items.filter(item => !item.isDirectory && item.category === cat);
    }

    // 2. Client-side Search Filter (by item name)
    if (query) {
      items = items.filter(item => item.name ? item.name.toLowerCase().includes(query) : false);
    }

    return items;
  });

  selectedCategoryLabel = computed(() => {
    const found = this.categories.find(c => c.key === this.selectedCategory());
    return found ? found.label : 'Files';
  });

  ngOnInit(): void {
    this.loadDriveItems();
  }

  loadDriveItems(): void {
    this.isLoading.set(true);
    if (this.isTrashView()) {
      this.driveService.getTrashItems().subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.allItems.set(res?.items || []);
          if (res?.totalStorageBytes !== undefined) {
            this.totalStorage.set(this.formatBytes(res.totalStorageBytes || 0));
          }
        },
        error: () => {
          this.isLoading.set(false);
          this.allItems.set([]);
        }
      });
    } else {
      this.driveService.getItems(this.currentFolderPath()).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.allItems.set(res?.items || []);
          if (res?.totalStorageBytes !== undefined) {
            this.totalStorage.set(this.formatBytes(res.totalStorageBytes || 0));
          }
        },
        error: () => {
          this.isLoading.set(false);
          this.allItems.set([]);
        }
      });
    }
  }

  setCategory(categoryKey: string): void {
    const prev = this.selectedCategory();
    this.selectedCategory.set(categoryKey);
    if (categoryKey === 'trash' || prev === 'trash') {
      this.loadDriveItems();
    }
  }

  get breadcrumbs(): { name: string; path: string }[] {
    if (this.isTrashView()) {
      return [{ name: 'Trash', path: 'trash' }];
    }
    const p = this.currentFolderPath();
    if (p === '/' || !p) return [{ name: 'My Drive', path: '/' }];
    const parts = p.split('/').filter(Boolean);
    const crumbs = [{ name: 'My Drive', path: '/' }];
    let accum = '';
    for (const part of parts) {
      accum += `/${part}`;
      crumbs.push({ name: part, path: accum });
    }
    return crumbs;
  }

  navigateTo(path: string): void {
    if (this.isTrashView()) {
      this.setCategory('all');
      this.currentFolderPath.set('/');
      this.loadDriveItems();
      return;
    }
    this.currentFolderPath.set(path);
    this.loadDriveItems();
  }

  openItem(item: DriveItemDTO): void {
    if (this.isTrashView()) {
      if (!item.isDirectory) {
        this.previewFile.set(item);
      }
      return;
    }

    if (item.isDirectory) {
      const parent = this.currentFolderPath() === '/' ? '' : this.currentFolderPath();
      this.navigateTo(`${parent}/${item.name}`);
    } else {
      this.previewFile.set(item);
    }
  }

  toggleMenu(id: string, event: Event): void {
    event.stopPropagation();
    this.activeMenuId.set(this.activeMenuId() === id ? null : id);
  }

  @HostListener('document:click')
  closeMenus(): void {
    this.activeMenuId.set(null);
  }

  openRename(item: DriveItemDTO, event?: Event): void {
    if (event) event.stopPropagation();
    this.renameFile.set(item);
    this.newFileName = item.name;
    this.activeMenuId.set(null);
  }

  saveRename(): void {
    const target = this.renameFile();
    if (target && this.newFileName.trim()) {
      this.driveService.rename(target._id, this.newFileName.trim()).subscribe({
        next: () => {
          this.renameFile.set(null);
          this.loadDriveItems();
        },
        error: (err) => {
          console.error('Failed to rename item:', err);
          alert(err?.error?.message || err?.message || 'Failed to rename item');
        }
      });
    }
  }

  createFolder(): void {
    if (!this.newFolderName.trim()) return;
    this.driveService.createFolder(this.newFolderName.trim(), this.currentFolderPath()).subscribe({
      next: () => {
        this.newFolderName = '';
        this.isCreateFolderOpen.set(false);
        this.loadDriveItems();
      }
    });
  }

  // Soft delete (moves item to trash)
  deleteItem(item: DriveItemDTO, event?: Event): void {
    if (event) event.stopPropagation();
    this.driveService.delete(item._id).subscribe({
      next: () => {
        this.activeMenuId.set(null);
        this.loadDriveItems();
      },
      error: (err) => {
        console.error('Failed to move item to trash:', err);
      }
    });
  }

  // Restore item from trash
  restoreItem(item: DriveItemDTO, event?: Event): void {
    if (event) event.stopPropagation();
    this.driveService.restore(item._id).subscribe({
      next: () => {
        this.activeMenuId.set(null);
        if (this.previewFile()?._id === item._id) {
          this.previewFile.set(null);
        }
        this.loadDriveItems();
      },
      error: (err) => {
        console.error('Failed to restore item:', err);
      }
    });
  }

  // Hard delete (permanently removes item and physical file)
  hardDeleteItem(item: DriveItemDTO, event?: Event): void {
    if (event) event.stopPropagation();
    if (confirm(`Permanently delete "${item.name}"? This cannot be undone.`)) {
      this.driveService.hardDelete(item._id).subscribe({
        next: () => {
          this.activeMenuId.set(null);
          if (this.previewFile()?._id === item._id) {
            this.previewFile.set(null);
          }
          this.loadDriveItems();
        },
        error: (err) => {
          console.error('Failed to delete item permanently:', err);
        }
      });
    }
  }

  // Empty all trash
  emptyTrash(): void {
    if (confirm('Are you sure you want to empty the trash? All items will be permanently deleted.')) {
      this.driveService.emptyTrash().subscribe({
        next: () => {
          this.loadDriveItems();
        },
        error: (err) => {
          console.error('Failed to empty trash:', err);
        }
      });
    }
  }

  downloadItem(item: DriveItemDTO, event?: Event): void {
    if (event) event.stopPropagation();
    this.activeMenuId.set(null);

    if (item.publicUrl) {
      this.driveService.downloadBlob(item.publicUrl).subscribe({
        next: (blob) => {
          const blobUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = item.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(blobUrl);
        },
        error: (err) => {
          console.error('Download failed:', err);
        }
      });
    }
  }

  onFileUpload(event: Event): void {
    const el = event.target as HTMLInputElement;
    if (el.files?.length) {
      const files = Array.from(el.files);
      this.uploadFiles(files);
      el.value = '';
    }
  }

  uploadFiles(files: File[]): void {
    this.isLoading.set(true);
    this.driveService.upload(files, this.currentFolderPath()).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.loadDriveItems();
      },
      error: () => this.isLoading.set(false)
    });
  }

  onDragOver(e: DragEvent): void {
    if (this.isTrashView()) return;
    e.preventDefault();
    this.isDragOver = true;
  }

  onDrop(e: DragEvent): void {
    if (this.isTrashView()) return;
    e.preventDefault();
    this.isDragOver = false;
    if (e.dataTransfer?.files.length) {
      const files = Array.from(e.dataTransfer.files);
      this.uploadFiles(files);
    }
  }

  formatBytes(bytes?: number): string {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
