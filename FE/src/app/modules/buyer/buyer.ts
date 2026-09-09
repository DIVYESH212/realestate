import { Component, OnInit, signal, computed, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { SidebarComponent } from "../../shared/sidebar/sidebar.component";
import { BuyerService } from "../../core/services/buyer.service";
import { LeadService } from "../../core/services/lead.service";
import { ExcelService, ExcelColumn } from "../../core/services/excel.service";
import { NavigationStoreService } from "../../core/services/navigation-store.service";
import { MatPaginatorModule, PageEvent } from "@angular/material/paginator";
import { BuyerRecord, BuyerFilterParams } from "../../core/models/buyer.model";

@Component({
  selector: "buyer",
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, MatPaginatorModule],
  templateUrl: "./buyer.html"
})
export class BuyerComponent implements OnInit {
  private buyerService = inject(BuyerService);
  private leadService = inject(LeadService);
  private excelService = inject(ExcelService);
  private navStore = inject(NavigationStoreService);
  private router = inject(Router);

  // State Signals
  buyers = signal<BuyerRecord[]>([]);
  totalItems = signal<number>(0);
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  isExporting = signal<boolean>(false);

  // Search & Pagination State Signals
  searchQuery = signal<string>(this.navStore.buyerState().searchQuery);
  pageIndex = signal<number>(this.navStore.buyerState().page - 1);
  pageSize = signal<number>(this.navStore.buyerState().limit);

  // Leads for dropdown association
  availableLeads = signal<any[]>([]);

  // Modals state
  showAddModal = signal<boolean>(false);
  showEditModal = signal<boolean>(false);
  showDeleteConfirmModal = signal<boolean>(false);
  buyerToDelete = signal<BuyerRecord | null>(null);

  // Toast feedback
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'error'>('success');
  toastTimeout: any = null;

  // Form Models
  addForm = {
    name: '',
    mobilenumber: '',
    email: '',
    propertyAddress: '',
    status: 'active'
  };

  editForm = {
    _id: '',
    name: '',
    mobilenumber: '',
    email: '',
    propertyAddress: '',
    status: 'active',
    lead_id: ''
  };

  handlePageEvent(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.navStore.setBuyerPage(event.pageIndex + 1, event.pageSize);
    this.loadBuyers();
  }

  // Client-side refined list by name and address
  displayedBuyers = computed(() => {
    let list = this.buyers();
    const query = this.searchQuery().trim().toLowerCase();
    if (query) {
      list = list.filter(b => 
        (b.name || '').toLowerCase().includes(query) ||
        (b.propertyAddress || '').toLowerCase().includes(query)
      );
    }
    return list;
  });

  ngOnInit(): void {
    this.loadBuyers();
    this.loadLeads();
  }

  loadBuyers(): void {
    this.isLoading.set(true);
    const filters: BuyerFilterParams = {
      search: this.searchQuery().trim() || null
    };

    const pageNum = this.pageIndex() + 1;
    this.buyerService.getBuyers(pageNum, this.pageSize(), filters).subscribe({
      next: (res) => {
        this.buyers.set(res.buyers || []);
        this.totalItems.set(res.totalItems || res.buyers?.length || 0);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching buyers:', err);
        this.isLoading.set(false);
        this.showToast('Failed to load buyers list. Please check your connection.', 'error');
      }
    });
  }

  loadLeads(): void {
    this.leadService.getLeads(1, 100).subscribe({
      next: (res) => {
        this.availableLeads.set(res.leads || []);
      },
      error: (err) => {
        console.error('Error fetching leads for buyer association:', err);
      }
    });
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.pageIndex.set(0);
    this.navStore.setBuyerSearch(query);
    this.loadBuyers();
  }

  // Profile Page Navigation
  openProfile(buyer: BuyerRecord): void {
    const id = buyer._id || buyer.id;
    if (id) {
      this.router.navigate(['/buyer-profile', id]);
    }
  }

  // Add Buyer Modal
  openAddModal(): void {
    this.addForm = {
      name: '',
      mobilenumber: '',
      email: '',
      propertyAddress: '',
      status: 'active'
    };
    this.showAddModal.set(true);
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
  }

  submitAddBuyer(): void {
    if (!this.addForm.name.trim()) {
      this.showToast('Buyer name is required.', 'error');
      return;
    }

    this.isSubmitting.set(true);
    this.buyerService.createBuyer(this.addForm).subscribe({
      next: (created) => {
        this.isSubmitting.set(false);
        this.closeAddModal();
        this.showToast(`Buyer "${created.name || this.addForm.name}" created successfully!`, 'success');
        this.loadBuyers();
      },
      error: (err) => {
        console.error('Error creating buyer:', err);
        this.isSubmitting.set(false);
        this.showToast('Failed to create buyer. Please verify inputs.', 'error');
      }
    });
  }

  openEditModal(buyer: BuyerRecord, event?: Event): void {
    if (event) event.stopPropagation();
    const firstLead = Array.isArray(buyer.lead_ids) && buyer.lead_ids.length > 0 ? buyer.lead_ids[0] : null;
    const leadId = typeof firstLead === 'object' && firstLead !== null
      ? (firstLead._id || firstLead.id || '')
      : (firstLead || '');

    this.editForm = {
      _id: buyer._id || buyer.id || '',
      name: buyer.name || '',
      mobilenumber: buyer.mobilenumber || '',
      email: buyer.email || '',
      propertyAddress: buyer.propertyAddress || '',
      status: buyer.status || 'active',
      lead_id: leadId
    };
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
  }

  onEditLeadSelect(leadId: string): void {
    if (!leadId) return;
    const lead = this.availableLeads().find(l => (l._id || l.id) === leadId);
    if (lead && !this.editForm.propertyAddress) {
      this.editForm.propertyAddress = lead.propertyAddress || '';
    }
  }

  submitEditBuyer(): void {
    if (!this.editForm._id || !this.editForm.name.trim()) {
      this.showToast('Buyer name is required.', 'error');
      return;
    }

    this.isSubmitting.set(true);
    this.buyerService.updateBuyer(this.editForm._id, this.editForm).subscribe({
      next: (updated) => {
        this.isSubmitting.set(false);
        this.closeEditModal();
        this.showToast(`Buyer updated successfully!`, 'success');
        this.loadBuyers();
      },
      error: (err) => {
        console.error('Error updating buyer:', err);
        this.isSubmitting.set(false);
        this.showToast('Failed to update buyer.', 'error');
      }
    });
  }

  // Delete Buyer Confirmation
  promptDeleteBuyer(buyer: BuyerRecord, event?: Event): void {
    if (event) event.stopPropagation();
    this.buyerToDelete.set(buyer);
    this.showDeleteConfirmModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteConfirmModal.set(false);
    this.buyerToDelete.set(null);
  }

  executeDeleteBuyer(): void {
    const buyer = this.buyerToDelete();
    const id = buyer?._id || buyer?.id;
    if (!id) return;

    this.isSubmitting.set(true);
    this.buyerService.deleteBuyer(id).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeDeleteModal();
        this.showToast(`Buyer "${buyer.name}" removed successfully.`, 'success');
        this.loadBuyers();
       
      },
      error: (err) => {
        console.error('Error deleting buyer:', err);
        this.isSubmitting.set(false);
        this.showToast('Failed to delete buyer.', 'error');
      }
    });
  }

  // Status Management
  statusOptions: string[] = ['active', 'inactive', 'hold', 'assign'];

  getStatusClass(status: string = ''): string {
    const s = (status || 'active').toLowerCase();
    switch (s) {
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
      case 'assign':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100';
      case 'hold':
        return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100';
      case 'inactive':
        return 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
    }
  }

  updateBuyerStatus(buyer: BuyerRecord, newStatus: string, event?: Event): void {
    if (event) event.stopPropagation();
    const id = buyer._id || buyer.id;
    if (!id || buyer.status === newStatus) return;

    const prevStatus = buyer.status;
    buyer.status = newStatus;

    this.buyerService.updateBuyer(id, { status: newStatus }).subscribe({
      next: () => {
        this.showToast(`Status updated to "${newStatus.toUpperCase()}"`, 'success');
        this.loadBuyers();
      },
      error: (err) => {
        buyer.status = prevStatus;
        console.error('Error updating status:', err);
        this.showToast(err?.error?.message || 'Failed to update status.', 'error');
      }
    });
  }

  // Helper utilities
  getInitials(name: string = ''): string {
    if (!name) return 'B';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }





  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.toastTimeout = setTimeout(() => {
      this.toastMessage.set(null);
    }, 3500);
  }

  async exportToExcel(): Promise<void> {
    if (this.isExporting()) return;
    this.isExporting.set(true);

    const columns: ExcelColumn[] = [
      { header: 'Buyer Name', key: 'name', width: 25 },
      { header: 'Mobile Number', key: 'mobilenumber', width: 20 },
      { header: 'Email Address', key: 'email', width: 25 },
      { header: 'Target Property / Area', key: 'propertyAddress', width: 30 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Linked Lead', key: 'linkedLead', width: 25 },
      { header: 'Notes', key: 'notes', width: 35 },
      { header: 'Created Date', key: 'createdAt', width: 20 },
    ];

    const filters: BuyerFilterParams = {
      search: this.searchQuery().trim() || null,
    };

    this.buyerService.getBuyers(1, 1000, filters).subscribe({
      next: async (res) => {
        try {
          const buyersList = res.buyers || [];
          if (!buyersList.length) {
            this.showToast('No buyers available to export.', 'error');
            this.isExporting.set(false);
            return;
          }

          const formattedRows = buyersList.map((b) => ({
            name: b.name || 'N/A',
            mobilenumber: b.mobilenumber || 'N/A',
            email: b.email || 'N/A',
            propertyAddress: b.propertyAddress || 'N/A',
            status: (b.status || 'active').toUpperCase(),
            linkedLead: (Array.isArray(b.lead_ids) && b.lead_ids.length > 0
              ? b.lead_ids.map(l => (typeof l === 'object' && l ? l.name || l.propertyAddress : '')).filter(Boolean).join(', ')
              : '') || 'None (Unassigned)',
            notes: b.notes || '',
            createdAt: b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'N/A',
          }));

          await this.excelService.exportToExcel(columns, formattedRows, 'Buyers_Directory', 'Buyers');
          this.showToast('Buyers exported to Excel successfully!', 'success');
        } catch (error) {
          console.error('Failed to export buyers to Excel:', error);
          this.showToast('Failed to generate Excel export. Please try again.', 'error');
        } finally {
          this.isExporting.set(false);
        }
      },
      error: (err) => {
        console.error('Failed to fetch buyers for export:', err);
        this.showToast('Failed to export buyers.', 'error');
        this.isExporting.set(false);
      },
    });
  }
}