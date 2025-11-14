

import { Component, HostBinding } from '@angular/core';

import { CommonModule } from '@angular/common';

import { RouterOutlet } from '@angular/router';

import { DarkModeService } from './components/dark-mode-service';

import { NavbarComponent } from './components/navbar/navbar.component';

import { LightButtonComponent } from './dark/light-button/light-button.component';

import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    LightButtonComponent,
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styles: [``],
})

export class AppComponent {

  constructor(public darkModeService: DarkModeService) {}

  @HostBinding('class.dark') get mode() {

    return this.darkModeService.darkMode();
  }
}
