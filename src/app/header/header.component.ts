import { Component } from '@angular/core';
import { APP_CONSTANTS } from '../../app.constants';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  public readonly app = APP_CONSTANTS;
}
