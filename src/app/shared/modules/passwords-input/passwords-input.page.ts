import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-passwords-input',
  templateUrl: './passwords-input.page.html',
  styleUrls: ['./passwords-input.page.scss'],
})
export class PasswordsInputPage implements OnInit {
  @Output() passwordChange = new EventEmitter<FormGroup>();
  public form: FormGroup;
  public passwordType = 'password';
  public passwordIcon = 'eye-off';
  public fields = {
    password: {
      field: '🔒 Senha',
      errors: {
        required: 'Esqueceu de informar ao xerife a sua senha!',
        minlength: 'Uma senha com menos de 6 caracteres é mais fraca que uma bezerra recém-parida, Roy!',
        maxlength: 'Sua senha não deve ter mais que 25 caracteres, Roy!'
      }
    },
    cpassword: {
      field: '🔐 Confirmar Senha',
      errors: {
        required: 'Hey, coiote, esqueceu de confirmar sua senha!',
        checkPasswords: 'Suas senhas não estão batendo, abutre!'
      }
    }
  };
  constructor() { }

  ngOnInit() {
    this.form = new FormGroup({
      passwords: new FormGroup({
        password: new FormControl(null, {
          validators: [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(25)
          ]
        }),
        cpassword: new FormControl(null, {
          validators: Validators.required
        }),
      }, { validators: this.checkPasswords })
    });

    this.passwordChange.emit(this.form);

    this.form.valueChanges.subscribe(_ => {
      this.passwordChange.emit(this.form);
    });
  }

  hideShowPassword(): void {
    this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
    this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
  }

  checkPasswords(group: FormGroup): { [key: string]: boolean } | null {
    if (group.get('password').value !== group.get('cpassword').value) {
      group.get('cpassword').setErrors({ checkPasswords: true });
      return { checkPasswords: true };
    }
  }


}
