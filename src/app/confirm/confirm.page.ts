import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Platform } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { UserStatus } from '../shared/enums/user-status.enum';
import { Toast } from '../shared/constants/toast.constant';
import { ReCaptchaV3Service } from 'ng-recaptcha';


@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.page.html',
  styleUrls: ['./confirm.page.scss'],
})
export class ConfirmPage implements OnInit {
  public dataLoaded = false;
  public userStatus = UserStatus;
  public currentStatus: UserStatus;
  public confirmed: boolean;
  public password = true;
  public resultText: string;

  public form: FormGroup;
  private token: string;
  public isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    public platform: Platform,
    private recaptchaV3Service: ReCaptchaV3Service
  ) { }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    this.form = new FormGroup({
      passwords: new FormGroup({}),
      recaptcha: new FormControl(null)
    });
  }

  async ionViewWillEnter() {
    if (this.token) {
      const hash = await this.recaptchaV3Service.execute('login').toPromise();
      this.authService.confirmEmail(this.token, hash).subscribe(result => {
        this.dataLoaded = true;
        this.confirmed = result.confirmation;
        this.currentStatus = result.status;
        this.password = result.password;
        this.resultText = `🤠 E-mail ${result.email} confirmado com sucesso, rapaiz!`;
      }, this.handleErrors.bind(this));
    }
  }

  passwordUpdate(form: FormGroup) {
    (this.form.get('passwords') as FormGroup).setControl('passwords', form);
  }

  async confirmEmailAndPassword() {
    this.isLoading = true;
    const hash = await this.recaptchaV3Service.execute('login').toPromise();
    this.authService.confirmEmail(this.token, hash, this.form.get('passwords').value.passwords).subscribe(
      result => {
        this.confirmed = result.confirmation;
        this.currentStatus = result.status;
        this.password = result.password;
        this.resultText = `🤠 E-mail ${result.email} confirmado com sucesso, rapaiz!`;
        this.isLoading = false;
      }, this.handleErrors.bind(this)
    );
  }

  handleErrors(err) {
    if (err.status === 401) {
      this.confirmed = true;
      this.resultText = 'Token expirado ou já utilizado. Para solicitar um novo e-mail de confirmação, faça Login > Vá até a aba Configurações > clique no botão Reenviar e-mail de confirmação. Ou, caso não lembre seus dados, vá em Entrar > clique no botão "🤔 Problemas para entrar?".';
    } else {
      Toast.fire({
        title: '🤕 Oops...',
        text: err.error.message,
        icon: 'error',
        heightAuto: false
      });
      this.confirmed = true;
      this.resultText = err.error.message;
    }
    this.isLoading = false;
  }

}
