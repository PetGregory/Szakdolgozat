import { Component } from '@angular/core';
import { DarkModeService } from '../../components/dark-mode-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-light-button',
  imports: [CommonModule],
  templateUrl: './light-button.component.html',
  styleUrl: './light-button.component.css'
})
export class LightButtonComponent {

     constructor(public darkModeService: DarkModeService) {}
    toggleDarkMode() {
      this.darkModeService.toggle();
    }
}
