import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen gradient-bg flex items-center justify-center p-6 relative overflow-hidden">
      <!-- Decorative Blobs -->
      <div class="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s"></div>

      <div class="modal-content max-w-[440px] w-full p-10 relative z-10 glass">
        <div class="text-center mb-10">
          <div class="w-20 h-20 gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/30 transform transition-transform hover:rotate-12 duration-500">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04M12 2.944V22m0-19.056c1.09.539 2.228 1.01 3.41 1.41M12 2.944c-1.09.539-2.228 1.01-3.41 1.41m7.5 13.91a12.437 12.437 0 01-4.09 1.69m-7.5-13.91a12.437 12.437 0 004.09 1.69"></path>
            </svg>
          </div>
          <h1 class="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">
            Welcome Back
          </h1>
          <p class="text-gray-500 dark:text-gray-400 font-medium">RBAC Secure Task Management</p>
        </div>

        <div class="flex p-1.5 bg-gray-100/50 dark:bg-gray-800/50 rounded-2xl mb-8 backdrop-blur-md">
          <button 
            (click)="isLogin = true" 
            [class.bg-white]="isLogin"
            [class.dark:bg-gray-700]="isLogin"
            [class.text-indigo-600]="isLogin"
            [class.shadow-sm]="isLogin"
            class="flex-1 py-2.5 rounded-xl font-bold transition-all duration-300 transform"
            [class.scale-100]="isLogin">
            Login
          </button>
          <button 
            (click)="isLogin = false" 
            [class.bg-white]="!isLogin"
            [class.dark:bg-gray-700]="!isLogin"
            [class.text-indigo-600]="!isLogin"
            [class.shadow-sm]="!isLogin"
            class="flex-1 py-2.5 rounded-xl font-bold transition-all duration-300 transform"
            [class.scale-100]="!isLogin">
            Register
          </button>
        </div>

        <form (ngSubmit)="onSubmit()" class="space-y-6">
          <div *ngIf="!isLogin" class="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
            <div>
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 px-1">First Name</label>
              <input 
                type="text" 
                [(ngModel)]="formData.firstName" 
                name="firstName"
                class="input" 
                placeholder="John"
                required>
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 px-1">Last Name</label>
              <input 
                type="text" 
                [(ngModel)]="formData.lastName" 
                name="lastName"
                class="input" 
                placeholder="Doe"
                required>
            </div>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 px-1">Email Address</label>
            <input 
              type="email" 
              [(ngModel)]="formData.email" 
              name="email"
              class="input focus:ring-4" 
              placeholder="owner&#64;example.com"
              required>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 px-1">Password</label>
            <input 
              type="password" 
              [(ngModel)]="formData.password" 
              name="password"
              class="input focus:ring-4" 
              placeholder="••••••••"
              required>
          </div>

          <div *ngIf="!isLogin" class="animate-in slide-in-from-top-2 duration-300">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 px-1">Organization</label>
            <input 
              type="text" 
              [(ngModel)]="formData.organizationId" 
              name="organizationId"
              class="input focus:ring-4" 
              placeholder="org-1"
              required>
          </div>

          <div *ngIf="error" class="bg-rose-50 dark:bg-rose-950/30 border-l-4 border-rose-500 text-rose-800 dark:text-rose-300 px-4 py-4 rounded-xl animate-in shake-in duration-300 flex items-center space-x-3">
            <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <span class="font-medium">{{ error }}</span>
          </div>

          <button 
            type="submit" 
            [disabled]="loading"
            class="btn btn-primary w-full py-4 text-lg hover:translate-y-[-2px] active:translate-y-0 transition-transform">
            <span *ngIf="!loading">{{ isLogin ? 'Sign In' : 'Create Account' }}</span>
            <span *ngIf="loading" class="flex items-center justify-center">
              <svg class="animate-spin h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Authenticating...
            </span>
          </button>
        </form>

        <div class="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800">
          <p class="text-center text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Demo Accounts</p>
          <div class="grid grid-cols-3 gap-2">
            <div class="p-2.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-800/30 text-center">
              <p class="text-[10px] font-black text-indigo-600 dark:text-indigo-400">OWNER</p>
            </div>
            <div class="p-2.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-800/30 text-center">
              <p class="text-[10px] font-black text-indigo-600 dark:text-indigo-400">ADMIN</p>
            </div>
            <div class="p-2.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-800/30 text-center">
              <p class="text-[10px] font-black text-indigo-600 dark:text-indigo-400">VIEWER</p>
            </div>
          </div>
          <p class="text-center text-[11px] text-gray-400 mt-4 font-medium italic">All passwords are <span class="text-indigo-500 font-bold">password</span></p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  isLogin = true;
  loading = false;
  error = '';

  formData = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    organizationId: 'org-1'
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onSubmit(): void {
    this.loading = true;
    this.error = '';

    const request = this.isLogin
      ? this.authService.login({ email: this.formData.email, password: this.formData.password })
      : this.authService.register(this.formData);

    request.subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err.error?.message || 'An error occurred';
        this.loading = false;
      }
    });
  }
}
