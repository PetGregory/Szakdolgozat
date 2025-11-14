

import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class DarkModeService {

  darkMode = signal<boolean>(
    JSON.parse(window.localStorage.getItem('darkMode') ?? 'false')
  );

  constructor() {

    effect(() => {

      const isDark = this.darkMode();

      window.localStorage.setItem('darkMode', JSON.stringify(isDark));

      const html = document.documentElement;

      if (isDark) {
        html.classList.add('dark');
      } else {

        html.classList.remove('dark');
      }
    });
  }

  toggle() {

    this.darkMode.update(v => !v);
  }

  isDark() {

    return this.darkMode();
  }
}
