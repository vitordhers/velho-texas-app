import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { ModalController, LoadingController, IonItemSliding, Platform } from '@ionic/angular';
import { Address } from '../models/address.model';
import { AddressService } from '../address.service';
import { Toast } from '../../../shared/constants/toast.constant';
import {
  Subscription,
  // pipe,
  // Observable,
  // of
} from 'rxjs';
// import { map, take, switchMap, distinctUntilChanged, tap } from 'rxjs/operators';
// import { SuccessfulCep } from '../models/successfulcep.model';

@Component({
  selector: 'app-add-edit-address',
  templateUrl: './add-edit-address.component.html',
  styleUrls: ['./add-edit-address.component.scss'],
})

export class AddEditAddressComponent implements OnInit, OnDestroy {
  form: FormGroup;
  @Input() addressId: string | null;
  @Input() slidingEl: IonItemSliding | null;

  selectedAddress: Address;
  idSub: Subscription;
  cepSub: Subscription;
  isLoading: boolean;

  constructor(
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private addressService: AddressService,
    public platform: Platform
  ) { }

  ngOnInit() {

    this.idSub = this.addressService.getAddress(this.addressId).subscribe(address => {
      this.selectedAddress = address;
    });

    this.form = new FormGroup({
      postalCode: new FormControl(this.selectedAddress.postalCode, {
        validators: [
          Validators.required,
          Validators.maxLength(9),
          Validators.minLength(9)
        ],
        // asyncValidators: [
        //   this.cepValidator()
        // ]
      }),
      street: new FormControl(this.selectedAddress.street, {
        validators: [
          Validators.required,
          Validators.maxLength(50)
        ]
      }),
      no: new FormControl(this.selectedAddress.no, {
        validators: [
          Validators.required,
          Validators.min(1)
        ]
      }),
      city: new FormControl(this.selectedAddress.city, {
        validators: [
          Validators.required,
          Validators.maxLength(70)
        ]
      }),
      state: new FormControl(this.selectedAddress.state, {
        validators: [
          Validators.required,
          Validators.maxLength(2)
        ]
      }),
      addInfo: new FormControl(this.selectedAddress.addInfo, {
        validators: [
          Validators.maxLength(80)
        ]
      }),
    });

    this.cepSub = this.form.get('postalCode').valueChanges.subscribe(val => {
      if (val && val.length === 9) {
        this.addressService.postalCodeEmitter.next(val);
      }
    });

    this.addressService.locationOutput.subscribe((result) => {
      if ('cep' in result) {
        this.form.get('street').setValue(result.logradouro);
        this.form.get('city').setValue(result.localidade);
        this.form.get('state').setValue(result.uf);
        this.form.markAllAsTouched();
      } else if ('erro' in result) {
        this.form.get('postalCode').setErrors({ invalidCep: true });
        this.form.get('street').reset();
        this.form.get('no').reset();
        this.form.get('city').reset();
        this.form.get('state').reset();
        this.form.get('addInfo').reset();
      }
    }, (_) => {
      this.form.get('postalCode').setErrors({ invalidCep: true });
      this.form.get('street').reset();
      this.form.get('no').reset();
      this.form.get('city').reset();
      this.form.get('state').reset();
      this.form.get('addInfo').reset();
      Toast.fire({
        icon: 'error',
        title: 'Macacos me mordam! 🙊',
        text: 'Não conseguimos achar seu endereço pelo CEP, tente novamente',
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
      }).then(res => {
        if (this.slidingEl) {
          this.slidingEl.close();
        }
      });
    });

    if (this.selectedAddress === undefined) {
      this.form.reset();
    }
  }


  isEmpty(obj) {
    return !obj || Object.keys(obj).length === 0;
  }

  async presentLoader(): Promise<void> {
    if (this.platform.is('mobile')) {
      const loader = await this.loadingCtrl.create(
        {
          message: this.selectedAddress.addressId ? 'Atualizando endereço...' : 'Adicionando endereço...'
        }
      );
      return loader.present();
    } else {
      this.isLoading = true;
      return;
    }
  }

  dismissLoader(): void {
    if (this.platform.is('mobile')) {
      this.loadingCtrl.dismiss();
    } else {
      this.isLoading = true;
    }
  }

  dismissSlider(): void {
    if (this.slidingEl) {
      this.slidingEl.close();
    }
  }

  onCloseModal(role: string) {
    if (role === 'confirm') {

      this.presentLoader();
      if (this.selectedAddress.addressId) {
        this.addressService.updateAddress(this.selectedAddress.addressId, this.form.value).subscribe((data) => {
          if (data) {
            this.dismissSlider();
            if (this.modalCtrl) {
              this.modalCtrl.dismiss(null, role);
            }
            Toast.fire({
              icon: 'success',
              title: '🤠 Deu bão!',
              text: 'Seu endereço foi atualizado com sucesso, fi!',
              timer: 3000,
            });
          } else {
            Toast.fire({
              icon: 'error',
              title: '😒 Deu ruim!',
              text: 'Seu endereço não pôde ser atualizado, tente novamente mais tarde!',
            });
          }
          this.dismissLoader();
        });
      } else {
        this.addressService.addAddress(this.form.value).subscribe((data) => {
          if (data) {
            this.dismissSlider();
            if (this.modalCtrl) {
              this.modalCtrl.dismiss(null, role);
            }
          } else {
            Toast.fire({
              icon: 'error',
              title: '😒 Deu ruim!',
              text: 'Num foi possível adicionar o endereço, tente novamente mais tarde!',
            });
          }
          this.dismissLoader();
        });
      }

    } else {
      this.modalCtrl.dismiss(null, role);
      this.dismissSlider();
    }

  }

  ngOnDestroy() {
    this.idSub.unsubscribe();
  }

  // setAsync() {
  //   console.log('SETE ASINQUE');
  //   if (this.selectedAddress) {
  //     this.form.get('cep').setAsyncValidators(this.validateCep.bind(this));
  //     this.form.get('cep').updateValueAndValidity({ onlySelf: true });
  //   }
  // }

  // validateCep(_: AbstractControl) {
  //   return this.addressService.locationOutput.pipe(
  //     map(res => {
  //       if ('erro' in res) {
  //         return { invalidCep: true };
  //       } else {
  //         return null;
  //       }
  //     }));
  // }

  // cepValidator(): AsyncValidatorFn {
  //   return (control: AbstractControl): Observable<ValidationErrors | null> => {
  //     if (control.value.length === 9) {
  //       return of(control.value).pipe(
  //         tap(res => console.log(res)),
  //         distinctUntilChanged(),
  //         map(cep => cep.replace('-', '')),
  //         switchMap((cep) => {
  //           return this.addressService.fetchCep(cep).pipe(
  //             tap(res => {
  //               console.log('RESPONSE', res instanceof SuccessfulCep);
  //               if (res instanceof SuccessfulCep) {
  //                 this.form.get('addressStreet').setValue(res.logradouro);
  //                 this.form.get('addressCity').setValue(res.localidade);
  //                 this.form.get('addressState').setValue(res.uf);
  //                 this.form.markAllAsTouched();
  //               }
  //             }),
  //             map(res => {
  //               if (res instanceof SuccessfulCep) {
  //                 return null;
  //               } else {
  //                 return { invalidCep: true };
  //               }
  //             })
  //           );
  //         }));
  //     } else {
  //       return of({ invalidCep: true });
  //     }
  //   };
  // }
}
