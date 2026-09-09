import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeadFilterParams } from '../../../../core/models/lead.model';

@Component({
  selector: 'app-filter-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-drawer.component.html'
})
export class FilterDrawerComponent {
  @Input() isOpen = false;

  @Output() close = new EventEmitter<void>();
  @Output() applyFilters = new EventEmitter<LeadFilterParams>();
  @Output() clearFilters = new EventEmitter<void>();

  activeFilterTab = signal<'simple' | 'advanced'>('simple');

  // Checkboxes for advanced tab
  showPropertyInfoFilter = signal<boolean>(false);
  showDateRangeFilter = signal<boolean>(false);
  showMarketSegmentFilter = signal<boolean>(false);
  showAddressAvailabilityFilter = signal<boolean>(false);
  showPropertyValueFilter = signal<boolean>(false);
  showLoanAmountFilter = signal<boolean>(false);
  showBuyerDetailsFilter = signal<boolean>(false);

  // Form Fields
  propertyInfo = signal<string>('');
  startDate = signal<string>('');
  endDate = signal<string>('');
  marketSegmentFilter = signal<string>('all');
  addressAvailability = signal<string>('all');

  propertyValueOperator = signal<string>('all');
  propertyValueMin = signal<number | null>(null);
  propertyValueMax = signal<number | null>(null);
  loanAmountOperator = signal<string>('all');
  loanAmountMin = signal<number | null>(null);
  loanAmountMax = signal<number | null>(null);

  buyerName = signal<string>('');
  buyerMobile = signal<string>('');
  buyerAddress = signal<string>('');
  buyerEmail = signal<string>('');

  getFiltersPayload(): LeadFilterParams {
    return {
      propertyInfo: this.propertyInfo(),
      startDate: this.startDate(),
      endDate: this.endDate(),
      market_segment: this.marketSegmentFilter(),
      addressAvailability: this.addressAvailability(),
      propertyValueOperator: this.propertyValueOperator(),
      propertyValueMin: this.propertyValueOperator() === 'less' ? null : this.propertyValueMin(),
      propertyValueMax: this.propertyValueOperator() === 'greater' ? null : this.propertyValueMax(),
      loanAmountOperator: this.loanAmountOperator(),
      loanAmountMin: this.loanAmountOperator() === 'less' ? null : this.loanAmountMin(),
      loanAmountMax: this.loanAmountOperator() === 'greater' ? null : this.loanAmountMax(),
      buyerName: this.buyerName(),
      buyerMobile: this.buyerMobile(),
      buyerAddress: this.buyerAddress(),
      buyerEmail: this.buyerEmail()
    };
  }

  onApply(): void {
    this.applyFilters.emit(this.getFiltersPayload());
  }

  onResetAll(): void {
    this.showPropertyInfoFilter.set(false);
    this.showDateRangeFilter.set(false);
    this.showMarketSegmentFilter.set(false);
    this.showAddressAvailabilityFilter.set(false);
    this.showPropertyValueFilter.set(false);
    this.showLoanAmountFilter.set(false);
    this.showBuyerDetailsFilter.set(false);

    this.propertyInfo.set('');
    this.startDate.set('');
    this.endDate.set('');
    this.marketSegmentFilter.set('all');
    this.addressAvailability.set('all');
    this.propertyValueOperator.set('all');
    this.propertyValueMin.set(null);
    this.propertyValueMax.set(null);
    this.loanAmountOperator.set('all');
    this.loanAmountMin.set(null);
    this.loanAmountMax.set(null);
    this.buyerName.set('');
    this.buyerMobile.set('');
    this.buyerAddress.set('');
    this.buyerEmail.set('');

    this.clearFilters.emit();
  }

  onClose(): void {
    this.close.emit();
  }
}
