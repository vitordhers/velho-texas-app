import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Order } from '../models/order.model';
import { UserStatus } from 'src/app/shared/enums/user-status.enum';
import { Toast } from '../../../shared/constants/toast.constant';
import { OrderService } from '../orders.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-offlineorder',
  templateUrl: './order.page.html',
  styleUrls: ['./order.page.scss'],
})
export class OrderPage implements OnInit {
  selectedOrder: Order;
  public user: { name: string, status: UserStatus };
  public userStatus = UserStatus;
  public loadedData = false;
  public savingPassword = false;
  public passwordType = 'password';
  public passwordIcon = 'eye-off';
  public hidePasswordCard = false;
  public token: string;
  public orderId: string;

  public fields = {
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
    }
  };

  form: FormGroup;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public platform: Platform,
    private ordersService: OrderService
  ) { }

  ngOnInit() {
    this.form = new FormGroup(
      {
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
        promo: new FormControl(true)
      }
    );
  }

  savePassword() {
    this.savingPassword = true;
    if (this.route.snapshot.queryParams.token) {
      this.ordersService.savePasswordFromOrder(
        this.token,
        this.orderId,
        this.form.value.passwords.password,
        this.form.value.passwords.cpassword,
        this.form.value.promo
      ).subscribe(result => {
        Toast.fire({
          icon: 'success',
          title: 'Senha salva com sucesso, Roy! 😉',
          html: `não se esqueça de confirmar seu e-mail <b>${result.email}</b> 📧`,
          heightAuto: false
        });
        this.hidePasswordCard = true;
        this.savingPassword = false;
        return;
      }, err => {
        console.log('err', err);
        Toast.fire({
          icon: 'error',
          title: 'Não foi possível salvar sua senha, Roy! 😥',
          heightAuto: false
        });
        this.savingPassword = false;
      });
    }
  }

  ionViewWillEnter() {
    if (this.route.snapshot.queryParams.pedido && this.route.snapshot.queryParams.token) {
      this.token = this.route.snapshot.queryParams.token;
      this.orderId = this.route.snapshot.queryParams.pedido;
      this.ordersService.fetchOfflineUserOrder(
        this.orderId,
        this.token
      ).subscribe(result => {
        this.loadedData = true;
        this.user = { name: result.name, status: result.status };
        if (result.orders.length) {
          this.selectedOrder = result.orders[0];
        }
      });
    } else {
      this.router.navigateByUrl('usuario/pedidos');
    }
  }

  checkPasswords(group: FormGroup): { [key: string]: boolean } | null {
    if (group.get('password').value !== group.get('cpassword').value) {
      group.get('cpassword').setErrors({ checkPasswords: true });
      return { checkPasswords: true };
    }
  }

  hideShowPassword(): void {
    this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
    this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
  }

}
