import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { LeadService } from '../../core/services/lead.service';
import { StageService } from '../../core/services/stage.service';
import { ExcelService, ExcelColumn } from '../../core/services/excel.service';
import { NavigationStoreService } from '../../core/services/navigation-store.service';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { GridViewComponent } from './components/grid-view/grid-view.component';
import { ListViewComponent } from './components/list-view/list-view.component';
import { LeadFormComponent } from './components/lead-form/lead-form.component';
import { FilterDrawerComponent } from './components/filter-drawer/filter-drawer.component';
import { LeadRecord, LeadFilterParams, Stage } from '../../core/models/lead.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    GridViewComponent,
    ListViewComponent,
    LeadFormComponent,
    FilterDrawerComponent
  ],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  protected authService = inject(AuthService);
  private leadService = inject(LeadService);
  private stageService = inject(StageService);
  private excelService = inject(ExcelService);
  private navStore = inject(NavigationStoreService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Stages State
  stages = signal<Stage[]>([]);
  showAddStatusModal = signal<boolean>(false);
  newStatusInput = signal<string>('');
  isSubmittingStatus = signal<boolean>(false);

  // Filter Drawer State
  showFilterDrawer = signal<boolean>(false);
  currentFilters = signal<LeadFilterParams>(this.navStore.dashboardState().filters);

  activeFiltersCount = computed(() => {
    const f = this.currentFilters();
    let count = 0;
    if (f.startDate) count++;
    if (f.endDate) count++;
    if (f.market_segment && f.market_segment !== 'all') count++;
    if (f.addressAvailability && f.addressAvailability !== 'all') count++;
    if (f.buyerName) count++;
    if (f.buyerMobile) count++;
    if (f.buyerAddress) count++;
    if (f.buyerEmail) count++;
    if (f.propertyValueOperator && f.propertyValueOperator !== 'all') count++;
    if (f.loanAmountOperator && f.loanAmountOperator !== 'all') count++;
    return count;
  });

  isExporting = signal<boolean>(false);
  errorMessage = signal<string>('');
  totalItems = signal(0);
  currentPage = signal<number>(this.navStore.dashboardState().currentPage);
  pageSize = signal<number>(this.navStore.dashboardState().pageSize);

  // Leads State
  leads = signal<LeadRecord[]>([]);
  leadsSubView = signal<'list' | 'form'>(this.navStore.dashboardState().leadsSubView);
  deleteConfirmId = signal<string | null>(null);

  // Search & Filter Signals
  searchQuery = signal<string>(this.navStore.dashboardState().searchQuery);
  viewMode = signal<'grid' | 'list'>(this.navStore.dashboardState().viewMode);
  loadingMore = signal<boolean>(false);

  filteredLeads = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const allLeads = this.leads();
    if (!query) return allLeads;

    return allLeads.filter(lead => {
      const matchAddress = lead.propertyAddress ? lead.propertyAddress.toLowerCase().includes(query) : false;
      const matchSource = lead.leadSource ? lead.leadSource.toLowerCase().includes(query) : false;
      const matchMarket = lead.market ? lead.market.toLowerCase().includes(query) : false;
      const matchContacts = lead.contacts ? lead.contacts.some(c =>
        (c.name && c.name.toLowerCase().includes(query)) ||
        (c.phone && c.phone.toLowerCase().includes(query)) ||
        (c.email && c.email.toLowerCase().includes(query))
      ) : false;

      return matchAddress || matchSource || matchMarket || matchContacts;
    });
  });

  // Lead Form State
  editingLead = signal<LeadRecord | null>(null);
  isSubmitting = signal(false);

  // UI Toast Status
  showSuccessToast = signal(false);
  showSuccessToastText = signal('Lead Saved Successfully!');

  ngOnInit(): void {
   
    this.loadStages();
    this.refreshLeads();
  }

  loadStages(): void {
    this.stageService.getStages().subscribe({
      next: (stages) => {
        if (stages && stages.length > 0) {
          this.stages.set([...stages]);
        }
      },
      error: (err) => {
        console.error('Failed to load stages from collection:', err);
      }
    });
  }

  openAddStatusModal(): void {
    this.newStatusInput.set('');
    this.showAddStatusModal.set(true);
  }

  closeAddStatusModal(): void {
    this.showAddStatusModal.set(false);
    this.newStatusInput.set('');
  }

  onSaveNewStatus(): void {
    const name = this.newStatusInput().trim();
    if (!name || this.isSubmittingStatus()) return;

    this.isSubmittingStatus.set(true);
    this.stageService.addStage({ name }).subscribe({
      next: () => {
        this.isSubmittingStatus.set(false);
        this.closeAddStatusModal();
        this.loadStages();
        this.showSuccessToast.set(true);
        this.showSuccessToastText.set(`Status "${name}" Added Successfully!`);
        setTimeout(() => this.showSuccessToast.set(false), 2500);
      },
      error: (err) => {
        console.error('Failed to create stage:', err);
        this.isSubmittingStatus.set(false);
        const errorMsg = err?.error?.message || err?.message || 'Failed to create stage. Please try again.';
        this.errorMessage.set(errorMsg);
        setTimeout(() => this.errorMessage.set(''), 3500);
      }
    });
  }

  onDeleteStage(stage: any): void {
    const stageId = stage?._id || stage?.id;
    const stageName = stage?.name || 'this status';

    if (!stageId) {
      console.warn('Cannot delete stage without valid ID');
      return;
    }

    if (confirm(`Are you sure you want to delete the "${stageName}" status column?`)) {
      this.stageService.deleteStage(stageId).subscribe({
        next: () => {
          this.loadStages();
          this.showSuccessToast.set(true);
          this.showSuccessToastText.set(`Status "${stageName}" deleted successfully`);
          setTimeout(() => this.showSuccessToast.set(false), 2500);
        },
        error: (err) => {
          console.error('Failed to delete stage:', err);
          const errorMsg = err?.error?.message || err?.message || 'Failed to delete status column.';
          this.errorMessage.set(errorMsg);
          setTimeout(() => this.errorMessage.set(''), 3500);
        }
      });
    }
  }

  onUpdateStage(event: { stage: any; name: string }): void {
    const stageId = event.stage?._id || event.stage?.id;
    const newName = event.name?.trim();

    if (!stageId || !newName) {
      return;
    }

    this.stageService.updateStage(stageId, { name: newName }).subscribe({
      next: () => {
        this.loadStages();
        this.refreshLeads();
        this.showSuccessToast.set(true);
        this.showSuccessToastText.set(`Status renamed to "${newName}"`);
        setTimeout(() => this.showSuccessToast.set(false), 2500);
      },
      error: (err) => {
        console.error('Failed to update stage:', err);
        const errorMsg = err?.error?.message || err?.message || 'Failed to update status name.';
        this.errorMessage.set(errorMsg);
        setTimeout(() => this.errorMessage.set(''), 3500);
      }
    });
  }

  // --- API DATA & FILTER HELPERS ---

  private getActiveFilters(): LeadFilterParams {
    return {
      ...this.currentFilters(),
      propertyInfo: this.currentFilters().propertyInfo || this.searchQuery()
    };
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.navStore.setDashboardSearch(query);
  }

  onApplyFilters(filters: LeadFilterParams): void {
    this.currentFilters.set(filters);
    this.showFilterDrawer.set(false);
    this.currentPage.set(1);
    this.navStore.setDashboardFilters(filters);
    this.refreshLeads();
  }

  onClearFilters(): void {
    this.currentFilters.set({});
    this.showFilterDrawer.set(false);
    this.currentPage.set(1);
    this.navStore.setDashboardFilters({});
    this.refreshLeads();
  }

  refreshLeads(): void {
    this.leadService.getLeads(this.currentPage(), this.pageSize(), this.getActiveFilters()).subscribe({
      next: (response) => {
        this.leads.set((response.leads || []).map((lead) => this.mapBackendLead(lead)));
        this.totalItems.set(response.totalItems);
      },
      error: (err) => {
        console.error('Failed to load leads from backend:', err);
      }
    });
  }

  loadMoreLeads(): void {
    if (this.loadingMore() || this.leads().length >= this.totalItems()) {
      return;
    }
    this.loadingMore.set(true);
    const nextPage = this.currentPage() + 1;

    this.leadService.getLeads(nextPage, this.pageSize(), this.getActiveFilters()).subscribe({
      next: (response) => {
        const newLeads = (response.leads || []).map((lead) => this.mapBackendLead(lead));
        this.leads.update(current => [...current, ...newLeads]);
        this.totalItems.set(response.totalItems);
        this.currentPage.set(nextPage);
        this.loadingMore.set(false);
      },
      error: (err) => {
        console.error('Failed to load more leads from backend:', err);
        this.loadingMore.set(false);
      }
    });
  }

  exportToExcel(): void {
    if (this.isExporting()) return;
    this.isExporting.set(true);

    const columns: ExcelColumn[] = [
      { header: 'Lead Name', key: 'name', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Mobile Number', key: 'mobilenumber', width: 20 },
      { header: 'Owner Name', key: 'ownername', width: 25 },
      { header: 'Lead Status', key: 'leadstatus', width: 15 },
      { header: 'Estimated Value', key: 'estimatedvalue', width: 18 },
      { header: 'Buyer Name', key: 'buyerName', width: 25 },
      { header: 'City', key: 'city', width: 15 },
      { header: 'State', key: 'state', width: 15 },
      { header: 'Buyer Mobile', key: 'buyerMobile', width: 20 },
      { header: 'Buyer Address', key: 'buyerAddress', width: 30 },
      { header: 'Buyer Email', key: 'buyerEmail', width: 25 }
    ];

    this.leadService.exportLeadsToExcel(this.getActiveFilters()).subscribe({
      next: async (leadsData: any[]) => {
        try {
          const formattedRows = (leadsData || []).map((lead) => {
            const firstBuyer = Array.isArray(lead.buyerInfo) ? lead.buyerInfo[0] : (lead.buyerInfo || null);
            return {
              name: lead.name || 'N/A',
              email: lead.email || 'N/A',
              mobilenumber: lead.mobilenumber || 'N/A',
              ownername: lead.ownername || 'N/A',
              leadstatus: lead.leadstatus || 'N/A',
              estimatedvalue: lead.estimatedvalue || 0,
              city: lead.city || 'N/A',
              state: lead.state || 'N/A',
              zip: lead.zip || 'N/A',
              buyerName: firstBuyer ? (firstBuyer.name || 'N/A') : 'No Buyer',
              buyerMobile: firstBuyer ? (firstBuyer.mobilenumber || firstBuyer.buyerMobile || 'N/A') : 'No Buyer mobile',
              buyerAddress: firstBuyer ? (firstBuyer.propertyAddress || firstBuyer.buyerAddress || 'N/A') : 'No Buyer address',
              buyerEmail: firstBuyer ? (firstBuyer.email || firstBuyer.buyerEmail || 'N/A') : 'No Buyer email'
            };
          });

          await this.excelService.exportToExcel(columns, formattedRows, 'Leadssheet');
        } catch (error) {
          console.error('Failed to generate Excel file on frontend:', error);
          alert('Failed to generate Excel file. Please try again.');
        } finally {
          this.isExporting.set(false);
        }
      },
      error: (err) => {
        console.error('Failed to export leads:', err);
        alert('Failed to export leads. Please try again.');
        this.isExporting.set(false);
      }
    });
  }

  // --- CRUD CONTROLLER FUNCTIONS ---

  onOpenProfile(id: string): void {
    const filtered = this.filteredLeads();
    const title = this.searchQuery()
      ? `Search: "${this.searchQuery()}"`
      : this.activeFiltersCount() > 0
      ? `Filtered (${this.activeFiltersCount()})`
      : 'All Leads';
    this.leadService.setNavigationLeads(filtered, title, filtered);
    this.router.navigate(['/lead-profile', id]);
  }

  onOpenProfileFromGrid(event: { id: string; status: string }): void {
    const targetStatus = (event.status || '').toLowerCase().trim();
    const stageCols = this.stages();
    const allFiltered = this.filteredLeads();

    const columnLeads = allFiltered.filter(l => {
      const colName = this.getLeadStageName(l, stageCols);
      return (colName || '').toLowerCase().trim() === targetStatus;
    });

    const title = event.status ? `Stage: ${event.status}` : 'Stage View';
    this.leadService.setNavigationLeads(columnLeads.length > 0 ? columnLeads : allFiltered, title, allFiltered);
    this.router.navigate(['/lead-profile', event.id]);
  }

  private getLeadStageName(lead: LeadRecord, stages: Stage[]): string {
    const raw = (lead.leadstatus || lead.status || lead.stage?.name || '').toLowerCase().trim();
    const matched = (stages || []).find(col => (col.name || '').toLowerCase().trim() === raw);
    return matched?.name || stages?.[0]?.name || 'New Leads';
  }

  onAddNewLeadBtn(): void {
    this.editingLead.set(null);
    this.leadsSubView.set('form');
  }

  onEditLead(lead: LeadRecord): void {
    this.editingLead.set(lead);
    this.leadsSubView.set('form');
  }

  onDeleteLeadConfirm(id: string): void {
    this.leadService.deleteLead(id).subscribe({
      next: () => {
        this.refreshLeads();
        this.deleteConfirmId.set(null);
      },
      error: (err) => {
        console.error('Failed to delete lead:', err);
        this.deleteConfirmId.set(null);
      }
    });
  }

  onCancelLeadForm(): void {
    this.leadsSubView.set('list');
    this.editingLead.set(null);
  }

  onSaveLeadForm(formValue: any): void {
    this.isSubmitting.set(true);
    this.errorMessage.set('');
    
    const payload = this.buildLeadPayload(formValue);
    const request = this.editingLead()
      ? this.leadService.updateLead(this.editingLead()?.id || '', payload as LeadRecord)
      : this.leadService.createLead(payload as Omit<LeadRecord, 'id'>);

    request.subscribe({
      next: () => {
        this.showSuccessToast.set(true);
        this.showSuccessToastText.set(this.editingLead() ? 'Lead Updated Successfully!' : 'Lead Saved Successfully!');
        this.isSubmitting.set(false);
        this.editingLead.set(null);
        this.refreshLeads();
        this.leadsSubView.set('list');
        setTimeout(() => this.showSuccessToast.set(false), 2500);
      },
      error: (err) => {
        console.error('Failed to save lead:', err);
        this.isSubmitting.set(false);
        const serverMessage = err?.error?.message || err?.message || 'Failed to save lead. Please try again.';
        this.errorMessage.set(serverMessage);
      }
    });
  }

  updateLeadStatus(lead: LeadRecord, newStatus: any): void {
    const status = newStatus as LeadRecord['status'];
    const leadId = lead.id || (lead as any)._id;

    lead.status = status;
    lead.leadstatus = status;

    this.leads.update(currentLeads =>
      currentLeads.map(l => (l.id === leadId || (l as any)._id === leadId) ? { ...l, status, leadstatus: status } : l)
    );

    this.leadService.updateLead(leadId, { leadstatus: status }).subscribe({
      next: () => {
        this.showSuccessToast.set(true);
        this.showSuccessToastText.set(`Lead status updated to "${status}"`);
        setTimeout(() => this.showSuccessToast.set(false), 2000);
      },
      error: (err) => {
        console.error('Failed to update lead status:', err);
        const errorMsg = err?.error?.message || err?.message || 'Failed to update lead status.';
        this.errorMessage.set(errorMsg);
        setTimeout(() => this.errorMessage.set(''), 3500);
      }
    });
  }

  private mapBackendLead(lead: any): LeadRecord {
    const primaryContact = {
      name: lead.name || '',
      phone: lead.mobilenumber || lead.phone || '',
      email: lead.email || ''
    };

    const leadStatus = lead.leadstatus || lead.status || 'New Leads';

    return {
      id: lead.id ?? lead._id ?? '',
      contacts: [primaryContact],
      leadSource: lead.leadsource || lead.leadSource || 'other',
      dateCreated: lead.dateCreated || lead.createdAt?.slice(0, 10) || new Date().toISOString().substring(0, 10),
      market: lead.market_segment || lead.market || 'residential',
      propertyAddress: lead.propertyAddress || lead.ownermailingaddress || '',
      status: leadStatus,
      leadstatus: leadStatus,
      ownerName: lead.ownername || '',
      ownerMailingAddress: lead.ownermailingaddress || '',
      valEstimatedValue: lead.estimatedvalue != null ? String(lead.estimatedvalue) : '',
      valEstimatedTotalLiens: lead.estimatedtotallens != null ? String(lead.estimatedtotallens) : '',
      valEstimatedEquity: lead.estimatedequity != null ? String(lead.estimatedequity) : '',
      propertyCity: lead.city || '',
      propertyState: lead.state || '',
      propertyZip: lead.zip || '',
      propertyType: lead.propertytype || '',
      loanAmount: lead.loanamount != null ? String(lead.loanamount) : '',
      loanInterest: lead.loaninterest != null ? String(lead.loaninterest) : '',
      loanTerm: lead.loanterm != null ? String(lead.loanterm) : '',
      loanDuration: lead.loanduration != null ? String(lead.loanduration) : '',
      loanPayment: lead.loanpayment != null ? String(lead.loanpayment) : '',
      buyerInfo: Array.isArray(lead.buyerInfo) ? lead.buyerInfo : (lead.buyerInfo ? [lead.buyerInfo] : [])
    };
  }

  private buildLeadPayload(formValue: any): Partial<LeadRecord> & Record<string, any> {
    const primaryContact = (formValue.contacts || [])[0] || { name: '', phone: '', email: '' };

    return {
      name: primaryContact.name || '',
      email: primaryContact.email || '',
      mobilenumber: primaryContact.phone || '',
      ownername: formValue.ownerName || '',
      ownermailingaddress: formValue.ownerMailingAddress || formValue.propertyAddress || '',
      estimatedvalue: formValue.valEstimatedValue ? Number(formValue.valEstimatedValue) : undefined,
      estimatedtotallens: formValue.valEstimatedTotalLiens ? Number(formValue.valEstimatedTotalLiens) : undefined,
      estimatedequity: formValue.valEstimatedEquity ? Number(formValue.valEstimatedEquity) : undefined,
      leadsource: formValue.leadSource || 'other',
      market_segment: formValue.market || 'residential',
      propertyAddress: formValue.propertyAddress || '',
      dateCreated: formValue.dateCreated || new Date().toISOString().substring(0, 10),
      leadstatus: this.editingLead()?.status || this.editingLead()?.leadstatus || 'New Leads',
      city: formValue.propertyCity || undefined,
      state: formValue.propertyState || undefined,
      zip: formValue.propertyZip || undefined,
      propertytype: formValue.propertyType || undefined,
      loanamount: formValue.loanAmount ? Number(formValue.loanAmount) : undefined,
      loaninterest: formValue.loanInterest ? Number(formValue.loanInterest) : undefined,
      loanterm: formValue.loanTerm ? Number(formValue.loanTerm) : undefined,
      loanduration: formValue.loanDuration ? Number(formValue.loanDuration) : undefined,
      loanpayment: formValue.loanPayment ? Number(formValue.loanPayment) : undefined
    };
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.currentPage.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.navStore.setDashboardPage(this.currentPage(), this.pageSize());
    this.refreshLeads();
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
    this.currentPage.set(1);
    this.navStore.setDashboardView(mode);
    this.refreshLeads();
  }

  onScroll(event: Event): void {
    if (this.viewMode() !== 'grid') return;
    const element = event.target as HTMLElement;
    const atBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 100;
    if (atBottom) {
      this.loadMoreLeads();
    }
  }
}
