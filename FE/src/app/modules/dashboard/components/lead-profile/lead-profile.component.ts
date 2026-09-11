import {
  Component,
  OnInit,
  signal,
  computed,
  inject,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LeadService } from '../../../../core/services/lead.service';
import { StageService } from '../../../../core/services/stage.service';
import { EmailService } from '../../../../core/services/email.service';
import { AuthService } from '../../../../core/services/auth.service';
import { SidebarComponent } from '../../../../shared/sidebar/sidebar.component';
import { LeadCashBuyersComponent } from './components/lead-cash-buyers/lead-cash-buyers.component';

@Component({
  selector: 'app-lead-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    SidebarComponent,
    LeadCashBuyersComponent,
  ],
  templateUrl: './lead-profile.component.html',
})
export class LeadProfileComponent implements OnInit {
  @ViewChild(LeadCashBuyersComponent) cashBuyersComp?: LeadCashBuyersComponent;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private sanitizer = inject(DomSanitizer);
  private leadService = inject(LeadService);
  private stageService = inject(StageService);
  private emailService = inject(EmailService);
  private authService = inject(AuthService);

  // User & Lead State
  currentUserEmail = signal<string>('');
  leadId = signal<string | null>(null);
  leadData = signal<any | null>(null);
  stages = signal<any[]>([]);
  leadEmails = signal<any[]>([]);
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');
  totalBuyersCount = signal<number>(0);

  // AI Summary State
  aiSummary = signal<string | null>(null);
  loadingAiSummary = signal<boolean>(false);
  aiOtherLeadsCount = signal<number>(0);
  aiAssignedBuyer = signal<any | null>(null);
  aiSource = signal<'gemini' | 'fallback' | null>(null);
  aiErrorMessage = signal<string | null>(null);

  // UI & Modals State
  activeTab = signal<'overview' | 'contacts' | 'property' | 'financial' | 'cashbuyer' | 'emails'>('overview');
  safeMapUrl = signal<SafeResourceUrl | null>(null);
  isEditing = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  showDeleteConfirm = signal<boolean>(false);
  showSuccessToast = signal<boolean>(false);
  successToastMessage = signal<string>('');
  showEmailModal = signal<boolean>(false);
  isSendingEmail = signal<boolean>(false);

  // Navigation State
  prevLeadId = signal<string | null>(null);
  nextLeadId = signal<string | null>(null);
  navIndex = signal<number>(0);
  navTotal = signal<number>(0);
  navContextTitle = signal<string>('');

  // Reactive Forms
  editForm!: FormGroup;
  emailForm!: FormGroup;

  // Computeds
  statusOptions = computed(() => this.stages().map((s) => s.name));

  ngOnInit(): void {
    this.initForms();
    this.loadCurrentUserEmail();
    this.loadStages();

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.leadId.set(id);
        this.activeTab.set('cashbuyer');
        this.loadLead(id);
        this.updateNavigation(id);
      } else {
        this.errorMessage.set('No Lead ID provided in route.');
        this.loading.set(false);
      }
    });
  }

  // --- Initializers & Loaders ---

  private initForms(): void {
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.email]],
      mobilenumber: ['', [Validators.required]],
      ownername: [''],
      ownermailingaddress: [''],
      leadsource: ['website'],
      market_segment: ['residential'],
      propertyAddress: [''],
      city: [''],
      state: [''],
      zip: [''],
      propertytype: ['Residential'],
      estimatedvalue: [''],
      estimatedtotallens: [''],
      estimatedequity: [''],
      loanamount: [''],
      loaninterest: [''],
      loanterm: [''],
      loanpayment: [''],
      leadstatus: ['new'],
    });

    this.emailForm = this.fb.group({
      to: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required]],
      message: ['', [Validators.required]],
    });
  }

  private loadCurrentUserEmail(): void {
    const tokenEmail = this.authService.currentUserEmail();
    if (tokenEmail) this.currentUserEmail.set(tokenEmail);

    this.authService.getUserProfile().subscribe({
      next: (res) => {
        const email = res?.data?.user?.email || res?.user?.email;
        if (email) this.currentUserEmail.set(email);
      },
      error: () => {},
    });
  }

  loadStages(): void {
    this.stageService.getStages().subscribe({
      next: (stages) => {
        if (stages?.length) this.stages.set([...stages]);
        const curId = this.leadId();
        if (curId) this.updateNavigation(curId);
      },
      error: (err) => console.error('Failed to load stages:', err),
    });
  }

  loadLead(id: string): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.leadService.getLeadById(id).subscribe({
      next: (res) => {
        const data = res?.data?.data || res?.data || res;
        this.leadData.set(data);
        this.populateForm(data);
        this.updateSafeMapUrl(data.propertyAddress || data.ownermailingaddress || '');
        this.loadLeadEmails(id);
        this.loadAiSummary(id);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load lead:', err);
        this.errorMessage.set('Failed to fetch lead information from server.');
        this.loading.set(false);
      },
    });
  }

  loadAiSummary(specificId?: string): void {
    const id = specificId || this.leadId();
    if (!id) return;

    this.loadingAiSummary.set(true);
    this.aiErrorMessage.set(null);
    this.leadService.getLeadAiSummary(id).subscribe({
      next: (res) => {
        this.aiSummary.set(res?.summary || null);
        this.aiOtherLeadsCount.set(res?.otherLeadsCount ?? 0);
        this.aiAssignedBuyer.set(res?.buyer || null);
        this.aiSource.set(res?.source || 'fallback');
        this.aiErrorMessage.set(res?.aiError || null);
        this.loadingAiSummary.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch AI summary:', err);
        this.aiErrorMessage.set(err?.error?.message || 'Failed to fetch AI summary');
        this.loadingAiSummary.set(false);
      }
    });
  }

  formatAiSummary(text: string | null): string {
    if (!text) return '';
    return text
      // Convert **bold** to styled <strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-teal-300 font-bold">$1</strong>')
      // Convert *italic* to <em> (but not inside **)
      .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
      // Convert markdown bullet points (- or *) to styled bullets
      .replace(/^[\s]*[-*]\s+/gm, '• ')
      // Convert numbered lists (1. 2. 3.) to styled numbers
      .replace(/^(\d+)\.\s+/gm, '<strong class="text-teal-400">$1.</strong> ')
      // Convert newlines to <br> for proper rendering
      .replace(/\n/g, '<br>');
  }


  private populateForm(lead: any): void {
    const val: any = {};
    Object.keys(this.editForm.controls).forEach((k) => {
      val[k] = lead[k] ?? '';
    });
    val.mobilenumber = lead.mobilenumber || lead.phone || '';
    val.ownername = lead.ownername || lead.ownerName || '';
    val.ownermailingaddress = lead.ownermailingaddress || lead.ownerMailingAddress || '';
    val.estimatedvalue = lead.estimatedvalue ?? lead.propertyvalue ?? '';
    val.estimatedtotallens = lead.estimatedtotallens ?? lead.valEstimatedTotalLiens ?? '';
    val.estimatedequity = lead.estimatedequity ?? lead.valEstimatedEquity ?? '';
    val.leadstatus = lead.leadstatus || lead.status || '';
    this.editForm.patchValue(val);
  }

  // --- Navigation Helpers ---

  private getLeadId(l: any): string {
    if (!l) return '';
    const val = l.id || l._id || '';
    return String(val).trim();
  }

  private updateNavigation(currentId: string): void {
    if (!currentId) return;

    const navList = this.leadService.navigationLeads();
    const allList = this.leadService.allLeads();

    // 1. Try finding in navigationLeads()
    if (navList?.length && this.calculateAdjacentLeads(currentId, navList)) {
      return;
    }

    // 2. If not found in navigationLeads(), try allLeads()
    if (allList?.length && this.calculateAdjacentLeads(currentId, allList)) {
      this.leadService.setNavigationLeads(allList, 'All Leads', allList);
      return;
    }

    // 3. If still not found or lists are empty (e.g. direct URL / refresh), fetch from backend
    this.leadService.getLeads(1, 500).subscribe({
      next: (res) => {
        const leads = res?.leads || [];
        if (leads.length) {
          this.leadService.setNavigationLeads(leads, 'All Leads', leads);
          this.calculateAdjacentLeads(currentId, leads);
        } else {
          this.resetNavigation();
        }
      },
      error: (err) => {
        console.error('Failed to fetch leads for navigation:', err);
        this.resetNavigation();
      },
    });
  }

  private resetNavigation(): void {
    this.prevLeadId.set(null);
    this.nextLeadId.set(null);
    this.navIndex.set(0);
    this.navTotal.set(0);
  }

  private calculateAdjacentLeads(currentId: string, leads: any[]): boolean {
    if (!leads?.length) {
      this.resetNavigation();
      return false;
    }

    const curIdStr = String(currentId).trim();
    const idx = leads.findIndex((l) => this.getLeadId(l) === curIdStr);

    if (idx !== -1) {
      const curLead = leads[idx];
      const contextTitle = this.leadService.navigationContextTitle();
      const stageName = curLead.leadstatus || curLead.status || 'All Leads';
      this.navContextTitle.set(contextTitle || `Stage: ${stageName}`);
      this.navIndex.set(idx + 1);
      this.navTotal.set(leads.length);

      const prev = idx > 0 ? leads[idx - 1] : null;
      const next = idx < leads.length - 1 ? leads[idx + 1] : null;

      const prevId = prev ? this.getLeadId(prev) : null;
      const nextId = next ? this.getLeadId(next) : null;

      this.prevLeadId.set(prevId || null);
      this.nextLeadId.set(nextId || null);
      return true;
    }

    // Lead not found in this specific list
    return false;
  }

  goToPrevLead(): void {
    const prev = this.prevLeadId();
    if (prev) {
      this.router.navigate(['/lead-profile', prev]);
    }
  }

  goToNextLead(): void {
    const next = this.nextLeadId();
    if (next) {
      this.router.navigate(['/lead-profile', next]);
    }
  }

  // --- Lead Actions & Status ---

  setActiveTab(tab: 'overview' | 'contacts' | 'property' | 'financial' | 'cashbuyer' | 'emails'): void {
    this.activeTab.set(tab);
  }

  getCurrentStatus(): string {
    const status = this.leadData()?.leadstatus || this.leadData()?.status || '';
    const match = this.stages().find((s) => (s.name || '').toLowerCase() === status.toLowerCase());
    return match ? match.name : status || this.statusOptions()[0] || '';
  }

  updateSafeMapUrl(address: string): void {
    const query = encodeURIComponent(address.trim() || 'Wall Street, New York');
    const url = `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    this.safeMapUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
  }

  onUpdateStatus(newStatus: string): void {
    const id = this.leadId();
    if (!newStatus || !id) return;

    this.leadService.updateLead(id, { leadstatus: newStatus, status: newStatus }).subscribe({
      next: () => {
        this.leadData.update((cur) => ({ ...cur, leadstatus: newStatus, status: newStatus }));
        this.editForm?.patchValue({ leadstatus: newStatus });
        this.showToast(`Lead status updated to "${newStatus}"!`);
      },
      error: (err) => this.showToast(err?.error?.message || 'Failed to update lead status.'),
    });
  }

  onSaveEdit(): void {
    if (this.editForm.invalid) return;

    const id = this.leadId();
    if (!id) return;

    this.isSubmitting.set(true);
    const formVal = this.editForm.value;
    const num = (v: any) => (v !== '' && v != null && !isNaN(Number(v)) ? Number(v) : undefined);

    const payload: any = {
      ...this.leadData(),
      ...formVal,
      estimatedvalue: num(formVal.estimatedvalue),
      estimatedtotallens: num(formVal.estimatedtotallens),
      estimatedequity: num(formVal.estimatedequity),
      loanamount: num(formVal.loanamount),
      loaninterest: num(formVal.loaninterest),
      loanterm: num(formVal.loanterm),
      loanpayment: num(formVal.loanpayment),
    };

    this.leadService.updateLead(id, payload).subscribe({
      next: () => {
        this.leadData.set({ ...payload, _id: id });
        this.updateSafeMapUrl(formVal.propertyAddress || formVal.ownermailingaddress || '');
        this.isSubmitting.set(false);
        this.isEditing.set(false);
        this.showToast('Lead details updated successfully!');
      },
      error: (err) => {
        console.error('Failed to update lead:', err);
        this.isSubmitting.set(false);
        this.showToast('Error updating lead. Please try again.');
      },
    });
  }

  onDeleteLead(): void {
    const id = this.leadId();
    if (!id) return;

    this.leadService.deleteLead(id).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        console.error('Failed to delete lead:', err);
        this.showToast('Failed to delete lead.');
        this.showDeleteConfirm.set(false);
      },
    });
  }

  onLeadUpdated(): void {
    const id = this.leadId();
    if (id) this.loadLead(id);
  }

  openAddBuyerModal(): void {
    this.activeTab.set('cashbuyer');
    setTimeout(() => this.cashBuyersComp?.openAddBuyerModal(), 0);
  }

  // --- Email Flow ---

  openEmailModal(): void {
    const lead = this.leadData();
    const defaultTo = lead?.email || lead?.contacts?.[0]?.email || '';
    this.emailForm.reset({ to: defaultTo, subject: '', message: '' });
    this.showEmailModal.set(true);
  }

  closeEmailModal(): void {
    this.showEmailModal.set(false);
  }

  loadLeadEmails(leadId: string): void {
    if (!leadId) return;
    this.emailService.getEmails({ lead_id: leadId }).subscribe({
      next: (res) => this.leadEmails.set(res?.emails || []),
      error: (err) => console.error('Failed to load lead emails:', err),
    });
  }

  sendEmail(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.isSendingEmail.set(true);
    const formVal = this.emailForm.value;
    const leadId = this.leadId();

    const payload = {
      lead_id: leadId || undefined,
      from: this.currentUserEmail(),
      to: formVal.to,
      subject: formVal.subject,
      message: formVal.message,
      status: 'sent',
    };

    this.emailService.sendEmail(payload).subscribe({
      next: () => {
        this.isSendingEmail.set(false);
        this.showEmailModal.set(false);
        this.showToast(`Email sent successfully to ${formVal.to}!`);
        if (leadId) this.loadLeadEmails(leadId);
      },
      error: (err) => {
        console.error('Failed to send email:', err);
        this.isSendingEmail.set(false);
        this.showToast(err?.error?.message || err?.message || 'Failed to send email.');
      },
    });
  }

  openNativeMailClient(): void {
    const { to = '', subject = '', message = '' } = this.emailForm.value;
    window.open(
      `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`,
      '_blank',
    );
  }

  // --- Styling and TrackBy Helpers ---

  showToast(msg: string): void {
    this.successToastMessage.set(msg);
    this.showSuccessToast.set(true);
    setTimeout(() => this.showSuccessToast.set(false), 3500);
  }

  getInitials(name: string = ''): string {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (name.trim().slice(0, 2) || 'LD').toUpperCase();
  }

  getStatusClasses(status: string = ''): string {
    const s = status.toLowerCase().trim();
    if (s.includes('new'))
      return 'text-emerald-700 bg-emerald-50 border-emerald-300/80 hover:bg-emerald-100/70 focus:border-emerald-500';
    if (s.includes('no contact'))
      return 'text-purple-700 bg-purple-50 border-purple-300/80 hover:bg-purple-100/70 focus:border-purple-500';
    if (s.includes('contact'))
      return 'text-amber-700 bg-amber-50 border-amber-300/80 hover:bg-amber-100/70 focus:border-amber-500';
    if (s.includes('appointment'))
      return 'text-orange-700 bg-orange-50 border-orange-300/80 hover:bg-orange-100/70 focus:border-orange-500';
    if (s.includes('due diligence'))
      return 'text-blue-700 bg-blue-50 border-blue-300/80 hover:bg-blue-100/70 focus:border-blue-500';
    if (s.includes('offer'))
      return 'text-rose-700 bg-rose-50 border-rose-300/80 hover:bg-rose-100/70 focus:border-rose-500';
    if (s.includes('contract'))
      return 'text-amber-800 bg-amber-100/80 border-amber-300 hover:bg-amber-200/70 focus:border-amber-500';
    return 'text-teal-800 bg-teal-50 border-teal-300/80 hover:bg-teal-100/70 focus:border-teal-500';
  }
}
