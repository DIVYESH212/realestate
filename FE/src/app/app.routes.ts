import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./modules/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'signup',
    loadComponent: () => import('./modules/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./modules/auth/forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./modules/auth/reset-password/reset-password').then((m) => m.ResetPassword),
  },
  {
    path: 'reset-password/:token',
    loadComponent: () =>
      import('./modules/auth/reset-password/reset-password').then((m) => m.ResetPassword),
  },
  {
    path: 'adminpanal',
    loadComponent: () =>
      import('./modules/adminpanal/adminpanal').then((m) => m.AdminPanalComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./modules/dashboard/dashboard').then((m) => m.DashboardComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'upload-excel',
    loadComponent: () =>
      import('./modules/upload-excel/upload-excel').then((m) => m.UploadExcelComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'lead-profile/:id',
    loadComponent: () =>
      import('./modules/dashboard/components/lead-profile/lead-profile.component').then(
        (m) => m.LeadProfileComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'drive',
    loadComponent: () => import('./modules/drive/drive').then((m) => m.DriveComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'email',
    loadComponent: () => import('./modules/email/email.component').then((m) => m.EmailComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'buyers',
    loadComponent: () => import('./modules/buyer/buyer').then((m) => m.BuyerComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'buyer',
    redirectTo: 'buyers',
    pathMatch: 'full',
  },
  {
    path: 'buyer-profile/:id',
    loadComponent: () =>
      import('./modules/buyer/component/buyerprofile').then((m) => m.BuyerprofileComponent),
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
