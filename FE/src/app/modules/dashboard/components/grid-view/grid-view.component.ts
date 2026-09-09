import { Component, Input, Output, EventEmitter, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { LeadRecord } from '../../../../core/models/lead.model';

export interface StatusColumn {
  id?: string;
  _id?: string;
  name: string;
}

@Component({
  selector: 'app-grid-view',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './grid-view.component.html'
})
export class GridViewComponent implements OnChanges {
  @Input() leads: LeadRecord[] = [];
  @Input() searchQuery: string = '';

  @Output() editLead = new EventEmitter<LeadRecord>();
  @Output() deleteLead = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<{ lead: LeadRecord; status: string }>();
  @Output() openProfile = new EventEmitter<{ id: string; status: string }>();
  @Output() deleteStage = new EventEmitter<StatusColumn>();
  @Output() updateStage = new EventEmitter<{ stage: StatusColumn; name: string }>();

  isDragging = signal<boolean>(false);
  editingStageId = signal<string | null>(null);
  editingStageName = signal<string>('');

  @Input() set customStatusColumns(stages: any[]) {
    if (stages && stages.length > 0) {
      this.statusColumns = stages.map(s => ({
        _id: s._id,
        name: s.name
      }));
      this.sortLeadsBystage();
    }
  }

  statusColumns: StatusColumn[] = [];

  statusLeadsMap: Record<string, LeadRecord[]> = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['leads']) {
      this.sortLeadsBystage();
    }
  }

  private sortLeadsBystage(): void {
    const map: Record<string, LeadRecord[]> = {};
    for (const col of this.statusColumns) {
      map[col.name] = [];
    }

    const defaultCol = this.statusColumns[0]?.name || 'New Leads';
    for (const lead of this.leads) {
      const colName = this.getLeadStatusColumn(lead);
      if (!map[colName]) {
        map[colName] = [];
      }
      map[colName].push(lead);
    }
    this.statusLeadsMap = map;
  }

  getLeadStatusColumn(lead: LeadRecord): string {
    const raw = (lead.leadstatus || lead.status || lead.stage?.name || '').toLowerCase().trim();
    const matched = this.statusColumns.find(col => col.name.toLowerCase() === raw);
    return matched?.name || this.statusColumns[0]?.name || 'New Leads';
  }

  getStatusCount(colName: string): number {
    return this.statusLeadsMap[colName]?.length || 0;
  }

  trackByLeadId(_: number, lead: LeadRecord): string {
    return lead.id;
  }

  // --- Drag and Drop Handlers ---
  onDragStarted(): void {
    this.isDragging.set(true);
  }

  onCardDropped(event: CdkDragDrop<LeadRecord[]>, targetColumn: string): void {
    this.isDragging.set(false);

    if (event.previousContainer === event.container && event.previousIndex === event.currentIndex) {
      return;
    }

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);

    const movedLead = event.container.data[event.currentIndex];
    if (movedLead) {
      movedLead.status = targetColumn;
      movedLead.leadstatus = targetColumn;

      this.statusChange.emit({ lead: movedLead, status: targetColumn });
    }
  }

  // --- Card Action Handlers ---
  onOpenProfile(id: string, status?: string, event?: MouseEvent): void {
    if (this.isDragging()) return;
    if (event && (event.target as HTMLElement)?.closest('button, select, input, a')) return;
    this.openProfile.emit({ id, status: status || '' });
  }

  // --- UI Formatting Helpers ---
  getChannelIconBg(lead: LeadRecord): string {
    const raw = (lead.leadSource || '').toLowerCase();
    if (raw.includes('call') || raw.includes('phone')) return 'bg-amber-50 text-amber-600 border-amber-100';
    if (raw.includes('web') || raw.includes('form')) return 'bg-teal-50 text-teal-600 border-teal-100';
    if (raw.includes('social') || raw.includes('ad')) return 'bg-purple-50 text-purple-600 border-purple-100';
    return 'bg-teal-50 text-[#007b85] border-teal-100/80';
  }

  getContactedText(lead: LeadRecord): string {
    const count = lead.contactedCount || (lead.status === 'New Leads' ? 0 : 1);
    const contact = lead.contacts[0]?.phone || lead.contacts[0]?.email;
    return contact ? `${contact} • Contacted x${count}` : `Contacted x${count}`;
  }

  isCallLead(lead: LeadRecord): boolean {
    return (lead.leadSource || '').toLowerCase().includes('call');
  }

  isProtectedStage(name: string): boolean {
    const normalized = (name || '').toLowerCase().trim();
    return ['new leads', 'under contract'].includes(normalized);
  }

  onDeleteStage(col: StatusColumn, event: MouseEvent): void {
    event.stopPropagation();
    if (this.isProtectedStage(col.name)) return;
    this.deleteStage.emit(col);
  }

  startEditStage(col: StatusColumn, event: MouseEvent): void {
    event.stopPropagation();
    if (this.isProtectedStage(col.name)) return;
    const stageId = col.id || col._id;
    if (!stageId) return;
    this.editingStageId.set(stageId);
    this.editingStageName.set(col.name);
  }

  saveEditStage(col: StatusColumn, event?: Event): void {
    if (event) event.stopPropagation();
    const newName = this.editingStageName().trim();
    if (!newName) {
      this.cancelEditStage();
      return;
    }
    if (newName !== col.name) {
      this.updateStage.emit({ stage: col, name: newName });
    }
    this.editingStageId.set(null);
    this.editingStageName.set('');
  }

  cancelEditStage(event?: Event): void {
    if (event) event.stopPropagation();
    this.editingStageId.set(null);
    this.editingStageName.set('');
  }
}
