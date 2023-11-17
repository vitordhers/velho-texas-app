import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import Swal from 'sweetalert2';
import { Toast } from '../../shared/constants/toast.constant';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { ModalController } from '@ionic/angular';
@Component({
    selector: 'app-auth-problems',
    templateUrl: './auth-problems.component.html',
    styleUrls: ['./auth-problems.component.scss'],
})
export class AuthProblemsComponent {
    subscription;
    constructor(
        private authService: AuthService,
        private recaptchaV3Service: ReCaptchaV3Service,
        private modalCtrl: ModalController
    ) {

    }

    forgotPassword() {
        Swal.fire({
            title: '📧 Insira seu e-mail abaixo 👇',
            text: 'que vamos enviar um link para você criar uma senha nova',
            input: 'email',
            validationMessage: 'Endereço de e-mail inválido!',
            inputAttributes: {
                autocapitalize: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'Enviar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#5a1f01',
            cancelButtonColor: 'orangered',
            showLoaderOnConfirm: true,
            preConfirm: async (email) => {
                const recaptcha = await this.recaptchaV3Service.execute('login').toPromise();
                return this.authService.forgotPassword(email, recaptcha)
                    .toPromise()
                    .catch(err => {
                        Toast.fire({
                            title: `Não foi possível enviar seu e-mail.`,
                            text: err.error.message,
                            icon: 'error',
                            timer: 3000,
                            heightAuto: false
                        });
                    });
            },
            allowOutsideClick: () => !Swal.isLoading(),
            heightAuto: false
        }).then(result => {
            if (result.value) {
                Toast.fire({
                    title: `E-mail enviado com sucesso para ${result.value.email}!`,
                    text: 'Vá checar seu e-mail, abutre 🦅',
                    icon: 'success',
                    timer: 5000,
                    heightAuto: false
                });
            }
            this.modalCtrl.dismiss();
        });
    }

    resendConfirmation() {
        Swal.fire({
            title: '📧 Insira seu e-mail abaixo 👇',
            text: 'que vamos enviar um novo e-mail de confirmação',
            input: 'email',
            validationMessage: 'Endereço de e-mail inválido!',
            inputAttributes: {
                autocapitalize: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'Enviar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#5a1f01',
            cancelButtonColor: 'orangered',
            showLoaderOnConfirm: true,
            preConfirm: async (email) => {
                const recaptcha = await this.recaptchaV3Service.execute('login').toPromise();
                return this.authService.resendConfirmationOffilne(email, recaptcha)
                    .toPromise()
                    .catch(err => {
                        Toast.fire({
                            title: `Não foi possível enviar seu e-mail.`,
                            text: err.error.message,
                            icon: 'error',
                            timer: 3000,
                            heightAuto: false
                        });
                    });
            },
            allowOutsideClick: () => !Swal.isLoading(),
            heightAuto: false
        }).then(result => {
            if (result.value) {
                Toast.fire({
                    title: `E-mail enviado com sucesso para ${result.value.email}!`,
                    text: 'Vá checar seu e-mail, abutre 🦅',
                    icon: 'success',
                    timer: 5000,
                    heightAuto: false
                });
            }
            this.modalCtrl.dismiss();
        });
    }

    socialNetworkDeleted() {
        Swal.fire({
            title: '🤔 Você se lembra',
            text: 'qual e-mail você usou para se cadastrar na rede social?',
            input: 'email',
            validationMessage: 'Endereço de e-mail inválido!',
            inputAttributes: {
                autocapitalize: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'Enviar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#5a1f01',
            cancelButtonColor: 'orangered',
            showLoaderOnConfirm: true,
            preConfirm: async (email) => {
                const recaptcha = await this.recaptchaV3Service.execute('login').toPromise();
                return this.authService.resendConfirmationOffilne(email, recaptcha)
                    .toPromise()
                    .catch(err => {
                        Toast.fire({
                            title: `Não foi possível enviar seu e-mail.`,
                            text: err.error.message,
                            icon: 'error',
                            timer: 3000,
                            heightAuto: false
                        });
                    });
            },
            allowOutsideClick: () => !Swal.isLoading(),
            heightAuto: false
        }).then(result => {
            if (result.value) {
                Toast.fire({
                    title: `E-mail enviado com sucesso para ${result.value.email}!`,
                    text: 'Vá checar seu e-mail, abutre 🦅',
                    icon: 'success',
                    timer: 5000,
                    heightAuto: false
                });
            }
            this.modalCtrl.dismiss();
        });
    }
}
