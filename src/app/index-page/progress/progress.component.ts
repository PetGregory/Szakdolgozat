

import { Component } from '@angular/core';

import { DarkModeService } from '../../components/dark-mode-service';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress',
  imports: [CommonModule],
  templateUrl: './progress.component.html',
  styleUrl: './progress.component.css'
})

export class ProgressComponent {

  constructor(public darkModeService: DarkModeService) {}

}
