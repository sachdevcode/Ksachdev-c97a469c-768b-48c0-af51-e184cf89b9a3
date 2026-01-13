import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private darkModeSubject = new BehaviorSubject<boolean>(false);
    public darkMode$ = this.darkModeSubject.asObservable();

    constructor() {
        const savedTheme = localStorage.getItem('theme');
        const isDark = savedTheme === 'dark' ||
            (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
        this.setDarkMode(isDark);
    }

    toggleDarkMode(): void {
        this.setDarkMode(!this.darkModeSubject.value);
    }

    setDarkMode(isDark: boolean): void {
        this.darkModeSubject.next(isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');

        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    isDarkMode(): boolean {
        return this.darkModeSubject.value;
    }
}
