import { Directive, OnDestroy, OnInit, Input, HostListener, ElementRef } from '@angular/core';
import tippy, { Placement } from 'tippy.js';

@Directive({
  selector: '[appTippy]'
})
export class TooltipDirective implements OnInit, OnDestroy {
  @Input() element: HTMLDivElement | HTMLSpanElement;
  @Input() content: string | HTMLDivElement;
  @Input() placement: Placement = 'bottom';
  @Input() allowHtml = false;

  private tooltipInstance: any;
  constructor() { }

  ngOnInit() {
    this.tooltipInstance = tippy(this.element, {
      content: this.content,
      placement: this.placement,
      allowHTML: this.allowHtml,
      trigger: 'manual',
      hideOnClick: true
    });
  }

  ngOnDestroy() {
    this.tooltipInstance = null;
  }

  @HostListener('mouseenter')
  showTooltip() {
    if (this.content !== '') {
      this.tooltipInstance.show();
    }
  }

  @HostListener('mouseleave')
  hideTooltip() {
    this.tooltipInstance.hide();
  }

}
