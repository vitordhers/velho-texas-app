import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'find' })
export class FindPipe implements PipeTransform {
    transform(value: string, array: { _id: string, label: string, quantity: number }[]): string {
        if (array.length) {
            const result = array.find(filter => filter._id === value);
            return result.label;
        } else {
            return '';
        }

    }
}
