// dark-mode.service.ts
/*
import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root' // Makes it available app-wide
})
export class DarkModeService {
  darkMode = signal<boolean>(
    JSON.parse(window.localStorage.getItem('darkMode') ?? 'false')
  );

  constructor() {
    effect(() => {
      window.localStorage.setItem('darkMode', JSON.stringify(this.darkMode()));
    });
  }

  toggle() {
    this.darkMode.update(v => !v);
  }
}
  */

import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DarkModeService {
  darkMode = signal<boolean>(
    JSON.parse(window.localStorage.getItem('darkMode') ?? 'false')
  );

  constructor() {
    // LocalStorage update + HTML tag frissítése
    effect(() => {
      const isDark = this.darkMode();
      window.localStorage.setItem('darkMode', JSON.stringify(isDark));

      // Ez a LÉNYEG: osztály beállítása <html>-en
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

