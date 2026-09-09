import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  private readonly router = inject(Router);
  protected readonly authService = inject(AuthService);

  readonly dashboardPath = '/dashboard';
  readonly uploadExcelPath = '/upload-excel';
  readonly drivepath = '/drive';
  readonly emailPath = '/email';
  readonly buyerspath = '/buyers';
  readonly adminpanal= '/adminpanal'

  isActive(path: string): boolean {
    if (path === this.dashboardPath) {
      return this.router.url === '/' || this.router.url === this.dashboardPath || this.router.url.startsWith('/dashboard') || this.router.url.startsWith('/lead');
    }
    return this.router.url === path || this.router.url.startsWith(path);
  }

  onLogout(): void {
    this.authService.logout();
  }
}
