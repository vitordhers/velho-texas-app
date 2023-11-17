import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { AddressPageModule } from '../user/address/address.module';

import { IonicModule } from '@ionic/angular';

import { CartPageRoutingModule } from './cart-routing.module';

import { CartPage } from './cart.page';
import { InputRestrictionDirective } from '../shared/directives/input-restriction.directive';
import { CreditCardDirective } from '../shared/directives/credit-card.directive';
import { CpfDirective } from '../shared/directives/cpf.directive';
import { CreditCardNoPipe } from './creditcard-no.pipe';
import { CartContentModule } from '../shared/components/cart-content/cart-content.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    CartPageRoutingModule,
    MatExpansionModule,
    AddressPageModule,
    CartContentModule
  ],
  declarations: [
    CartPage,
    InputRestrictionDirective,
    CreditCardDirective,
    CpfDirective,
    CreditCardNoPipe
  ]
})
export class CartPageModule { }
