import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';

import { HomePage } from './home.page';
import { FooterModule } from '../shared/modules/footer/footer.module';
import { ProductModule } from '../products/product/product.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    MatMenuModule,
    ProductModule,
    FooterModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePage
      }
    ])
  ],
  declarations: [HomePage]
})
export class HomePageModule { }
