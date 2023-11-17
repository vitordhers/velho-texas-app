import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthPageRoutingModule } from './auth-routing.module';
import { AuthPage } from './auth.page';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';
import { AuthProblemsComponent } from './auth-problems/auth-problems.component';
import { environment } from '../../environments/environment';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    AuthPageRoutingModule,
    RecaptchaV3Module
  ],
  declarations: [AuthPage, AuthProblemsComponent],
  providers: [
    { provide: RECAPTCHA_V3_SITE_KEY, useValue: environment.GOOGLE_RECAPTCHA_SITE_KEY }
  ],
  entryComponents: [AuthProblemsComponent]
})
export class AuthPageModule { }
