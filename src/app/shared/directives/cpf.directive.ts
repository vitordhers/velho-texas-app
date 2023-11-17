import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
    selector: '[formControlName][appCpf]'
})
export class CpfDirective {

    constructor(public ngControl: NgControl) { }

    @HostListener('ngModelChange', ['$event'])
    onModelChange(event) {
        this.onInputChange(event);
    }

    @HostListener('keydown.backspace', ['$event'])
    keydownBackspace(event) {
        this.onInputChange(event.target.value);
    }

    onInputChange(event) {
        let newVal = event.replace(/\D/g, '');

        if (newVal.length === 0) {
            newVal = '';
        } else if (newVal.length <= 3) {
            newVal = newVal.replace(/^(\d{0,3})/, '$1');
        } else if (newVal.length <= 4) {
            newVal = newVal.replace(/^(\d{0,3})/, '$1.');
        } else if (newVal.length <= 6) {
            newVal = newVal.replace(/^(\d{0,3})(\d{0,3})/, '$1.$2');
        } else if (newVal.length <= 7) {
            newVal = newVal.replace(/^(\d{0,3})(\d{0,3})/, '$1.$2.');
        } else if (newVal.length <= 9) {
            newVal = newVal.replace(/^(\d{0,3})(\d{0,3})(\d{0,3})/, '$1.$2.$3');
        } else {
            newVal = newVal.substring(0, 11);
            newVal = newVal.replace(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})/, '$1.$2.$3-$4');
        }
        this.ngControl.valueAccessor.writeValue(newVal);
    }

}
