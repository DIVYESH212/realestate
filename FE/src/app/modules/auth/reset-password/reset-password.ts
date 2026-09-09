import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.html'
})

export class ResetPassword implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  token = signal('');
  password = signal('');
  confirmPassword = signal('');
  message = signal('');
  error = signal('');
  loading = signal(false);
  showPassword = signal(false);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const token = params.get('token');
      if (token) {
        this.token.set(token);
      }
    });
    this.route.queryParamMap.subscribe(queryParams => {
      const token = queryParams.get('token');
      if (token) {
        this.token.set(token);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    this.message.set('');
    this.error.set('');

    const password = this.password();
    const confirmPassword = this.confirmPassword();
    const token = this.token();

    if (!token) {
      this.error.set('Invalid or missing reset token.');
      return;
    }

    if (!password || !confirmPassword) {
      this.error.set('Please enter and confirm your new password.');
      return;
    }

    if (password.length < 6) {
      this.error.set('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      this.error.set('Passwords do not match.');
      return;
    }

    this.loading.set(true);

    this.authService.resetPassword(token, password).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.message.set(response.message || 'Password reset successful. Redirecting to login...');
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Unable to reset password. Please try again.');
      }
    });
  }

  backToLogin(): void {
    this.router.navigate(['/login']);
  }
}
