import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';

import { APP_CONSTANTS } from '../../app.constants';
import { ItemBreakDirective } from '../item-break.directive';
import { MEDIUM_SIZE } from '../core/metrics';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    ItemBreakDirective,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, AfterViewChecked, OnDestroy {

  private initialized = false;

  private actualWidth: number = 0;

  private actualScroll: number = 0;

  // private breakPointListener: OnBreakPointChangeListener|null = null;

  private resizeCallback: ((ev: Event) => any)|null = null;

  private scrollCallback: ((ev: Event) => any)|null = null;

  public readonly app = APP_CONSTANTS;

  public isDarkMenu: boolean = false;

  public logoRight: string = '';

  @ViewChild('logo', { static: true })
  public logoElement!: ElementRef<HTMLDivElement>;

  @ViewChild('container', { static: true })
  public container!: ElementRef<HTMLScriptElement>;

  @ViewChildren(ItemBreakDirective)
  public breakPointItems!: QueryList<ItemBreakDirective>;

  public ngOnInit(): void {
    this.resizeCallback = (ev: Event) => this.onResize(window.innerWidth);
    this.scrollCallback = (ev: Event) => this.onGlobalScroll(ev);

    if (typeof window !== "undefined") {
      window.addEventListener('resize', this.resizeCallback);
      window.addEventListener('scroll', this.scrollCallback);
    }
  }

  public ngAfterViewChecked(): void {
    if (!this.initialized) {
      this.initialize();
    }
  }

  public ngOnDestroy(): void {

  }

  /**
   * Update logo right property using new width.
   * @param newWidth The new window width.
   */
  private updateLogoRight(newWidth: number) {
    if (newWidth <= MEDIUM_SIZE) {
      this.logoRight = `${(newWidth - this.logoElement.nativeElement.offsetWidth) / 2.}px`;
    }
  }

  /**
   * Initialize break point items.
   */
  private initialize() {
    this.breakPointItems.forEach(
      (item) => {
        item.setInheritedWidth();

        item.registerDataSetWidth();

        item.setSizeToZero();
      },
    );

    this.initialized = true;
  }

  private onResize(newSize: number) {
    if (newSize <= MEDIUM_SIZE && MEDIUM_SIZE < this.actualWidth) {
      // When under break point

    } else if (newSize > MEDIUM_SIZE && this.actualWidth <= MEDIUM_SIZE) {
      // When over break point
      this.logoRight = '';
    }

    this.actualWidth = window.innerWidth;

    this.updateLogoRight(newSize);
  }

  private onGlobalScroll(_: Event) {
    const scroll = window.scrollY;

    // Update the background of navigator
    this.onScrollForSection(scroll);

    this.actualScroll = scroll;
  }

  private onScrollForSection(scroll: number) {
    let position: number = 0;
    const sectionBreakPoint = this.container.nativeElement.offsetHeight;
    if (scroll <= sectionBreakPoint && sectionBreakPoint < this.actualScroll) {
      // When under break point
      //  Update items width
      position = -1;
      //  Update nav background
      this.isDarkMenu = false;
    } else if (scroll > sectionBreakPoint && this.actualScroll <= sectionBreakPoint) {
      // When over break point
      //  Update items width
      position = 1;
      //  Update nav background
      this.isDarkMenu = true;
    }

    if (window.innerWidth > MEDIUM_SIZE && position > 0) {
      // Reset real size
      this.breakPointItems.forEach((item) => item.setRealSize());
    } else if (position != 0) {
      this.breakPointItems.forEach((item) => item.setSizeToZero());
    }
  }
}
