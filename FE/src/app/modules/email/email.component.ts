import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { EmailService } from '../../core/services/email.service';
import { EmailRecord } from '../../core/models/email.model';

@Component({
  selector: 'app-email',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './email.component.html'
})
export class EmailComponent implements OnInit {
  private emailService = inject(EmailService);

  // States
  searchQuery = signal<string>('');
  isLoading = signal<boolean>(false);
  activeFolder = signal<string>('inbox');

  // Pagination (1-10 Infinite Pagination)
  pageSize = signal<number>(10);
  currentPage = signal<number>(1);
  isLoadingMore = signal<boolean>(false);

  // Selected email for detail thread view
  selectedEmail = signal<EmailRecord | null>(null);

  // Checkbox Selection
  selectedEmailIds = signal<Set<string>>(new Set<string>());

  // Delete Confirmation Modal State
  emailToDelete = signal<EmailRecord | null>(null);
  bulkDeleteMode = signal<boolean>(false);
  isDeleting = signal<boolean>(false);

  // Toast
  toastMessage = signal<string | null>(null);

  // Data
  emails = signal<EmailRecord[]>([]);

  // Filtered emails based on search query
  filteredEmails = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const list = this.emails().filter(e => !e.isDeleted);

    if (!q) return list;

    return list.filter(e =>
      (e.subject && e.subject.toLowerCase().includes(q)) ||
      (e.from && e.from.toLowerCase().includes(q)) ||
      (e.to && e.to.toLowerCase().includes(q)) ||
      (e.senderName && e.senderName.toLowerCase().includes(q)) ||
      (e.recipientName && e.recipientName.toLowerCase().includes(q)) ||
      (e.message && e.message.toLowerCase().includes(q))
    );
  });

  // Displayed emails with infinite pagination (1-10, 1-20, 1-30, etc.)
  displayedEmails = computed(() => {
    const all = this.filteredEmails();
    const limit = this.currentPage() * this.pageSize();
    return all.slice(0, limit);
  });

  hasMoreEmails = computed(() => {
    return this.displayedEmails().length < this.filteredEmails().length;
  });

  ngOnInit(): void {
    this.loadEmails();
  }

  loadEmails(): void {
    this.isLoading.set(true);
    this.currentPage.set(1);

    this.emailService.getEmails({
      search: this.searchQuery().trim() || undefined
    }).subscribe({
      next: (res) => {
        this.emails.set(res.emails || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load emails:', err);
        this.isLoading.set(false);
        this.showToast('Failed to load emails.');
      }
    });
  }

  // Infinite Pagination Scroll & Navigation
  onTableScroll(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target) return;

    const threshold = 40;
    const isNearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - threshold;

    if (isNearBottom && this.hasMoreEmails() && !this.isLoadingMore()) {
      this.loadMore();
    }
  }

  loadMore(): void {
    if (!this.hasMoreEmails() || this.isLoadingMore()) return;

    this.isLoadingMore.set(true);
    setTimeout(() => {
      this.currentPage.update(page => page + 1);
      this.isLoadingMore.set(false);
    }, 200);
  }

  // Navigation
  setFolder(folder: string): void {
    this.activeFolder.set(folder);
    this.selectedEmail.set(null);
    this.selectedEmailIds.set(new Set<string>());
    this.currentPage.set(1);
  }

  onSearchInput(val: string): void {
    const prev = this.searchQuery();
    this.searchQuery.set(val);
    this.currentPage.set(1);

    if (this.selectedEmail() && val.trim()) {
      this.selectedEmail.set(null);
    }

    // When the search input is cleared after being searched, reload all emails to restore the full inbox
    if (!val.trim() && prev.trim()) {
      this.loadEmails();
    }
  }

  onSearch(): void {
    this.selectedEmail.set(null);
    this.currentPage.set(1);
    this.loadEmails();
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.selectedEmail.set(null);
    this.currentPage.set(1);
    this.loadEmails();
  }

  // Reading View
  openEmailDetail(email: EmailRecord): void {
    this.selectedEmail.set(email);
  }

  closeEmailDetail(): void {
    this.selectedEmail.set(null);
  }

  // Selection Logic
  toggleSelectEmail(email: EmailRecord, event: Event): void {
    event.stopPropagation();
    const id = email._id || email.id;
    if (!id) return;

    const selected = new Set(this.selectedEmailIds());
    if (selected.has(id)) {
      selected.delete(id);
    } else {
      selected.add(id);
    }
    this.selectedEmailIds.set(selected);
  }

  isEmailSelected(email: EmailRecord): boolean {
    const id = email._id || email.id;
    return !!(id && this.selectedEmailIds().has(id));
  }

  isAllSelected(): boolean {
    const list = this.displayedEmails();
    if (list.length === 0) return false;
    return list.every(e => this.selectedEmailIds().has(e._id || e.id || ''));
  }

  toggleSelectAll(): void {
    const list = this.displayedEmails();
    if (this.isAllSelected()) {
      this.selectedEmailIds.set(new Set<string>());
    } else {
      const allIds = new Set<string>(
        list.map(e => e._id || e.id || '').filter(Boolean)
      );
      this.selectedEmailIds.set(allIds);
    }
  }

  clearSelection(): void {
    this.selectedEmailIds.set(new Set<string>());
  }

  // Deletion (Single & Optimized Bulk Delete via forkJoin)
  confirmDeleteEmail(email: EmailRecord, event?: Event): void {
    if (event) event.stopPropagation();
    this.bulkDeleteMode.set(false);
    this.emailToDelete.set(email);
  }

  confirmBulkDelete(): void {
    const count = this.selectedEmailIds().size;
    if (count === 0) return;
    this.bulkDeleteMode.set(true);
    this.emailToDelete.set({
      _id: 'bulk',
      user_id: '',
      type: 'sent',
      status: 'sent',
      from: '',
      to: '',
      subject: `${count} selected messages`,
      message: ''
    });
  }

  cancelDeleteEmail(): void {
    this.emailToDelete.set(null);
    this.bulkDeleteMode.set(false);
  }

  executeDeleteEmail(): void {
    // Bulk Delete
    if (this.bulkDeleteMode()) {
      const ids = Array.from(this.selectedEmailIds());
      if (ids.length === 0) {
        this.cancelDeleteEmail();
        return;
      }

      this.isDeleting.set(true);
      const deleteRequests = ids.map(id =>
        this.emailService.deleteEmail(id).pipe(catchError(() => of(null)))
      );

      forkJoin(deleteRequests).subscribe({
        next: () => {
          this.isDeleting.set(false);
          this.showToast(`${ids.length} conversations deleted.`);
          if (this.selectedEmail() && ids.includes(this.selectedEmail()?._id || '')) {
            this.selectedEmail.set(null);
          }
          this.cancelDeleteEmail();
          this.clearSelection();
          this.loadEmails();
        },
        error: () => {
          this.isDeleting.set(false);
          this.showToast('Error deleting some emails.');
          this.cancelDeleteEmail();
          this.loadEmails();
        }
      });
      return;
    }

    // Single Delete
    const email = this.emailToDelete();
    const emailId = email?._id || email?.id;
    if (!emailId) {
      this.cancelDeleteEmail();
      return;
    }

    this.isDeleting.set(true);
    this.emailService.deleteEmail(emailId).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.showToast('Conversation deleted.');
        if (this.selectedEmail()?._id === emailId || this.selectedEmail()?.id === emailId) {
          this.selectedEmail.set(null);
        }
        this.cancelDeleteEmail();
        this.loadEmails();
      },
      error: (err) => {
        console.error('Failed to delete email:', err);
        this.isDeleting.set(false);
        this.showToast('Failed to delete email.');
        this.cancelDeleteEmail();
      }
    });
  }

  // Helpers
  getSenderInitials(nameOrEmail?: string): string {
    if (!nameOrEmail) return 'U';
    const clean = nameOrEmail.trim();
    if (clean.includes(' ')) {
      const parts = clean.split(' ');
      return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
    }
    return clean.substring(0, 2).toUpperCase();
  }

  formatGmailDate(dateValue?: string | Date): string {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  showToast(message: string): void {
    this.toastMessage.set(message);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 4000);
  }
}
