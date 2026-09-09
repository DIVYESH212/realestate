import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { BuyerService } from '../../../../../../core/services/buyer.service';
import { LeadService } from '../../../../../../core/services/lead.service';

@Component({
  selector: 'app-lead-cash-buyers',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule, MatPaginatorModule],
  templateUrl: './lead-cash-buyers.component.html',
})
export class LeadCashBuyersComponent implements OnInit {
  @Input() leadId: string | null = null;
  @Input() leadData: any = null;

  @Output() toast = new EventEmitter<string>();
  @Output() leadUpdated = new EventEmitter<void>();
  @Output() buyerCountChange = new EventEmitter<number>();

  private buyerService = inject(BuyerService);
  private leadService = inject(LeadService);
  private fb = inject(FormBuilder);

  // Buyers State
  allBuyers = signal<any[]>([]);
  loadingBuyers = signal<boolean>(false);
  buyerSearch = signal<string>('');
  buyerPageIndex = signal<number>(0);
  buyerPageSize = signal<number>(10);

  // Modals State
  showQuickAssignModal = signal<boolean>(false);
  selectedBuyerToAssign = signal<string>('');
  showAddBuyerModal = signal<boolean>(false);
  isSubmittingBuyer = signal<boolean>(false);

  buyerForm!: FormGroup;

  // Computeds
  filteredBuyers = computed(() => {
    const query = this.buyerSearch().trim().toLowerCase();
    if (!query) return this.allBuyers();
    return this.allBuyers().filter(
      (b) =>
        (b.name || '').toLowerCase().includes(query) ||
        (b.mobilenumber || b.phone || '').toLowerCase().includes(query) ||
        (b.email || '').toLowerCase().includes(query) ||
        (b.propertyAddress || '').toLowerCase().includes(query) ||
        (b.status || '').toLowerCase().includes(query),
    );
  });

  displayedBuyers = computed(() => {
    const start = this.buyerPageIndex() * this.buyerPageSize();
    return this.filteredBuyers().slice(start, start + this.buyerPageSize());
  });

  assignedBuyers = computed(() => {
    return this.leadId ? this.allBuyers().filter((b) => this.isBuyerAssignedToThisLead(b)) : [];
  });

  primaryAssignedBuyer = computed(() => this.assignedBuyers()[0] || null);

  ngOnInit(): void {
    this.initForm();
    this.loadAllBuyers();
  }

  private initForm(): void {
    this.buyerForm = this.fb.group({
      name: ['', [Validators.required]],
      mobilenumber: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      propertyAddress: [''],
      status: ['active'],
    });
  }

  loadAllBuyers(): void {
    this.loadingBuyers.set(true);
    this.buyerService.getBuyers(1, 1000).subscribe({
      next: (res) => {
        const buyers = res.buyers || [];
        this.allBuyers.set(buyers);
        this.buyerCountChange.emit(buyers.length);
        this.loadingBuyers.set(false);
      },
      error: (err) => {
        console.error('Failed to load buyers:', err);
        this.loadingBuyers.set(false);
      },
    });
  }

  // --- Buyer Helpers ---

  private getBuyerLeadIds(buyer: any): string[] {
    if (Array.isArray(buyer?.lead_ids)) {
      return buyer.lead_ids
        .map((l: any) => (typeof l === 'object' && l ? l._id || l.id : l)?.toString())
        .filter(Boolean);
    }
    return [];
  }

  getBuyerAssignedLeadCount(buyer: any): number {
    return buyer?.status === 'assign' ? this.getBuyerLeadIds(buyer).length : 0;
  }

  isBuyerAssignable(buyer: any): boolean {
    const s = (buyer?.status || '').toLowerCase().trim();
    return s !== 'inactive' && s !== 'hold';
  }

  isBuyerAssignedToThisLead(buyer: any): boolean {
    return buyer?.status === 'assign' && !!this.leadId && this.getBuyerLeadIds(buyer).includes(this.leadId);
  }

  // --- Assign & Unassign ---

  assignBuyerToLead(buyer: any): void {
    const curLeadId = this.leadId;
    const buyerId = buyer?._id || buyer?.id;
    if (!curLeadId || !buyerId) return;

    // Prevent multiple buyers from being assigned to the same lead
    const currentAssigned = this.primaryAssignedBuyer();
    if (currentAssigned && (currentAssigned._id || currentAssigned.id) !== buyerId) {
      this.toast.emit(
        `This lead already has an assigned buyer (${currentAssigned.name}). Please unassign them first.`,
      );
      return;
    }

    if (!this.isBuyerAssignable(buyer)) {
      this.toast.emit(
        `Cannot assign buyer with "${buyer.status || 'inactive'}" status. Please change status to Active first.`,
      );
      return;
    }

    const currentBuyerLeads = this.getBuyerLeadIds(buyer);
    const updatedLeadIds = Array.from(new Set([...currentBuyerLeads, curLeadId]));

    this.buyerService
      .updateBuyer(buyerId, {
        lead_ids: updatedLeadIds,
        propertyAddress: buyer.propertyAddress || this.leadData?.propertyAddress || '',
        status: 'assign',
      })
      .subscribe({
        next: () => {
          this.toast.emit(`🎯 Buyer "${buyer.name || 'Buyer'}" assigned!`);
          this.loadAllBuyers();
          this.leadUpdated.emit();
          this.showQuickAssignModal.set(false);
        },
        error: (err) => this.toast.emit(err?.error?.message || 'Failed to assign buyer.'),
      });
  }

  unassignBuyer(buyer: any): void {
    const buyerId = buyer?._id || buyer?.id;
    if (!buyerId) return;

    const remainingLeadIds = this.getBuyerLeadIds(buyer).filter((id) => id !== this.leadId);
    const newStatus = remainingLeadIds.length > 0 ? 'assign' : 'active';

    this.buyerService.updateBuyer(buyerId, { lead_ids: remainingLeadIds, status: newStatus }).subscribe({
      next: () => {
        this.toast.emit(`Buyer "${buyer.name || 'Buyer'}" unassigned.`);
        this.loadAllBuyers();
        this.leadUpdated.emit();
      },
      error: (err) => this.toast.emit(err?.error?.message || 'Failed to unassign buyer.'),
    });
  }


  // --- Pagination & Search ---

  onBuyerSearchChange(query: string): void {
    this.buyerSearch.set(query);
    this.buyerPageIndex.set(0);
  }

  onBuyerPageChange(event: PageEvent): void {
    this.buyerPageIndex.set(event.pageIndex);
    this.buyerPageSize.set(event.pageSize);
  }

  // --- Quick Assign Modal ---

  openQuickAssignModal(): void {
    const currentAssigned = this.primaryAssignedBuyer();
    if (currentAssigned) {
      this.toast.emit(
        `This lead already has an assigned buyer (${currentAssigned.name}). Please unassign them first.`,
      );
      return;
    }
    this.selectedBuyerToAssign.set('');
    this.showQuickAssignModal.set(true);
  }

  closeQuickAssignModal(): void {
    this.showQuickAssignModal.set(false);
  }

  quickAssignSelectedBuyer(): void {
    const currentAssigned = this.primaryAssignedBuyer();
    if (currentAssigned) {
      this.toast.emit(
        `This lead already has an assigned buyer (${currentAssigned.name}). Please unassign them first.`,
      );
      return;
    }
    const buyerId = this.selectedBuyerToAssign();
    if (!buyerId) return;
    const buyer = this.allBuyers().find((b) => (b._id || b.id) === buyerId);
    if (buyer) this.assignBuyerToLead(buyer);
  }

  // --- Add Buyer Modal ---

  openAddBuyerModal(): void {
    this.buyerForm.reset({
      name: '',
      mobilenumber: '',
      email: '',
      propertyAddress: this.leadData?.propertyAddress || '',
      status: 'active',
    });
    this.showAddBuyerModal.set(true);
  }

  closeAddBuyerModal(): void {
    this.showAddBuyerModal.set(false);
  }

  submitAddBuyer(): void {
    if (this.buyerForm.invalid) {
      this.buyerForm.markAllAsTouched();
      return;
    }
    const id = this.leadId;
    if (!id) return;

    const formVal = this.buyerForm.value;
    let status = formVal.status || 'active';

    if (status === 'assign' && this.primaryAssignedBuyer()) {
      status = 'active';
      this.toast.emit(`This lead already has an assigned buyer. New buyer created as "Active".`);
    }

    this.isSubmittingBuyer.set(true);

    const payload = {
      ...formVal,
      propertyAddress: formVal.propertyAddress || this.leadData?.propertyAddress || '',
      status,
      lead_id: status === 'assign' ? id : null,
    };

    this.leadService.createBuyer(payload).subscribe({
      next: () => {
        this.isSubmittingBuyer.set(false);
        this.showAddBuyerModal.set(false);
        this.toast.emit('Buyer created and linked successfully!');
        this.loadAllBuyers();
        this.leadUpdated.emit();
      },
      error: (err) => {
        console.error('Failed to create buyer:', err);
        this.isSubmittingBuyer.set(false);
        this.toast.emit('Failed to create buyer. Please verify inputs.');
      },
    });
  }

  // --- Helpers & TrackBy ---


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



  trackByBuyerId = (_: number, item: any): string => item?._id || item?.id || String(_);
}
