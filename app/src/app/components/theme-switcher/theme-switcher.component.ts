import { Component, signal, effect, inject, DOCUMENT } from '@angular/core';

export type ThemeType = 'dark' | 'light';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  templateUrl: './theme-switcher.component.html',
  styleUrl: './theme-switcher.component.css'
})
export class ThemeSwitcherComponent {
  private readonly document = inject(DOCUMENT);

  // Reactive state management using Angular Signals
  readonly currentTheme = signal<ThemeType>('dark');

  constructor() {
    // Automatically updates the html attribute whenever currentTheme changes
    effect(() => {
      this.document.documentElement.setAttribute('data-theme', this.currentTheme());
    });
  }

  switchTheme(): void {
    this.currentTheme.update((theme) => (theme === 'dark' ? 'light' : 'dark'));
  }
}