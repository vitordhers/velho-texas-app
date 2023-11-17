import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';
import { Platform, LoadingController, IonInput } from '@ionic/angular';
import { Toast } from '../../shared/constants/toast.constant';
import { Observable, timer, of } from 'rxjs';
import { map, switchMap, debounceTime, distinctUntilChanged, catchError } from 'rxjs/operators';
import { markFormGroupTouched } from '../../shared/functions/markformgroupastouched.function';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  public loading = false;

  public passwordType = 'password';
  public passwordIcon = 'eye-off';

  public today = new Date().toISOString();
  public minDate = new Date('1 Jan 1920').toISOString();

  public monthShortNames = ['Jan', 'Fev', 'Mar',
    'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set',
    'Out', 'Nov', 'Dez'];

  public fields = {
    name: {
      field: '🤠 Nome',
      errors: {
        required: 'Esqueceu de colocar seu nome, Roy!',
        minlength: 'Seu nome deve ter pelo menos 4 letras, Roy!',
        maxlength: 'Seu nome não pode ter mais de 50 letras, Roy!'
      }
    },
    email: {
      field: '📧 E-mail',
      errors: {
        required: 'Esqueceu de informar ao xerife o seu e-mail!',
        email: 'Este e-mail não parece ser válido, abutre!',
        minlength: 'Seu e-mail deve ter pelo menos 4 caracteres, Roy!',
        maxlength: 'Seu e-mail não pode ter mais de 30 caracteres, Roy!',
        emailTaken: 'Este e-mail já foi cadastrado, vaqueiro!'
      }
    },
    password: {
      field: '🔒 Senha',
      errors: {
        required: 'Esqueceu de informar ao xerife a sua senha!',
        minlength: 'Uma senha com menos de 6 caracteres é mais fraca que uma bezerra recém-parida, Roy!',
        maxlength: 'Sua senha não deve ter mais que 30 caracteres, Roy!'
      }
    },
    cpassword: {
      field: '🔐 Confirmar Senha',
      errors: {
        required: 'Hey, coiote, esqueceu de confirmar sua senha!',
        checkPasswords: 'Suas senhas não estão batendo, abutre!'
      }
    },
    celphoneNumber: {
      field: '📱 Celular',
      errors: {
        minlength: 'Este número de celular parece ser do Wyoming, mas não do Velho Texas'
      }
    },
    birthday: {
      field: '🥳 Data de Nascimento',
      errors: {
        required: 'Esqueceu de informar ao xerife sua idade, raposa velha!'
      }
    },
    communication: {
      field: '📢 Receber promoções e novidades',
      errors: {
        atLeastOneRequired: 'Escolha pelo menos uma forma de contato, Roy!'
      }
    },
    terms: {
      field: '📄 Termos de Uso e Política de Privacidade',
      errors: {
        required: 'Este campo é obrigatório, caubói!'
      }
    }
  };

  reportedErrorFields = [];

  form: FormGroup;
  constructor(
    public platform: Platform,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl('', {
        validators: [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(50)
        ]
      }),
      email: new FormControl(null, {
        updateOn: 'change',
        validators: [
          Validators.email,
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(30)
        ],
        asyncValidators: [
          this.emailValidator()
        ]
      }),
      passwords: new FormGroup({
        password: new FormControl(null, {
          validators: [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(30)
          ]
        }),
        cpassword: new FormControl(null, {
          validators: Validators.required
        }),
      }, { validators: this.checkPasswords }),
      celphoneNumber: new FormControl('', {
        validators: [Validators.minLength(15)]
      }),
      whatsapp: new FormControl(false),
      birthday: new FormControl(null, {
        validators: [
          Validators.required,
          this.ageRangeValidator
        ]
      }),
      promo: new FormControl(false),
      communication: new FormGroup({
        mailcomm: new FormControl(true),
        wppcomm: new FormControl(true)
      }, { validators: this.atLeastOneRequired }),
      terms: new FormControl(false, {
        validators: [Validators.requiredTrue]
      }),
      recaptcha: new FormControl(null, {
        validators: [
          Validators.required,
        ]
      }),
    });

  }

  checkPasswords(group: FormGroup): { [key: string]: boolean } | null {
    if (group.get('password').value !== group.get('cpassword').value) {
      group.get('cpassword').setErrors({ checkPasswords: true });
      return { checkPasswords: true };
    }
  }

  atLeastOneRequired(group: FormGroup): { [key: string]: boolean } | null {
    const controls = group.controls;
    if (controls) {
      const theOne = Object.keys(controls).find(key => controls[key].value === true);
      if (!theOne) {
        return {
          atLeastOneRequired: true
        };
      }
    }
  }

  emailValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return timer(500).pipe(
        distinctUntilChanged(),
        switchMap((_) => {
          return this.authService.checkEmail(control.value).pipe(
            map(res => res ? { emailTaken: true } : null),
            catchError(_ => of(null)
            )
          )
        })
      );
    };
  }

  ageRangeValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (control.value !== undefined && new Date(control.value) > new Date(new Date().setDate(new Date().getDate() - 6574))) {
      return { ageRange: true };
    }
  }

  hideShowPassword(): void {
    this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
    this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
  }

  async presentLoading(): Promise<void> {
    if (this.platform.is('mobile')) {
      const loading = await this.loadingCtrl.create({
        message: 'Verificando...',
        translucent: true,
        cssClass: 'custom-class custom-loading'
      });
      return await loading.present();
    } else {
      this.loading = true;
    }
  }


  private isFormGroup(control: AbstractControl): control is FormGroup {
    return !!(control as FormGroup).controls;
  }

  private collectErrors(control: AbstractControl): [string, AbstractControl] | ValidationErrors {
    if (this.isFormGroup(control)) {
      return Object.entries(control.controls)
        .reduce(
          (acc, [key, childControl]) => {
            const childErrors = this.collectErrors(childControl);
            if (childErrors) {
              this.reportedErrorFields.push(key);
            }
            return acc;
          },
          null
        );
    } else {
      return control.errors;
    }
  }

  collectErrors2(control: AbstractControl): any | null {
    if (this.isFormGroup(control)) {
      return Object.entries(control.controls)
        .reduce(
          (acc, [key, childControl]) => {
            const childErrors = this.collectErrors2(childControl);
            if (childErrors) {
              acc = { ...acc, [key]: childErrors };
            }
            return acc;
          },
          null
        );
    } else {
      return control.errors;
    }
  }

  onSubmit(e) {
    this.form.get('recaptcha').setValue(e);
    if (this.form.valid) {
      this.authService.signUp(this.form.value).subscribe(res => {
        if (res) {
          this.router.navigate(['/usuario/painel'], { queryParams: { aoba: true } });
        }
      },
        err => {
          if (err) {
            console.log(err);
          }
        })
    } else {
      markFormGroupTouched(this.form);
      this.reportedErrorFields = [];
      this.collectErrors(this.form);
      const errors2 = this.collectErrors2(this.form);
      console.log(errors2);
      let report = '';
      if (this.platform.is('mobile')) {
        this.loadingCtrl.dismiss();
      } else {
        this.reportedErrorFields.forEach((value, index) => {
          report += `<ion-item lines="none">${this.fields[value].field}</ion-item>`;
        });

        Toast.fire({
          icon: 'error',
          title: '🙊 Macacos me mordam!',
          html: `
          <ion-title>Os Campos a seguir ainda são inválidos:</ion-title>
          <ion-list>
          ${report}
          </ion-list>`
        });
      }


    }
    this.loading = false;
    return;
  }

}
