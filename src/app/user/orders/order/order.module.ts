import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { OrderPageRoutingModule } from './order-routing.module';
import { OrderPage } from './order.page';
import { ViewOrderComponentModule } from '../view-order/view-order.module';
import { MatStepperModule } from '@angular/material/stepper';
import { registerLocaleData } from '@angular/common';
import localeBr from '@angular/common/locales/pt';
registerLocaleData(localeBr, 'br');

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    OrderPageRoutingModule,
    MatStepperModule,
    ViewOrderComponentModule
  ],
  declarations: [OrderPage],
  providers: [{ provide: LOCALE_ID, useValue: 'br' }]
})
export class OrderPageModule { }
