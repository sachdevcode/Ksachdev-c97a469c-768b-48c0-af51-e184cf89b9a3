import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Task, CreateTaskDto, UpdateTaskDto, AuditLog } from '@rbac-task-system/data';

@Injectable({
    providedIn: 'root'
})
export class TaskService {
    private apiUrl = 'http://localhost:3333/api/tasks';
    private tasksSubject = new BehaviorSubject<Task[]>([]);
    public tasks$ = this.tasksSubject.asObservable();

    constructor(private http: HttpClient) { }

    loadTasks(): Observable<Task[]> {
        return this.http.get<Task[]>(this.apiUrl).pipe(
            tap(tasks => this.tasksSubject.next(tasks))
        );
    }

    createTask(task: CreateTaskDto): Observable<Task> {
        return this.http.post<Task>(this.apiUrl, task).pipe(
            tap(() => this.loadTasks().subscribe())
        );
    }

    updateTask(id: string, task: UpdateTaskDto): Observable<Task> {
        return this.http.put<Task>(`${this.apiUrl}/${id}`, task).pipe(
            tap(() => this.loadTasks().subscribe())
        );
    }

    deleteTask(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
            tap(() => this.loadTasks().subscribe())
        );
    }

    getAuditLogs(): Observable<AuditLog[]> {
        return this.http.get<AuditLog[]>(`${this.apiUrl}/audit-log`);
    }

    getTasks(): Task[] {
        return this.tasksSubject.value;
    }
}
