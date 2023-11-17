import { Component, OnInit } from '@angular/core';
import { Platform, ModalController } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ChangeEmailComponent } from './change-email/change-email.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { UserStart } from '../start/models/user-start.model';
import { UserStatus } from 'src/app/shared/enums/user-status.enum';
import { UserService } from '../user.service';
import Swal from 'sweetalert2';
import { Toast } from '../../shared/constants/toast.constant';

@Component({
  selector: 'app-config',
  templateUrl: './config.page.html',
  styleUrls: ['./config.page.scss'],
})
export class ConfigPage implements OnInit {
  constructor(
    public platform: Platform,
    private userService: UserService,
    public modalCtrl: ModalController
  ) { }

  public userStatus = UserStatus;
  public form: FormGroup;
  public isLoading = false;
  public dataLoaded = false;

  public userData: UserStart;

  public fields = {
    name: {
      field: '🤠 Nome',
      errors: {
        required: 'Esqueceu de colocar seu nome, Roy!',
        minlength: 'Seu nome deve ter pelo menos 4 letras, Roy!',
        maxlength: 'Seu nome não pode ter mais de 50 letras, Roy!'
      }
    },
    celphoneNumber: {
      field: '📱 Celular',
      errors: {
        minlength: 'Este número de celular parece ser do Wyoming, mas não do Velho Texas'
      }
    }
  };


  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl(null, {
        validators: [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(50)]
      }),
      celphoneNumber: new FormControl(null, {
        validators: [Validators.minLength(15)]
      }),
      whatsapp: new FormControl(false),
      communication: new FormGroup({
        mailcomm: new FormControl(false),
        wppcomm: new FormControl(false)
      })
    });

  }

  ionViewWillEnter() {
    this.userService.fetchUserData().subscribe(loadedData => {
      if (loadedData) {
        this.dataLoaded = true;
        this.userData = loadedData;

        this.form.get('name').setValue(this.userData.name);
        if (this.userData.celphoneNumber) { this.form.get('celphoneNumber').setValue(this.userData.celphoneNumber); }
        if (this.userData.whatsapp) { this.form.get('whatsapp').setValue(this.userData.whatsapp); }
        if (this.userData.communication.mailcomm) {
          this.form.get('communication.mailcomm').setValue(this.userData.communication.mailcomm);
        }
        if (this.userData.communication.wppcomm) {
          this.form.get('communication.wppcomm').setValue(this.userData.communication.wppcomm);
        }
      }
    });
  }

  ionViewWillLeave() {
    this.dataLoaded = false;
    this.userData = null;
    this.isLoading = false;
  }

  async changeEmail(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ChangeEmailComponent,
      cssClass: 'modal'
    });
    return modal.present();
  }

  resendEmail(email: string) {
    Swal.fire({
      title: '🤔 Tem certeza que deseja reenviar o e-mail de confirmação',
      html: `para o e-mail <b>${email}</b> ?`,
      showCancelButton: true,
      confirmButtonColor: '#5a1f01',
      cancelButtonColor: '#ff4500',
      confirmButtonText: 'Mande, rapaiz!',
      cancelButtonText: 'Mió não',
      heightAuto: false
    }).then(response => {
      if (response.value) {
        this.userService.resendConfirmationEmail().subscribe(result => {
          Toast.fire({
            title: '🤠 Deu Bão!',
            icon: 'success',
            html: `Email enviado com sucesso para <b>${result.email}</b>!`,
            heightAuto: false
          });
        }, err => {
          Toast.fire({
            title: '🤕 Deu ruim!',
            icon: 'error',
            text: err.error.message,
            heightAuto: false
          });
        });
      }
    });
  }

  async changePassword(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ChangePasswordComponent,
      cssClass: 'modal',
      componentProps: {
        change: this.userData.password
      }
    });
    return modal.present();
  }

}
