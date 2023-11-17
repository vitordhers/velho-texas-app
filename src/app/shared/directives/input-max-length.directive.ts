import {
    AfterViewInit, Directive, ElementRef, HostListener, Input, OnInit, Renderer2, Optional, OnDestroy
} from '@angular/core';
import { NgModel } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
    selector: '[appInputMaxLength]'
})
export class InputMaxLengthDirective implements OnInit, AfterViewInit, OnDestroy {
    @Input() appInputMaxLength: number;
    private div: HTMLDivElement;
    private destroyed$ = new Subject();

    constructor(
        private el: ElementRef,
        private renderer: Renderer2,
        @Optional() private ngModel: NgModel,
    ) { }

    @HostListener('ion-input', ['$event']) onChange(event) {
        if (!this.ngModel) {
            this.update(event.target.value.length);
        }
    }

    ngOnInit() {
        this.renderer.setAttribute(this.el.nativeElement, 'maxLength', this.appInputMaxLength.toString());
        if (this.ngModel) {
            this.ngModel.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(value => {
                this.update(value.length);
            });
        }
    }

    ngAfterViewInit() {
        this.div = this.renderer.createElement('span');
        this.div.classList.add('count');
        this.div.setAttribute('slot', 'end');
        this.renderer.insertBefore(this.el.nativeElement.parentNode, this.div, this.el.nativeElement.nextSibling);
        this.update(this.el.nativeElement.value.length);
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
        if (this.div) {
            this.div.remove();
        }
    }

    private update(length: number) {
        this.renderer.setProperty(this.div, 'innerText', `${length}/${this.appInputMaxLength}`);
    }
}
