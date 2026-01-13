import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AuthService } from '../auth/auth.service';
import { TaskService } from './task.service';
import { ThemeService } from '../shared/theme.service';
import { Task, TaskStatus, TaskCategory, CreateTaskDto, UpdateTaskDto } from '@rbac-task-system/data';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  template: `
    <div class="min-h-screen gradient-bg selection:bg-indigo-500/30">
      <!-- Header -->
      <header class="glass border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 transition-all duration-300">
        <div class="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-5 group cursor-pointer">
              <div class="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04M12 2.944V22m0-19.056c1.09.539 2.228 1.01 3.41 1.41"></path>
                </svg>
              </div>
              <div class="hidden sm:block">
                <h1 class="text-2xl font-black tracking-tight text-gray-900 dark:text-white">RBAC Console</h1>
                <p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-0.5">
                  Secure Identity Management
                </p>
              </div>
            </div>

            <div class="flex items-center space-x-6">
              <div class="hidden md:flex flex-col items-end">
                <span class="text-sm font-bold text-gray-900 dark:text-white">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</span>
                <span class="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  {{ currentUser?.role }}
                </span>
              </div>
              
              <div class="h-8 w-px bg-gray-200 dark:bg-gray-800 hidden sm:block"></div>

              <div class="flex items-center space-x-3">
                <button (click)="toggleTheme()" class="btn btn-secondary !p-2.5 !rounded-2xl transition-all duration-300 hover:rotate-12">
                  <svg *ngIf="!isDarkMode" class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                  </svg>
                  <svg *ngIf="isDarkMode" class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                </button>

                <button *ngIf="currentUser?.role === 'owner' || currentUser?.role === 'admin'" 
                        (click)="openAuditLogs()" 
                        class="btn btn-secondary !rounded-2xl flex items-center space-x-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/30">
                  <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span class="hidden lg:inline">Audit Archive</span>
                </button>

                <button (click)="logout()" class="btn btn-danger !rounded-2xl flex items-center space-x-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                  <span class="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-6 lg:px-8 py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <!-- Dashboard Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div class="card group overflow-hidden relative">
            <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg class="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M19 5v2h-4V5h4M9 5v2H5V5h4m10 8v2h-4v-2h4M9 13v2H5v-2h4m11-9h-6v4h6V4M10 4H4v4h6V4m10 8h-6v4h6v-4m-10 8H4v4h6v-4"/></svg>
            </div>
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Fleet Overview</p>
            <h3 class="text-3xl font-black text-gray-900 dark:text-white">{{ allTasks.length }}</h3>
            <p class="text-sm font-bold text-indigo-500 mt-1">Total System Tasks</p>
          </div>

          <div class="card group border-l-4 border-l-amber-500">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Awaiting Action</p>
            <h3 class="text-3xl font-black text-gray-900 dark:text-white">{{ todoTasks.length }}</h3>
            <p class="text-sm font-bold text-amber-500 mt-1">Backlog Status</p>
          </div>

          <div class="card group border-l-4 border-l-violet-500">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Active Cycle</p>
            <h3 class="text-3xl font-black text-gray-900 dark:text-white">{{ inProgressTasks.length }}</h3>
            <p class="text-sm font-bold text-violet-500 mt-1">Processing...</p>
          </div>

          <div class="card group border-l-4 border-l-emerald-500">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Deployment Success</p>
            <h3 class="text-3xl font-black text-gray-900 dark:text-white">{{ doneTasks.length }}</h3>
            <p class="text-sm font-bold text-emerald-500 mt-1">Resolved Tasks</p>
          </div>
        </div>

        <!-- Kanban Controls -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 class="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Operations Board</h2>
            <p class="text-gray-500 font-medium italic mt-1">Manage and track your organization's workflow</p>
          </div>
            <div class="flex items-center gap-4">
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  id="taskSearch"
                  type="text"
                  [(ngModel)]="searchQuery"
                  (input)="categorizeTasksByStatus()"
                  placeholder="Filter mission objectives... (F)"
                  class="block w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-[#0f1117] text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 sm:text-sm transition-all shadow-sm"
                >
              </div>
              <button (click)="showCreateModal = true" class="btn btn-primary !rounded-2xl py-3 px-6 shadow-indigo-500/25 flex items-center justify-center space-x-2 transform transition-all active:scale-95">
                <svg class="w-5 h-5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path>
                </svg>
                <span>Initiate New Task</span>
              </button>
            </div>
        </div>

        <!-- Progress Insight -->
        <div class="mb-10 card !bg-indigo-500/5 !border-indigo-100 dark:!border-indigo-900/30">
          <div class="flex items-center justify-between mb-4">
             <div class="flex items-center space-x-3">
               <div class="w-2 h-8 bg-indigo-500 rounded-full"></div>
               <h3 class="font-black text-gray-900 dark:text-white uppercase tracking-wider text-sm">Deployment Progress</h3>
             </div>
             <span class="text-2xl font-black text-indigo-600 dark:text-indigo-400">{{ completionPercentage }}%</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3.5 overflow-hidden p-0.5">
            <div 
              class="h-full gradient-primary transition-all duration-1000 ease-out rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)]"
              [style.width.%]="completionPercentage">
            </div>
          </div>
        </div>

        <!-- Kanban Board -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Column Template -->
          <ng-template #columnContainer let-tasks="tasks" let-title="title" let-color="color" let-listId="listId" let-connectedTo="connectedTo" let-handle="handle">
            <div class="flex flex-col h-full min-h-[500px]">
              <div class="flex items-center justify-between mb-5 px-1">
                <div class="flex items-center space-x-3">
                  <div class="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" [class]="'text-'+color+'-500 bg-'+color+'-500'"></div>
                  <h3 class="font-black text-gray-900 dark:text-white text-lg tracking-tight">{{ title }}</h3>
                </div>
                <span class="px-2.5 py-0.5 rounded-lg bg-gray-200 dark:bg-gray-800 text-[10px] font-black text-gray-500 dark:text-gray-400">
                  {{ tasks.length }}
                </span>
              </div>
              
              <div 
                cdkDropList
                #list="cdkDropList"
                [id]="listId"
                [cdkDropListData]="tasks"
                [cdkDropListConnectedTo]="connectedTo"
                (cdkDropListDropped)="drop($event)"
                class="flex-1 space-y-4 rounded-3xl bg-gray-100/50 dark:bg-gray-900/30 p-4 border-2 border-dashed border-gray-200 dark:border-gray-800/50 transition-colors duration-300 min-h-[400px]">
                
                <div *ngFor="let task of tasks" cdkDrag class="task-card !mb-4 group bg-white dark:bg-[#0f1117] border-gray-100 dark:border-gray-800">
                  <div class="flex items-start justify-between gap-4 mb-3">
                    <h4 class="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" [class.line-through]="task.status === 'done'">
                      {{ task.title }}
                    </h4>
                    <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button (click)="editTask(task)" class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-indigo-500 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                      </button>
                      <button (click)="deleteTask(task.id)" class="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-gray-400 hover:text-rose-500 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </div>
                  <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed italic">
                    {{ task.description }}
                  </p>
                  <div class="flex items-center justify-between mt-auto pt-3 border-t border-gray-50 dark:border-gray-800/50">
                    <div class="flex items-center space-x-2">
                       <span class="w-2 h-2 rounded-full" [class]="task.category === 'urgent' ? 'bg-rose-500 animate-pulse' : 'bg-indigo-400'"></span>
                       <span class="text-[10px] font-black uppercase tracking-wider text-gray-400">{{ task.category }}</span>
                    </div>
                    <div class="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border-2 border-white dark:border-gray-800 flex items-center justify-center text-[10px] font-black text-indigo-600 dark:text-indigo-400">
                      {{ task.owner?.firstName?.charAt(0) || 'U' }}
                    </div>
                  </div>
                </div>

                <div *ngIf="tasks.length === 0" class="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-600">
                  <svg class="w-12 h-12 mb-3 stroke-[1.5] opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
                  <p class="text-xs font-bold uppercase tracking-widest">Zone Empty</p>
                </div>
              </div>
            </div>
          </ng-template>

          <ng-container *ngTemplateOutlet="columnContainer; context: {tasks: todoTasks, title: 'Input Backlog', color: 'amber', listId: 'todoList', connectedTo: ['inProgressList', 'doneList']}"></ng-container>
          <ng-container *ngTemplateOutlet="columnContainer; context: {tasks: inProgressTasks, title: 'In Evaluation', color: 'violet', listId: 'inProgressList', connectedTo: ['todoList', 'doneList']}"></ng-container>
          <ng-container *ngTemplateOutlet="columnContainer; context: {tasks: doneTasks, title: 'Certified Done', color: 'emerald', listId: 'doneList', connectedTo: ['todoList', 'inProgressList']}"></ng-container>
        </div>
      </main>

      <!-- Create/Edit Modal -->
      <div *ngIf="showCreateModal || editingTask" class="modal-overlay px-4" (click)="closeModal()">
        <div class="modal-content max-w-sm glass" (click)="$event.stopPropagation()">
            <div class="absolute top-0 left-0 w-full h-2 gradient-primary"></div>
            <div class="p-8">
              <div class="flex items-center justify-between mb-8">
                <div>
                    <h2 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                        {{ editingTask ? 'Refine Objective' : 'New Initiative' }}
                    </h2>
                    <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Operational Parameters</p>
                </div>
                <button (click)="closeModal()" class="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2.5" stroke-linecap="round"/></svg>
                </button>
              </div>
              
              <div *ngIf="errorMessage" class="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold leading-relaxed animate-in shake-in duration-500">
                {{ errorMessage }}
              </div>

              <form (ngSubmit)="saveTask()" class="space-y-6">
                <div>
                  <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Objectives Title</label>
                  <input 
                    type="text" 
                    [(ngModel)]="taskForm.title" 
                    name="title"
                    class="input focus:ring-4" 
                    placeholder="Enter mission title..."
                    [disabled]="submitting"
                    required>
                </div>

                <div>
                  <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Brief Description</label>
                  <textarea 
                    [(ngModel)]="taskForm.description" 
                    name="description"
                    rows="4"
                    class="input focus:ring-4 !py-3 resize-none" 
                    placeholder="Provide execution details..."
                    [disabled]="submitting"
                    required></textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Classification</label>
                    <select [(ngModel)]="taskForm.category" name="category" class="input" [disabled]="submitting">
                      <option [value]="'work'">Work</option>
                      <option [value]="'personal'">Personal</option>
                      <option [value]="'urgent'">Urgent</option>
                      <option [value]="'other'">Other</option>
                    </select>
                  </div>
                  <div *ngIf="editingTask">
                    <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Current State</label>
                    <select [(ngModel)]="taskForm.status" name="status" class="input" [disabled]="submitting">
                      <option [value]="'todo'">Backlog</option>
                      <option [value]="'in_progress'">Active</option>
                      <option [value]="'done'">Verified</option>
                    </select>
                  </div>
                </div>

                <div class="pt-4">
                  <button type="submit" [disabled]="submitting" class="btn btn-primary w-full py-4 text-lg animate-in slide-in-from-bottom-2 duration-500">
                    <span class="flex items-center justify-center space-x-2">
                        <svg *ngIf="!submitting" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                        <svg *ngIf="submitting" class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>{{ submitting ? 'Deploying...' : (editingTask ? 'Apply Modifications' : 'Commit Strategy') }}</span>
                    </span>
                  </button>
                </div>
              </form>
            </div>
        </div>
      <!-- Audit Log Modal -->
      <div *ngIf="showAuditLogs" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 transition-opacity bg-slate-950/80 backdrop-blur-md" (click)="showAuditLogs = false"></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
          <div class="inline-block align-bottom bg-slate-900 border border-slate-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
            <div class="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 class="text-xl font-bold text-white flex items-center gap-2">
                <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Mission Audit Logs
              </h3>
              <button (click)="showAuditLogs = false" class="text-slate-400 hover:text-white transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="px-6 py-6 max-h-[60vh] overflow-y-auto bg-slate-900">
              <div class="space-y-3">
                <div *ngIf="auditLogs.length === 0" class="text-center py-8 text-slate-500">
                  No mission data found in the archive.
                </div>
                <div *ngFor="let log of auditLogs" class="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:border-slate-600/50 transition-all group">
                  <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center gap-3">
                      <span [class]="'px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ' + 
                        (log.action === 'CREATE' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                         log.action === 'DELETE' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                         'bg-blue-500/10 text-blue-400 border border-blue-500/20')">
                        {{log.action}}
                      </span>
                      <span class="text-slate-300 font-medium">{{log.resource}}</span>
                    </div>
                    <span class="text-xs text-slate-500 font-mono group-hover:text-slate-400 transition-colors">
                      {{log.timestamp | date:'medium'}}
                    </span>
                  </div>
                  <div class="text-sm text-slate-400 mb-2">
                    Resource ID: <code class="text-xs bg-slate-950 px-1 py-0.5 rounded">{{log.resourceId}}</code>
                  </div>
                  <div *ngIf="log.metadata" class="mt-2 pt-2 border-t border-slate-800/50">
                    <pre class="text-[10px] text-slate-500 overflow-x-auto p-2 bg-slate-950/50 rounded-lg">{{log.metadata | json}}</pre>
                  </div>
                </div>
              </div>
            </div>
            <div class="px-6 py-4 bg-slate-800/30 border-t border-slate-800 flex justify-end">
              <button (click)="showAuditLogs = false" class="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all">
                Close Archive
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  host: {
    '(window:keydown)': 'handleKeyDown($event)'
  }
})
export class DashboardComponent implements OnInit {
  currentUser: any;
  searchQuery = '';
  allTasks: Task[] = [];
  auditLogs: any[] = [];
  showAuditLogs = false;
  todoTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  doneTasks: Task[] = [];

  showCreateModal = false;
  editingTask: Task | null = null;
  isDarkMode = false;
  submitting = false;
  errorMessage = '';

  taskForm = {
    title: '',
    description: '',
    category: TaskCategory.WORK,
    status: TaskStatus.TODO
  };

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private themeService: ThemeService,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
    this.themeService.darkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.loadTasks().subscribe(tasks => {
      this.allTasks = tasks;
      this.categorizeTasksByStatus();
    });
  }

  categorizeTasksByStatus(): void {
    const query = this.searchQuery.toLowerCase();
    const filtered = this.allTasks.filter(t =>
      t.title.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query)
    );
    this.todoTasks = filtered.filter(t => t.status === 'todo');
    this.inProgressTasks = filtered.filter(t => t.status === 'in_progress');
    this.doneTasks = filtered.filter(t => t.status === 'done');
  }

  drop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const task = event.container.data[event.currentIndex];
      let newStatus: TaskStatus = TaskStatus.TODO;

      if (event.container.data === this.inProgressTasks) {
        newStatus = TaskStatus.IN_PROGRESS;
      } else if (event.container.data === this.doneTasks) {
        newStatus = TaskStatus.DONE;
      }

      this.taskService.updateTask(task.id, { status: newStatus }).subscribe();
    }
  }

  saveTask(): void {
    if (!this.taskForm.title || !this.taskForm.description) {
      this.errorMessage = 'Mission title and description are required parameters.';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    if (this.editingTask) {
      this.taskService.updateTask(this.editingTask.id, this.taskForm).subscribe({
        next: () => {
          this.submitting = false;
          this.closeModal();
          this.loadTasks();
        },
        error: (err) => {
          this.submitting = false;
          this.errorMessage = err.error?.message || 'Failed to update mission objective.';
          console.error('Update task error:', err);
        }
      });
    } else {
      const createDto: CreateTaskDto = {
        title: this.taskForm.title,
        description: this.taskForm.description,
        category: this.taskForm.category
      };
      this.taskService.createTask(createDto).subscribe({
        next: () => {
          this.submitting = false;
          this.closeModal();
          this.loadTasks();
        },
        error: (err) => {
          this.submitting = false;
          this.errorMessage = err.error?.message || 'Failed to initiate new mission.';
          console.error('Create task error:', err);
        }
      });
    }
  }

  editTask(task: Task): void {
    this.editingTask = task;
    this.taskForm = {
      title: task.title,
      description: task.description,
      category: task.category as TaskCategory,
      status: task.status as TaskStatus
    };
  }

  deleteTask(id: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(id).subscribe(() => {
        this.loadTasks();
      });
    }
  }

  closeModal(): void {
    this.showCreateModal = false;
    this.editingTask = null;
    this.submitting = false;
    this.errorMessage = '';
    this.taskForm = {
      title: '',
      description: '',
      category: TaskCategory.WORK,
      status: TaskStatus.TODO
    };
  }

  toggleTheme(): void {
    this.themeService.toggleDarkMode();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openAuditLogs(): void {
    this.showAuditLogs = true;
    this.loadAuditLogs();
  }

  loadAuditLogs(): void {
    this.taskService.getAuditLogs().subscribe({
      next: (logs) => {
        this.auditLogs = logs;
      },
      error: (err) => {
        console.error('Failed to load audit logs:', err);
      }
    });
  }

  handleKeyDown(event: KeyboardEvent): void {
    // Ignore if typing in an input or textarea
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      if (event.key === 'Escape') {
        this.closeModal();
      }
      return;
    }

    switch (event.key.toLowerCase()) {
      case 'n':
        event.preventDefault();
        this.showCreateModal = true;
        break;
      case 'f':
        event.preventDefault();
        const searchInput = document.getElementById('taskSearch');
        searchInput?.focus();
        break;
      case 'escape':
        this.closeModal();
        break;
    }
  }

  get completionPercentage(): number {
    if (this.allTasks.length === 0) return 0;
    return Math.round((this.doneTasks.length / this.allTasks.length) * 100);
  }
}
