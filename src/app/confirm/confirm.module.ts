import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConfirmPageRoutingModule } from './confirm-routing.module';
import { PasswordsInputModule } from '../shared/modules/passwords-input/passwords-input.module';

import { ConfirmPage } from './confirm.page';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';
import { environment } from '../../environments/environment';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    ConfirmPageRoutingModule,
    PasswordsInputModule,
    RecaptchaV3Module
  ],
  declarations: [ConfirmPage],
  providers: [
    { provide: RECAPTCHA_V3_SITE_KEY, useValue: environment.GOOGLE_RECAPTCHA_SITE_KEY }
  ]
})
export class ConfirmPageModule { }
