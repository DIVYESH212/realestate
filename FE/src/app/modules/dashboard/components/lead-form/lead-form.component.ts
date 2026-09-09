import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LeadRecord } from '../../../../core/models/lead.model';

@Component({
  selector: 'app-lead-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lead-form.component.html'
})
export class LeadFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  private sanitizer = inject(DomSanitizer);

  @Input() editingLead: LeadRecord | null = null;
  @Input() isSubmitting = false;
  @Input() serverErrorMessage = '';

  @Output() saveLead = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  dashboardForm!: FormGroup;
  formSubmitted = signal(false);
  streetViewStatus = signal<'empty' | 'previewing' | 'streetview'>('empty');
  safeMapUrl = signal<SafeResourceUrl>('');

  ngOnInit(): void {
    this.initForm();
    if (this.editingLead) {
      this.populateForm(this.editingLead);
    } else {
      this.resetForm();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editingLead'] && this.dashboardForm) {
      if (this.editingLead) {
        this.populateForm(this.editingLead);
      } else {
        this.resetForm();
      }
    }
  }

  private initForm(): void {
    this.dashboardForm = this.fb.group({
      contacts: this.fb.array([this.createContactGroup()]),
      leadSource: ['', Validators.required],
      dateCreated: [new Date().toISOString().substring(0, 10), Validators.required],
      market: ['residential', Validators.required],
      propertyAddress: ['', [Validators.maxLength(150)]],
      ownerName: ['', [Validators.maxLength(100)]],
      ownerMailingAddress: ['', [Validators.maxLength(200)]],
      valEstimatedValue: ['', [Validators.pattern(/^\d*\.?\d*$/)]],
      valEstimatedTotalLiens: ['', [Validators.pattern(/^\d*\.?\d*$/)]],
      valEstimatedEquity: ['', [Validators.pattern(/^\d*\.?\d*$/)]],
      propertyCity: ['', [Validators.maxLength(100)]],
      propertyState: ['', [Validators.maxLength(100)]],
      propertyZip: ['', [Validators.maxLength(100)]],
      propertyType: ['', [Validators.maxLength(100)]],
      loanAmount: ['', [Validators.pattern(/^\d*\.?\d*$/)]],
      loanInterest: ['', [Validators.pattern(/^\d*\.?\d*$/)]],
      loanTerm: ['', [Validators.pattern(/^\d*\.?\d*$/)]],
      loanDuration: ['', [Validators.pattern(/^\d*\.?\d*$/)]],
      loanPayment: ['', [Validators.pattern(/^\d*\.?\d*$/)]]
    });
  }

  createContactGroup(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.maxLength(50)]],
      phone: ['', [Validators.required, Validators.maxLength(20), Validators.pattern(/^[+]?[0-9\s\-()]{7,20}$/)]],
      email: ['', [Validators.email, Validators.maxLength(50)]]
    });
  }

  get contacts(): FormArray {
    return this.dashboardForm.get('contacts') as FormArray;
  }

  addMoreContact(): void {
    this.contacts.push(this.createContactGroup());
  }

  removeContact(index: number): void {
    if (this.contacts.length > 1) {
      this.contacts.removeAt(index);
    } else {
      this.contacts.at(0).reset({ name: '', phone: '', email: '' });
    }
  }

  getAddressValue(): string {
    return this.dashboardForm.get('propertyAddress')?.value || '';
  }

  onPropertyAddressInput(val: string): void {
    const trimmed = val ? val.trim() : '';
    this.updateSafeMapUrl(trimmed);

    if (!trimmed) {
      this.streetViewStatus.set('empty');
    } else if (this.streetViewStatus() === 'empty') {
      this.streetViewStatus.set('previewing');
    }
  }

  clearPropertyAddress(): void {
    this.dashboardForm.get('propertyAddress')?.setValue('');
    this.onPropertyAddressInput('');
  }

  updateSafeMapUrl(address: string): void {
    const query = encodeURIComponent(address.trim() || 'Wall Street, New York');
    const url = `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    this.safeMapUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
  }

  locatePin(): void {
    const address = this.getAddressValue().trim();
    if (address) {
      this.updateSafeMapUrl(address);
      this.streetViewStatus.set('previewing');
    }
  }

  toggleStreetView(): void {
    const address = this.getAddressValue().trim();
    if (!address) return;

    if (this.streetViewStatus() === 'streetview') {
      this.updateSafeMapUrl(address);
      this.streetViewStatus.set('previewing');
    } else {
      const query = encodeURIComponent(address);
      const url = `https://maps.google.com/maps?q=${query}&cbll=&layer=c&cbp=12,0,0,0,0&output=svembed`;
      this.safeMapUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
      this.streetViewStatus.set('streetview');
    }
  }

  populateForm(lead: LeadRecord): void {
    if (!this.dashboardForm) this.initForm();
    this.contacts.clear();
    
    if (lead.contacts && lead.contacts.length > 0) {
      lead.contacts.forEach((contact) => {
        this.contacts.push(this.fb.group({
          name: [contact.name || '', [Validators.maxLength(50)]],
          phone: [contact.phone || '', [Validators.required, Validators.maxLength(20), Validators.pattern(/^[+]?[0-9\s\-()]{7,20}$/)]],
          email: [contact.email || '', [Validators.email, Validators.maxLength(50)]]
        }));
      });
    } else {
      this.contacts.push(this.createContactGroup());
    }

    this.dashboardForm.patchValue({
      leadSource: lead.leadSource || 'website',
      dateCreated: lead.dateCreated,
      market: lead.market || 'residential',
      propertyAddress: lead.propertyAddress,
      ownerName: lead.ownerName,
      ownerMailingAddress: lead.ownerMailingAddress,
      valEstimatedValue: lead.propertyvalue || lead.valEstimatedValue || '',
      valEstimatedTotalLiens: lead.valEstimatedTotalLiens || '',
      valEstimatedEquity: lead.valEstimatedEquity || '',
      propertyCity: lead.propertyCity || '',
      propertyState: lead.propertyState || '',
      propertyZip: lead.propertyZip || '',
      propertyType: lead.propertyType || '',
      loanAmount: lead.loanAmount || '',
      loanInterest: lead.loanInterest || '',
      loanTerm: lead.loanTerm || '',
      loanDuration: lead.loanDuration || '',
      loanPayment: lead.loanPayment || ''
    });

    this.updateSafeMapUrl(lead.propertyAddress || '');
  }

  resetForm(): void {
    if (!this.dashboardForm) this.initForm();
    this.dashboardForm.reset({
      leadSource: '',
      dateCreated: new Date().toISOString().substring(0, 10),
      market: 'residential',
      propertyAddress: '',
      ownerName: '',
      ownerMailingAddress: '',
      valEstimatedValue: '',
      valEstimatedTotalLiens: '',
      valEstimatedEquity: '',
      propertyCity: '',
      propertyState: '',
      propertyZip: '',
      propertyType: '',
      loanAmount: '',
      loanInterest: '',
      loanTerm: '',
      loanDuration: '',
      loanPayment: ''
    });
    this.contacts.clear();
    this.contacts.push(this.createContactGroup());
    this.formSubmitted.set(false);
    this.streetViewStatus.set('empty');
    this.updateSafeMapUrl('');
  }

  onSubmit(): void {
    this.formSubmitted.set(true);
    if (this.dashboardForm.invalid) {
      return;
    }
    this.saveLead.emit(this.dashboardForm.getRawValue());
  }

  onCancel(): void {
    this.resetForm();
    this.cancel.emit();
  }
}
