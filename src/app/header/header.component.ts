import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';

import { APP_CONSTANTS } from '../../app.constants';
import { ItemBreakDirective } from '../item-break.directive';
import { MEDIUM_SIZE } from '../core/metrics';


const SHORT_DURATION = 250;


type SideMenu = {
  overlay: HTMLDivElement|null;
  isOpen: boolean;
};


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

  private clickCallback: ((ev: Event) => any)|null = null;

  public readonly app = APP_CONSTANTS;

  public isDarkMenu: boolean = false;

  public languageMenu = {
    height: '',
    isOpen: false,
  };

  public sideMenu: SideMenu = {
    overlay: null,
    isOpen: false,
  }

  public logoRight: string = '';

  public contentOpacity: number|undefined = undefined;

  @ViewChild('logo', { static: true })
  public logoElement!: ElementRef<HTMLDivElement>;

  @ViewChild('container', { static: true })
  public container!: ElementRef<HTMLScriptElement>;

  @ViewChild('contentTop', { static: true })
  public header!: ElementRef<HTMLScriptElement>;

  @ViewChild('navBar', { static: true })
  public navBar!: ElementRef<HTMLScriptElement>;

  @ViewChild('drawer', { static: true })
  public drawer!: ElementRef<HTMLScriptElement>;

  @ViewChildren(ItemBreakDirective)
  public breakPointItems!: QueryList<ItemBreakDirective>;

  public ngOnInit(): void {
    if (typeof document !== 'undefined') {
      const overlay = document.createElement('div');
      overlay.classList.add('aw-layout-overlay');
      overlay.style.width = '0';

      overlay.addEventListener('click', () => {
        this.closeSideMenu();
      });
      // Insert overlay element
      this.drawer.nativeElement.before(overlay);

      this.sideMenu.overlay = overlay;
    }

    this.resizeCallback = (ev: Event) => this.onResize(window.innerWidth);
    this.scrollCallback = (ev: Event) => this.onGlobalScroll(ev);
    this.clickCallback = (_: Event) => {
      // Close the menu
      this.languageMenu.isOpen = false;
      this.languageMenu.height = '';
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.resizeCallback);
      window.addEventListener('scroll', this.scrollCallback);
      window.addEventListener('click', this.clickCallback)
    }
  }

  public ngAfterViewChecked(): void {
    if (!this.initialized) {
      this.initialize();
    }
  }

  public ngOnDestroy(): void {
    if (this.sideMenu.overlay) {
      this.sideMenu.overlay.remove()
    }

    if (typeof window !== "undefined") {
      window.removeEventListener('resize', this.resizeCallback!);
      window.removeEventListener('scroll', this.scrollCallback!);
      window.removeEventListener('click', this.clickCallback!)
    }
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

    if (typeof window !== 'undefined') {
      this.updateLogoRight(window.innerWidth);
    }

    this.initialized = true;
  }

  private onResize(newSize: number) {
    if (newSize <= MEDIUM_SIZE && MEDIUM_SIZE < this.actualWidth) {
      // When under break point

    } else if (newSize > MEDIUM_SIZE && this.actualWidth <= MEDIUM_SIZE) {
      // When over break point
      this.logoRight = '';
      this.closeSideMenu();
    }

    this.actualWidth = window.innerWidth;

    this.updateLogoRight(newSize);
  }

  private onGlobalScroll(_: Event) {
    const scroll = window.scrollY;

    // Update the background of navigator
    this.onScrollForSection(scroll);
    // Update content opacity according to scroll position
    this.onScrollForSectionContent(scroll);

    this.actualScroll = scroll;
  }

  /**
   * Update view according to current scroll position.
   * @param scroll The current Y scroll position.
   */
  private onScrollForSection(scroll: number) {
    let position: number = 0;
    const sectionBreakPoint = this.container.nativeElement.offsetHeight
      - this.navBar.nativeElement.offsetHeight;
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

  /**
   * Compute elements opacity according to screen size and current scroll position.
   * @param scroll The current Y scroll position.
   */
  private onScrollForSectionContent(scroll: number) {
    if (window.innerWidth > MEDIUM_SIZE) {
      const currentPosition = scroll;
      const headerScrollTop = this.header.nativeElement.getBoundingClientRect().top + scroll;

      const breakPoint = headerScrollTop - this.navBar.nativeElement.offsetHeight;

      if (breakPoint <= currentPosition && currentPosition < headerScrollTop) {
        this.contentOpacity = 1 - (currentPosition - breakPoint) / (headerScrollTop - breakPoint);
      } else if (currentPosition < breakPoint) {
        this.contentOpacity = undefined;
      } else {
        this.contentOpacity = 0;
      }
    } else {
      this.contentOpacity = undefined;
    }
  }

  /**
   * Callback called when user click on language menu.
   */
  public toggleLanguageMenu(ev: Event) {
    this.languageMenu.isOpen = !this.languageMenu.isOpen;

    if (this.languageMenu.isOpen) {
      // Calculate the normal height of the parent
      let height = 0;
      (ev.target as HTMLElement).parentElement?.querySelectorAll('li').forEach(
        (listItem) => {
          height += listItem.offsetHeight;
        }
      );

      this.languageMenu.height = `${height}px`;
    } else {
      this.languageMenu.height = '0px';
    }

    ev.stopPropagation();
  }

  public closeSideMenu() {
    this.sideMenu.isOpen = false;

    setTimeout(
      () => {
        this.sideMenu.overlay!.style.width = '0';
        document.body.style.overflow = 'visible';
      },
      SHORT_DURATION,
    );
  }

  public openSideMenu() {
    this.sideMenu.isOpen = true;
    this.sideMenu.overlay!.style.width = '100%';
    document.body.style.overflow = 'hidden';
  }
}
