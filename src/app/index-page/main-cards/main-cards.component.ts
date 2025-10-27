import { Component } from '@angular/core';
import { DarkModeService } from '../../components/dark-mode-service';

@Component({
  selector: 'app-main-cards',
  imports: [],
  templateUrl: './main-cards.component.html',
  styleUrl: './main-cards.component.css'
})
export class MainCardsComponent {
   constructor(public darkModeService: DarkModeService) {}

}
