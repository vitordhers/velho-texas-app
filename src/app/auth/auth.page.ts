import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoadingController, Platform, MenuController, ModalController } from '@ionic/angular';
import { environment } from '../../environments/environment';
import { Toast } from '../shared/constants/toast.constant';
import { markFormGroupTouched } from '../shared/functions/markformgroupastouched.function';
import { Credentials } from './models/credentials.model';
import { AuthProblemsComponent } from './auth-problems/auth-problems.component';
import { ReCaptchaV3Service } from 'ng-recaptcha';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  loadingPage = false;
  loading = false;
  returnUrl: string;
  passwordType = 'password';
  passwordIcon = 'eye-off';

  apiUrl = environment.api_base_url;
  form: FormGroup;
  validateEvent = 'submit';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private menuCtrl: MenuController,
    public platform: Platform,
    private modalCtrl: ModalController,
    private recaptchaV3Service: ReCaptchaV3Service
  ) { }

  ngOnInit() {
    this.menuCtrl.close();
    if (
      this.route.snapshot.queryParamMap.get('accessToken') &&
      this.route.snapshot.queryParamMap.get('refreshToken') &&
      this.route.snapshot.queryParamMap.get('localId') &&
      this.route.snapshot.queryParamMap.get('expiresIn')
    ) {
      const userData = new Credentials(
        this.route.snapshot.queryParamMap.get('localId'),
        parseInt(this.route.snapshot.queryParamMap.get('expiresIn'), 10),
        this.route.snapshot.queryParamMap.get('accessToken'),
        this.route.snapshot.queryParamMap.get('refreshToken')
      );
      this.loadingPage = true;
      this.authService.setUserData(userData);

      this.router.navigateByUrl('/usuario/painel');
    }

    this.form = new FormGroup({
      email: new FormControl('', {
        validators: [
          Validators.required,
          Validators.email,
          Validators.minLength(6),
          Validators.maxLength(30)
        ]
      }),
      password: new FormControl(null, {
        validators: [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(30)
        ]
      }),
      recaptcha: new FormControl(null, {
        validators: [
          Validators.required,
        ]
      }),
    });

    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/usuario';
  }

  ionViewDidLeave() {
    this.dismissLoaders();
  }

  dismissLoaders() {
    this.loadingPage = false;
    if (this.platform.is('mobile')) {
      this.loadingCtrl.dismiss();
    } else {
      this.loading = false;
    }
  }

  async onLogin() {
    const e = await this.recaptchaV3Service.execute('homepage').toPromise();
    this.form.get('recaptcha').setValue(e);
    if (this.form.valid) {
      if (this.platform.is('mobile')) {
        const loading = await this.loadingCtrl.create({
          message: 'Verificando...',
          translucent: true,
        });
        await loading.present();
      } else {
        this.loading = true;
      }

      this.authService.signIn(this.form.value).subscribe((res) => {
        this.router.navigateByUrl(this.returnUrl);
        this.form.reset();
      },
        (_) => {
          Toast.fire({
            icon: 'error',
            title: '🙊 Macacos me mordam!',
            html: `
            <ion-title>O xerife diz que suas credenciais não batem!</ion-title>`
          });
          this.dismissLoaders();
        });
    } else {
      markFormGroupTouched(this.form);
    }
  }

  hideShowPassword() {
    this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
    this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
  }

  presentModal() {
    const modal = this.modalCtrl.create({
      component: AuthProblemsComponent,
      cssClass: 'modal'
    }).then(modalEl => modalEl.present());
  }
}
