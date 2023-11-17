import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { Toast } from '../shared/constants/toast.constant';


@Component({
  selector: 'app-redefinepassword',
  templateUrl: './redefinepassword.page.html',
  styleUrls: ['./redefinepassword.page.scss'],
})
export class RedefinepasswordPage implements OnInit {
  public dataLoaded = false;
  public tokenExpired: boolean;
  public isLoading = true;

  public form: FormGroup;
  private token;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private recaptchaV3Service: ReCaptchaV3Service
  ) { }

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.router.navigateByUrl('/entrar');
    }
    this.form = new FormGroup({
      passwords: new FormGroup({}),
      recaptcha: new FormControl(null)
    });
  }

  ionViewWillEnter() {
    this.authService.validateEmailToken(this.token).subscribe(
      response => {
        this.dataLoaded = true;
        if (response.valid) {
          this.tokenExpired = false;
        }
      },
      err => {
        this.dataLoaded = true;
        this.tokenExpired = true;
      }
    );
  }
  redefineUpdate(form: FormGroup) {
    (this.form.get('passwords') as FormGroup).setControl('passwords', form);
  }

  async redefinePassword() {
    const hash = await this.recaptchaV3Service.execute('login').toPromise();
    this.form.get('recaptcha').setValue(hash);
    if (this.form.valid) {
      this.authService.redefinePassword(this.token, this.form.get('passwords').value.passwords, hash).subscribe(
        response => {
          if (response.success) {
            Toast.fire({
              title: '🤠 Deu bão!',
              text: 'Senha redefinida com sucesso!',
              icon: 'success'
            });
            this.router.navigateByUrl('/entrar');
          } else {
            Toast.fire({
              title: '🤕 Oops...',
              text: 'Não foi possível redefinir sua senha.',
              icon: 'error'
            });
          }
        },
        err => {
          Toast.fire({
            title: '🤕 Oops...',
            text: 'Não foi possível redefinir sua senha.',
            icon: 'error'
          });
        });
    }
  }

}
