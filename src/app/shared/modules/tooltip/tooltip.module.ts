import { TooltipDirective } from './tooltip.directive';
import { NgModule } from '@angular/core';

@NgModule({
    declarations: [
        TooltipDirective
    ],
    exports: [
        TooltipDirective
    ]
})
export class TooltipModule { }
