import { Component, signal, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html'
})
export class Login implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  // Authentication State Managed via Angular Signals
  isLoginMode = signal<boolean>(true);
  usernameText = signal<string>('');
  emailText = signal<string>('');
  mobileNumberText = signal<string>('');
  passwordText = signal<string>('');
  confirmPasswordText = signal<string>('');
  passcodeError = signal<string>('');
  successMessage = signal<string>('');
  showPassword = signal<boolean>(false);

  ngOnInit(): void {
    // Dynamically listen to route shifts to support component reuse gracefully
    this.route.url.subscribe(() => {
      const isSignup = this.router.url.includes('/signup');
      this.isLoginMode.set(!isSignup);
      this.resetFormState();
    });

    // If already logged in, redirect to dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(visible => !visible);
  }

  onSubmit(): void {
    this.passcodeError.set('');
    this.successMessage.set('');

    if (this.isLoginMode()) {
      const username = this.usernameText().trim();
      const password = this.passwordText();

      if (!username || !password) {
        this.passcodeError.set('Username and password are required.');
        return;
      }

      this.authService.login({ username, password }).subscribe({
        next: (res) => {
          const token = res?.data?.token || (typeof res?.data === 'string' ? res.data : null) || res?.token;
          if (token) {
            localStorage.setItem('token', token);
          }
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          const errMsg = err.error?.message || 'Login failed. Please check your credentials.';
          this.passcodeError.set(errMsg);
        }
      });
    } else {
      const username = this.usernameText().trim();
      const email = this.emailText().trim();
      const mobilenumber = this.mobileNumberText().trim();
      const password = this.passwordText();

      // Basic client-side validation checks
      if (!username || !email || !mobilenumber || !password) {
        this.passcodeError.set('All fields are required.');
        return;
      }

      if (username.length < 5 || username.length > 10) {
        this.passcodeError.set('Username must be between 5 and 10 characters.');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        this.passcodeError.set('Please enter a valid email address.');
        return;
      }

      if (!/^\d{10}$/.test(mobilenumber)) {
        this.passcodeError.set('Mobile number must be exactly 10 digits.');
        return;
      }

      if (password !== this.confirmPasswordText()) {
        this.passcodeError.set('Passwords do not match.');
        return;
      }

      const userData = { username, email, mobilenumber, password };

      this.authService.register(userData).subscribe({
        next: () => {
          this.successMessage.set('Account created successfully! Please log in.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          const errMsg = err.error?.message || 'Registration failed. Please check your inputs.';
          this.passcodeError.set(errMsg);
        }
      });
    }
  }

  signup(): void {
    this.router.navigate(['/signup']);
  }
  
  login(): void {
    this.router.navigate(['/login']);
  }

  forgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  private resetFormState(): void {
    this.passcodeError.set('');
    this.successMessage.set('');
    this.usernameText.set('');
    this.emailText.set('');
    this.mobileNumberText.set('');
    this.passwordText.set('');
    this.confirmPasswordText.set('');
  }
}