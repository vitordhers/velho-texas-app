import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RedefinepasswordPageRoutingModule } from './redefinepassword-routing.module';

import { RedefinepasswordPage } from './redefinepassword.page';
import { PasswordsInputModule } from '../shared/modules/passwords-input/passwords-input.module';
import { TooltipModule } from '../shared/modules/tooltip/tooltip.module';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';
import { environment } from '../../environments/environment';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    RedefinepasswordPageRoutingModule,
    TooltipModule,
    PasswordsInputModule,
    RecaptchaV3Module
  ],
  declarations: [RedefinepasswordPage],
  providers: [
    { provide: RECAPTCHA_V3_SITE_KEY, useValue: environment.GOOGLE_RECAPTCHA_SITE_KEY }
  ]
})
export class RedefinepasswordPageModule { }
