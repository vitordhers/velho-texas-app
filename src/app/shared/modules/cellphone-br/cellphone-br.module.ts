import { NgModule } from '@angular/core';

import { CellphoneBrDirective } from './cellphone-br.directive';

@NgModule({
    declarations: [
        CellphoneBrDirective
    ],
    exports: [
        CellphoneBrDirective
    ]
})
export class CellphoneBrModule { }
