import { Component } from '@angular/core';
import { DarkModeService } from '../dark-mode-service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
constructor(public darkModeService: DarkModeService) {}
}
