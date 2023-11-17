import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormGroup, FormControl, Validators, AsyncValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable, timer } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';


@Component({
  selector: 'app-change-email',
  templateUrl: './change-email.component.html',
  styleUrls: ['./change-email.component.scss'],
})
export class ChangeEmailComponent implements OnInit {

  public form: FormGroup;
  constructor(
    private modalCtrl: ModalController,
    private authService: AuthService) {
  }

  ngOnInit() {
    this.form = new FormGroup({
      email: new FormControl(null, {
        validators: [
          Validators.email,
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(30)
        ],
        asyncValidators: [
          this.emailValidator()
        ]
      })
    });
  }

  dismissModal() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  emailValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return timer(500).pipe(
        switchMap((_) => {
          return this.authService.checkEmail(control.value).pipe(
            map(res => {
              return res ? { emailTaken: true } : null;
            })
          );
        }));
    };
  }

}
