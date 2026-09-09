import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.html'
})
export class ForgotPassword implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  email = signal('');
  message = signal('');
  error = signal('');

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    this.message.set('');
    this.error.set('');

    const email = this.email().trim();
    if (!email) {
      this.error.set('Email is required.');
      return;
    }

    this.authService.forgotPassword(email).subscribe({
      next: (response) => {
        this.message.set(response.message || 'A reset link has been sent if the email exists.');
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Unable to send reset link. Please try again.');
      }
    });
  }

  backToLogin(): void {
    this.router.navigate(['/login']);
  }
}
