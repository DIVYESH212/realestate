import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { LeadRecord } from '../../../../core/models/lead.model';

@Component({
  selector: 'app-list-view',
  standalone: true,
  imports: [CommonModule, RouterLink, MatTableModule, MatPaginatorModule],
  templateUrl: './list-view.component.html'
})
export class ListViewComponent {
  @Input() leads: LeadRecord[] = [];
  @Input() stages: any[] = [];
  displayedColumns: string[] = ['contacts', 'buyerName', 'marketSource', 'propertyAddress', 'dateCreated', 'status', 'actions'];

  @Input() totalItems = 0;
  @Input() pageIndex = 0;
  @Input() pageSize = 10;

  getStatusOptions(): string[] {
    return (this.stages || []).map(s => s.name);
  }

  getLeadStatus(lead: LeadRecord): string {
    const raw = (lead.status || lead.leadstatus || '').toLowerCase().trim();
    const matched = this.stages?.find(s => (s.name || '').toLowerCase().trim() === raw);
    return matched ? matched.name : (lead.status || lead.leadstatus || this.stages?.[0]?.name || 'New lead');
  }

  @Output() pageChange = new EventEmitter<{ pageIndex: number; pageSize: number }>();

  handlePageEvent(event: any): void {
    this.pageChange.emit({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize
    });
  }

  @Output() editLead = new EventEmitter<LeadRecord>();
  @Output() deleteLead = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<{ lead: LeadRecord; status: string }>();
  @Output() openProfile = new EventEmitter<string>();

  onEditLead(lead: LeadRecord): void {
    this.editLead.emit(lead);
  }

  onDeleteLead(id: string): void {
    this.deleteLead.emit(id);
  }

  onStatusChange(lead: LeadRecord, event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.statusChange.emit({ lead, status: select.value });
  }

  onOpenProfile(id: string, event?: MouseEvent): void {
    if (event) {
      const target = event.target as HTMLElement | null;
      if (target && target.closest('button, select, input, a, .action-cell')) {
        return;
      }
    }
    this.openProfile.emit(id);
  }

  getStatusClasses(status: string): string {
    const s = (status || '').toLowerCase().trim();
    if (s.includes('new')) return 'text-emerald-700 bg-emerald-50 border-emerald-200/80';
    if (s.includes('no contact')) return 'text-purple-700 bg-purple-50 border-purple-200/80';
    if (s.includes('contact')) return 'text-amber-700 bg-amber-50 border-amber-200/80';
    if (s.includes('appointment')) return 'text-orange-700 bg-orange-50 border-orange-200/80';
    if (s.includes('due diligence')) return 'text-blue-700 bg-blue-50 border-blue-200/80';
    if (s.includes('offer')) return 'text-rose-700 bg-rose-50 border-rose-200/80';
    if (s.includes('contract')) return 'text-amber-800 bg-amber-100/70 border-amber-200';
    return 'text-gray-700 bg-gray-50 border-gray-200';
  }
}
