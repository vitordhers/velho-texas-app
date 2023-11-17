import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';


@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent implements OnInit {
  @Input() change: boolean;


  public passwordType = 'password';
  public passwordIcon = 'eye-off';

  public passwords: FormGroup;
  constructor(
    private modalCtrl: ModalController,
    private authService: AuthService) {
  }

  ngOnInit() {

    this.passwords = new FormGroup({
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
    }, { validators: this.checkPasswords });

    if (this.change) {
      this.passwords.addControl('oldPassword',
        new FormControl(null, {
          validators: [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(30)
          ]
        })
      );
    }
  }

  dismissModal() {
    this.modalCtrl.dismiss(null, 'cancel');
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
    return null;
  }

}
