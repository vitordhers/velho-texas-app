import { NgModule, Directive, ElementRef } from '@angular/core';
@Directive({
    selector: '[appScrollbarTheme]'
})
export class ScrollbarThemeDirective {
    constructor(el: ElementRef) {
        const stylesheet = `
        ::-webkit-scrollbar {
            width: 5px;
        }

        ::-webkit-scrollbar-track {
            background: #fff;
        }

        ::-webkit-scrollbar-thumb {
            background-color: #5a1f01;
            outline: 1px solid #fff;
        }
    `;

        const styleElmt = el.nativeElement.shadowRoot.querySelector('style');

        if (styleElmt) {
            styleElmt.append(stylesheet);
        } else {
            const barStyle = document.createElement('style');
            barStyle.append(stylesheet);
            el.nativeElement.shadowRoot.appendChild(barStyle);
        }

    }
}


@NgModule({
    declarations: [ScrollbarThemeDirective],
    exports: [ScrollbarThemeDirective]
})
export class ScrollbarThemeModule { }
