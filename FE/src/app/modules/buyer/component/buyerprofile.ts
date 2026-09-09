import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { BuyerRecord } from '../../../core/models/buyer.model';
import { BuyerService } from '../../../core/services/buyer.service';
import { LeadService } from '../../../core/services/lead.service';
import { NavigationStoreService } from '../../../core/services/navigation-store.service';

@Component({
  selector: 'app-buyerprofile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, SidebarComponent],
  templateUrl: './buyerprofile.html',
})
export class BuyerprofileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private buyerService = inject(BuyerService);
  private leadService = inject(LeadService);
  private navStore = inject(NavigationStoreService);

  // Core State
  buyerId = signal<string | null>(null);
  buyer = signal<BuyerRecord | null>(null);
  availableLeads = signal<any[]>([]);
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');

  // UI State
  activeTab = signal<'overview' | 'lead'>('overview');
  showEditModal = signal<boolean>(false);
  isSubmittingEdit = signal<boolean>(false);
  showDeleteModal = signal<boolean>(false);
  isDeleting = signal<boolean>(false);

  // Toast Feedback
  toastMessage = signal<string | null>(null);
  private toastTimer: any = null;

  // Edit Form
  editForm!: FormGroup;

  // Status Classes
  statusOptions: string[] = ['active', 'inactive', 'hold', 'assign'];

  // Associated Leads Computed (Direct from lead_ids array)
  associatedLeads = computed<any[]>(() => {
    const b = this.buyer();
    if (!b || !Array.isArray(b.lead_ids)) return [];
    return b.lead_ids.filter((item) => typeof item === 'object' && item !== null);
  });

  getLinkedLeadIds(): string[] {
    return this.associatedLeads()
      .map((l) => (l._id || l.id)?.toString())
      .filter(Boolean);
  }

  ngOnInit(): void {
    this.initEditForm();
    this.loadAvailableLeads();

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.buyerId.set(id);
        this.loadBuyer(id);
      } else {
        this.errorMessage.set('No Buyer ID provided.');
        this.loading.set(false);
      }
    });
  }

  private initEditForm(): void {
    this.editForm = this.fb.group({
      name: ['', [Validators.required]],
      mobilenumber: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      propertyAddress: [''],
      status: ['active'],
    });
  }

  loadBuyer(id: string): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.buyerService.getBuyerById(id).subscribe({
      next: (b) => {
        if (!b || (!b.name && !b._id && !b.id)) {
          this.errorMessage.set('Buyer profile not found.');
          this.loading.set(false);
          return;
        }
        this.buyer.set(b);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load buyer:', err);
        const backendMsg = err?.error?.message || err?.error || err?.message;
        this.errorMessage.set(backendMsg || 'Failed to load buyer details from server.');
        this.loading.set(false);
      },
    });
  }

  loadAvailableLeads(): void {
    this.leadService.getLeads(1, 200).subscribe({
      next: (res) => {
        this.availableLeads.set(res?.leads || []);
      },
      error: (err) => console.error('Failed to load available leads:', err),
    });
  }

  setActiveTab(tab: 'overview' | 'lead'): void {
    this.activeTab.set(tab);
  }

  showToast(msg: string): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage.set(msg);
    this.toastTimer = setTimeout(() => this.toastMessage.set(null), 3000);
  }

  // --- Status Management ---

  updateStatus(newStatus: string): void {
    const b = this.buyer();
    const id = this.buyerId();
    if (!b || !id || b.status === newStatus) return;

    this.buyerService.updateBuyer(id, { status: newStatus }).subscribe({
      next: () => {
        this.buyer.update((cur) => (cur ? { ...cur, status: newStatus } : null));
        this.showToast(`Buyer status updated to "${newStatus}"!`);
      },
      error: () => this.showToast('Failed to update status.'),
    });
  }

  getStatusBadgeClass(status: string = ''): string {
    const map: Record<string, string> = {
      active: 'bg-emerald-50 text-emerald-700 border-emerald-300',
      assign: 'bg-indigo-50 text-indigo-700 border-indigo-300',
      hold: 'bg-amber-50 text-amber-700 border-amber-300',
      inactive: 'bg-rose-50 text-rose-700 border-rose-300',
    };
    return map[(status || '').toLowerCase()] || map['active'];
  }

  // --- Edit Modal Flow ---

  openEditModal(): void {
    const b = this.buyer();
    if (!b) return;

    this.editForm.patchValue({
      name: b.name || '',
      mobilenumber: b.mobilenumber,
      email: b.email || '',
      propertyAddress: b.propertyAddress || '',
      status: b.status || 'active',
    });

    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
  }

  submitEdit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const id = this.buyerId();
    if (!id) return;

    this.isSubmittingEdit.set(true);
    const formVal = this.editForm.value;

    this.buyerService.updateBuyer(id, formVal).subscribe({
      next: () => {
        this.isSubmittingEdit.set(false);
        this.showEditModal.set(false);
        this.showToast('Buyer details updated successfully!');
        this.loadBuyer(id);
      },
      error: (err) => {
        this.isSubmittingEdit.set(false);
        console.error('Failed to update buyer:', err);
        this.showToast(err?.error?.message || 'Failed to update buyer.');
      },
    });
  }

  // --- Lead Assignment & Navigation ---

  navigateToLeads(): void {
    this.navStore.setDashboardView('list');
    this.navStore.setDashboardSubView('list');
    this.router.navigate(['/dashboard'], { queryParams: { view: 'list' } });
  }

  unassignSingleLead(leadIdToRemove: string): void {
    const id = this.buyerId();
    if (!id || !leadIdToRemove) return;

    const remainingIds = this.getLinkedLeadIds().filter((lid) => lid !== leadIdToRemove);
    const newStatus = remainingIds.length > 0 ? (this.buyer()?.status === 'assign' ? 'assign' : this.buyer()?.status || 'active') : 'active';

    this.buyerService
      .updateBuyer(id, {
        lead_ids: remainingIds,
        status: newStatus,
      })
      .subscribe({
        next: () => {
          this.showToast('Lead unlinked from buyer.');
          this.loadBuyer(id);
        },
        error: (err) => this.showToast(err?.error?.message || 'Failed to unlink lead.'),
      });
  }


  // --- Delete Buyer Flow ---

  openDeleteModal(): void {
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
  }

  confirmDelete(): void {
    const id = this.buyerId();
    if (!id) return;

    this.isDeleting.set(true);
    this.buyerService.deleteBuyer(id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.showDeleteModal.set(false);
        this.router.navigate(['/buyers']);
      },
      error: (err) => {
        this.isDeleting.set(false);
        console.error('Failed to delete buyer:', err);
        this.showToast('Failed to delete buyer.');
      },
    });
  }

  // --- Visual Helpers ---

  getInitials(name: string = ''): string {
    return (
      (name || '')
        .split(' ')
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'B'
    );
  }

}