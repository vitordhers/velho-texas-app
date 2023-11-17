import { Directive, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
    selector: '[formControlName][appCreditCard]'
})
export class CreditCardDirective {
    @Input() appCreditCard: string;

    constructor(public ngControl: NgControl) { }

    @HostListener('ngModelChange', ['$event'])
    onModelChange(event: string) {
        this.onInputChange(event, this.appCreditCard);
    }

    onInputChange(event: string, creditCardBanner: string) {
        let newVal = event.replace(/\D/g, '');

        if (newVal.length === 0) {
            newVal = '';
        } else if (newVal.length <= 4) {
            newVal = newVal.replace(/^(\d{0,4})/, '$1');
        } else if (newVal.length <= 8 && creditCardBanner !== 'aura') {
            newVal = newVal.replace(/^(\d{0,4})(\d{0,4})/, '$1  $2');
        } else if (newVal.length <= 10 && (creditCardBanner === 'amex' || creditCardBanner === 'diners' || creditCardBanner === 'jcb16')) {
            newVal = newVal.replace(/^(\d{0,4})(\d{0,6})/, '$1  $2');
        } else if (newVal.length <= 12 && creditCardBanner !== 'amex' && creditCardBanner !== 'diners' && creditCardBanner !== 'aura') {
            newVal = newVal.replace(/^(\d{0,4})(\d{0,4})(\d{0,4})/, '$1  $2  $3');
        } else if (newVal.length <= 14 && creditCardBanner === 'diners') {
            newVal = newVal.replace(/^(\d{0,4})(\d{0,6})(\d{0,4})/, '$1  $2  $3');
        } else if (newVal.length <= 15 && (creditCardBanner === 'amex' || creditCardBanner === 'jcb15')) {
            newVal = newVal.replace(/^(\d{0,4})(\d{0,6})(\d{0,5})/, '$1  $2  $3');
        } else if (newVal.length <= 16 && creditCardBanner !== 'amex' && creditCardBanner !== 'diners' && creditCardBanner !== 'aura') {
            newVal = newVal.replace(/^(\d{0,4})(\d{0,4})(\d{0,4})(\d{0,4})/, '$1  $2  $3  $4');
        } else if (newVal.length <= 20 && creditCardBanner === 'aura') {
            newVal = newVal.replace(/^(\d{0,20})/, '$1');
        }

        this.ngControl.valueAccessor.writeValue(newVal);
    }

}
