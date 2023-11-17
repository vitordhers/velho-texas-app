import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductsPageRoutingModule } from './products-routing.module';

import { ProductsPage } from './products.page';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FindPipe } from './pipes/find.pipe';
import { ProductModule } from './product/product.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProductsPageRoutingModule,
    ProductModule,
    MatSidenavModule,
    MatMenuModule,
    MatExpansionModule,
    MatIconModule
  ],
  declarations: [
    ProductsPage,
    FindPipe
  ]
})
export class ProductsPageModule { }
