import { PipeTransform, Pipe } from '@angular/core';

@Pipe({
    name: 'creditFill'
})
export class CreditCardNoPipe implements PipeTransform {
    transform(value: string, option: string | number) {
        let v: string;

        if (typeof option === 'string') {
            if (value === '**** **** **** ****') { return '**** **** **** ****'; }
            v = value.replace(/\D/g, '');

            if (option === 'diners') {
                v = v.replace(/^(\d{0,4})(\d{0,6})(\d{0,4})/, this.replacerDiners);
            } else if (option === 'amex') {
                v = v.replace(/^(\d{0,4})(\d{0,6})(\d{0,5})/, this.replacerAmex);
            } else if (option === 'aura') {
                v = v.replace(/^(\d{0,20})/, (x) => x + '*'.repeat(20 - x.length));
            } else {
                v = v.replace(/^(\d{0,4})(\d{0,4})(\d{0,4})(\d{0,4})/, this.replacer);
            }

        } else {

        }

        return v;
    }

    replacer(match, p1, p2, p3, p4) {
        const result: string[] = [];
        const pool = [p1, p2, p3, p4];
        pool.forEach((el, i) => {
            result[i] = (el.length === 4) ? el : el + '*'.repeat(4 - el.length);
        });
        return result.join('  ');
    }
    replacerDiners(match, p1, p2, p3) {
        const result: string[] = [];
        result[0] = (p1.length === 4) ? p1 : p1 + '*'.repeat(4 - p1.length);
        result[1] = (p2.length === 6) ? p2 : p2 + '*'.repeat(6 - p2.length);
        result[2] = (p3.length === 4) ? p3 : p3 + '*'.repeat(4 - p3.length);
        return result.join('  ');
    }
    replacerAmex(match, p1, p2, p3) {
        const result: string[] = [];
        result[0] = (p1.length === 4) ? p1 : p1 + '*'.repeat(4 - p1.length);
        result[1] = (p2.length === 6) ? p2 : p2 + '*'.repeat(6 - p2.length);
        result[2] = (p3.length === 5) ? p3 : p3 + '*'.repeat(5 - p3.length);
        return result.join('  ');
    }
}