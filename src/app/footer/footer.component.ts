import { Component } from '@angular/core';

import { APP_CONSTANTS } from '../../app.constants';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  public readonly app = APP_CONSTANTS;
}
