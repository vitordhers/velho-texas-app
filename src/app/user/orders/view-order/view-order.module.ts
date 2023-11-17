import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ViewOrderComponent } from './view-order.component';
import { MatStepperModule } from '@angular/material/stepper';
import { TooltipModule } from '../../../shared/modules/tooltip/tooltip.module';

@NgModule({
    imports: [
        RouterModule.forChild(
            [{
                path: '',
                component: ViewOrderComponent
            }]
        ),
        CommonModule,
        IonicModule,
        TooltipModule,
        MatStepperModule
    ],
    declarations: [ViewOrderComponent],
    exports: [ViewOrderComponent]
})
export class ViewOrderComponentModule { }
