import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[item-break]',
  standalone: true
})
export class ItemBreakDirective {

  constructor(
    private readonly el: ElementRef<HTMLElement>,
  ) {}

  /**
   * Set size to 'inherit'.
   */
  public setInheritedWidth() {
    this.el.nativeElement.style.width = 'inherit';
  }

  /** Save the initial width */
  public registerDataSetWidth() {
    if (this.el.nativeElement.dataset) {
      (this.el.nativeElement.dataset as any).normalWidth = (this.el.nativeElement.children[0] as HTMLElement).offsetWidth;
    }
  }

  /**
   * Set size of element to 0px;
   */
  public setSizeToZero() {
    this.el.nativeElement.style.width = '0px';
  }

  /**
   * Set size using real size computed.
   */
  public setRealSize() {
    const width = `${(this.el.nativeElement.dataset as any).normalWidth}px`;

    this.el.nativeElement.style.width = width;
  }

}
