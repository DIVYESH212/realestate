import { Injectable, signal } from '@angular/core';
import { LeadFilterParams } from '../models/lead.model';

export interface DashboardNavigationState {
  viewMode: 'grid' | 'list';
  currentPage: number;
  pageSize: number;
  searchQuery: string;
  filters: LeadFilterParams;
  leadsSubView: 'list' | 'form';
}

export interface BuyerNavigationState {
  page: number;
  limit: number;
  searchQuery: string;
  activeDrawerTab: 'overview' | 'notes' | 'lead';
}

@Injectable({
  providedIn: 'root'
})
export class NavigationStoreService {
  // Dashboard Navigation State
  readonly dashboardState = signal<DashboardNavigationState>({
    viewMode: 'list',
    currentPage: 1,
    pageSize: 10,
    searchQuery: '',
    filters: {},
    leadsSubView: 'list'
  });

  // Buyer Directory Navigation State
  readonly buyerState = signal<BuyerNavigationState>({
    page: 1,
    limit: 10,
    searchQuery: '',
    activeDrawerTab: 'overview'
  });

  // Dashboard Helpers
  setDashboardView(viewMode: 'grid' | 'list'): void {
    this.dashboardState.update(s => ({ ...s, viewMode }));
  }

  setDashboardPage(currentPage: number, pageSize: number = 10): void {
    this.dashboardState.update(s => ({ ...s, currentPage, pageSize }));
  }

  setDashboardSearch(searchQuery: string): void {
    this.dashboardState.update(s => ({ ...s, searchQuery, currentPage: 1 }));
  }

  setDashboardFilters(filters: LeadFilterParams): void {
    this.dashboardState.update(s => ({ ...s, filters, currentPage: 1 }));
  }

  setDashboardSubView(leadsSubView: 'list' | 'form'): void {
    this.dashboardState.update(s => ({ ...s, leadsSubView }));
  }

  // Buyer Directory Helpers
  setBuyerPage(page: number, limit: number = 10): void {
    this.buyerState.update(s => ({ ...s, page, limit }));
  }

  setBuyerSearch(searchQuery: string): void {
    this.buyerState.update(s => ({ ...s, searchQuery, page: 1 }));
  }

  setBuyerDrawerTab(activeDrawerTab: 'overview' | 'notes' | 'lead'): void {
    this.buyerState.update(s => ({ ...s, activeDrawerTab }));
  }
}
