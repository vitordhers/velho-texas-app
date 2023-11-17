import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { OrdersPageRoutingModule } from './orders-routing.module';
import { OrdersPage } from './orders.page';
import { ViewOrderComponent } from './view-order/view-order.component';
import { TooltipModule } from '../../shared/modules/tooltip/tooltip.module';
import { registerLocaleData } from '@angular/common';
import localeBr from '@angular/common/locales/pt';
import { ViewOrderComponentModule } from './view-order/view-order.module';
registerLocaleData(localeBr, 'br');

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    OrdersPageRoutingModule,
    TooltipModule,
    ViewOrderComponentModule
  ],
  declarations: [OrdersPage],
  entryComponents: [ViewOrderComponent],
  providers: [{ provide: LOCALE_ID, useValue: 'br' }]
})
export class OrdersPageModule { }
