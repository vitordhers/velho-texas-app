import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ModalController, createAnimation } from '@ionic/angular';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder, ValidatorFn, AbstractControl } from '@angular/forms';
import { Subscription, combineLatest, Subject, interval, Observable } from 'rxjs';

import { AddEditAddressComponent } from '../user/address/add-edit-address/add-edit-address.component';
import { Toast } from '../shared/constants/toast.constant';
import { MONTHSHORTNAMES } from '../shared/constants/shortmonths.constant';
import { CartService } from './cart.service';
import { AddressService } from '../user/address/address.service';
import { Address } from '../user/address/models/address.model';
import { debounceTime, tap, map, distinctUntilChanged, switchMap, takeWhile, pairwise } from 'rxjs/operators';
import { markFormGroupTouched } from '../shared/functions/markformgroupastouched.function';
import { isEmpty } from 'lodash';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { AvailabilityResponse } from '../products/models/availability-response.model';
import { PlaceOrderResponse } from './models/place-order-result.model';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import 'moment/locale/pt-br';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss']
})
export class CartPage implements OnInit, OnDestroy {
  @ViewChild('creditCard') creditCardDiv: ElementRef<HTMLDivElement>;
  @ViewChild('bannerLogo', { static: false }) bannerLogoDiv: ElementRef<HTMLDivElement>;
  @ViewChild('cardFront') cardFrontDiv: ElementRef<HTMLDivElement>;
  @ViewChild('cardBack') cardBackDiv: ElementRef<HTMLDivElement>;
  @ViewChild('cvvDiv') cvvDiv: ElementRef<HTMLDivElement>;
  @ViewChild('cvvAmexDiv', { static: false }) cvvAmexDiv: ElementRef<HTMLDivElement>;
  @ViewChild('nextCard') nextCardDiv: ElementRef<HTMLDivElement>;
  @ViewChild('presentCard') presentCardDiv: ElementRef<HTMLDivElement>;

  public authenticated: boolean;
  public postalCodeEmitter = new Subject<string>();
  public postalCodeObservable = this.postalCodeEmitter.asObservable();

  public mobile: boolean;

  public loaders = { fetchingPostalCode: false, placingOrder: false };
  public availability: AvailabilityResponse = {};

  public paymentMethod: string;

  public creditCards = {
    elo: {
      noRegex: /^(4011(78|79)|43(1274|8935)|45(1416|7393|763(1|2))|50(4175|6699|67([0-6][0-9]|7[0-8])|9\d{3})|627780|63(6297|6368)|650(03([^4])|04([0-9])|05(0|1)|4(0[5-9]|(1|2|3)[0-9]|8[5-9]|9[0-9])|5((3|9)[0-8]|4[1-9]|([0-2]|[5-8])\d)|7(0\d|1[0-8]|2[0-7])|9(0[1-9]|[1-6][0-9]|7[0-8]))|6516(5[2-9]|[6-7]\d)|6550(2[1-9]|5[0-8]|(0|1|3|4)\d))\d*/,
      noLength: 16,
      noChunkLength: 22,
      cvvLength: 3
    },
    discover: {
      noRegex: /^6(?:011\d{12}|5\d{14}|4[4-9]\d{13}|22(?:1(?:2[6-9]|[3-9]\d)|[2-8]\d{2}|9(?:[01]\d|2[0-5]))\d{10})/,
      noLength: 16,
      noChunkLength: 22,
      cvvLength: 3
    },
    aura: {
      noRegex: /^((?!5066|5067|50900|504175|506699)50)/,
      noLength: 20,
      noChunkLength: 20,
      cvvLength: 4
    },
    hipercard: {
      noRegex: /^606282|384100|384140|384160/,
      noLength: 16,
      noChunkLength: 22,
      cvvLength: 3
    },
    diners: {
      noRegex: /^(300|301|302|303|304|305|36|38)/,
      noLength: 14,
      noChunkLength: 18,
      cvvLength: 3
    },
    jcb15: {
      noRegex: /^2131|1800/,
      noLength: 15,
      noChunkLength: 19,
      cvvLength: 3
    },
    jcb16: {
      noRegex: /^2131|1800/,
      noLength: 16,
      noChunkLength: 22,
      cvvLength: 3
    },
    amex: {
      noRegex: /^3[47]/,
      noLength: 15,
      noChunkLength: 19,
      cvvLength: 4
    },
    visa: {
      noRegex: /^4/,
      noLength: 16,
      noChunkLength: 22,
      cvvLength: 3
    },
    mastercard: {
      noRegex: /^(5[1-5]|2(2(2[1-9]|[3-9])|[3-6]|7([0-1]|20)))/,
      noLength: 16,
      noChunkLength: 22,
      cvvLength: 3
    }
  };

  public creditCardBanner = 'genericCard';
  public creditCardNoLength = 16;
  public creditCardNoChunkLength = 22;
  public creditCardCVVLength = 3;
  public creditCardFlipped = false;

  public amexCVVfoccused = false;

  public monthShortNames = MONTHSHORTNAMES;
  public today = new Date().toISOString();
  public nextMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString();
  public dateLimit = new Date(new Date().setFullYear(new Date().getFullYear() + 20)).toISOString();

  private formChangesSub: Subscription;

  private fetchAddressesSub: Subscription;
  private addressesSub: Subscription;
  private locationOutputSub: Subscription;

  private freightResultSub: Subscription;

  public addresses: Address[];
  public selectedAddressId: string | null;
  public disabledCeps = [];
  public form: FormGroup;
  public offlineAddress: FormGroup;

  public totalProducts: number;
  public totalWeight: number;

  public freightOptions: {
    pac: { totalFreight: number, eta: [string, string] },
    sedex: { totalFreight: number, eta: [string, string] }
  };

  public totalFreight: number;
  public totalOrder: number;

  public iuguServiceDisabled = false;
  public selectedAddressState;

  constructor(
    // private platform: Platform,
    private cartService: CartService,
    private addressService: AddressService,
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private router: Router,
    public authService: AuthService
  ) { }

  ngOnInit() {
    this.offlineAddress = new FormGroup({
      name: new FormControl('', {
        validators: [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(50)]
      }),
      email: new FormControl(null, {
        validators: [
          Validators.email,
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(30)
        ]
      }),
      postalCode: new FormControl(null, {
        validators: [
          Validators.required,
          Validators.maxLength(9),
          Validators.minLength(9)
        ]
      }),
      street: new FormControl(null, {
        validators: [
          Validators.required,
          Validators.maxLength(50)
        ]
      }),
      no: new FormControl(null, {
        validators: [
          Validators.required,
          Validators.min(1)
        ]
      }),
      city: new FormControl(null, {
        validators: [
          Validators.required,
          Validators.maxLength(70)
        ]
      }),
      state: new FormControl(null, {
        validators: [
          Validators.required,
          Validators.maxLength(2)
        ]
      }),
      addInfo: new FormControl(null, {
        validators: [
          Validators.maxLength(80)
        ]
      }),
    });

    this.form = this.formBuilder.group({
      products: new FormArray([], {
        validators: [this.isEmptyProducts()]
      }),
      paymentMethod: new FormControl('creditCard', {
        validators: [Validators.required]
      }),
      cpf: new FormControl('', {
        validators: [Validators.required]
      }),
      card: new FormGroup({
        cardNumber: new FormControl('', {
          validators: [Validators.required, this.cardNoLengthValidator(), this.luhnValidator()]
        }),
        holderName: new FormControl('', {
          validators: [Validators.required, Validators.maxLength(22)]
        }),
        dueDate: new FormControl(null, {
          validators: [Validators.required]
        }),
        securityCode: new FormControl('', {
          validators: [Validators.required]
        })
      }),
      freightMode: new FormControl('sedex', {
        validators: [Validators.required]
      }),

      offlineAddress: this.offlineAddress,

      selectedAddressId: new FormControl(this.selectedAddressId, {
        validators: [Validators.required]
      }),
      legal: new FormControl(false, {
        validators: Validators.requiredTrue
      }),
    });

    this.locationOutputSub = this.addressService.locationOutput.subscribe((result) => {
      this.loaders.fetchingPostalCode = false;
      if ('cep' in result) {
        this.form.get('offlineAddress.street').setValue(result.logradouro);
        this.form.get('offlineAddress.city').setValue(result.localidade);
        this.form.get('offlineAddress.state').setValue(result.uf);
        this.selectedAddressState = result.uf;
      } else if ('erro' in result) {
        this.form.get('offlineAddress.postalCode').setErrors({ invalidCep: true });
        this.form.get('offlineAddress.street').reset();
        this.form.get('offlineAddress.no').reset();
        this.form.get('offlineAddress.city').reset();
        this.form.get('offlineAddress.state').reset();
        this.form.get('offlineAddress.addInfo').reset();
      }
      markFormGroupTouched(this.offlineAddress);
    }, (_) => {
      this.loaders.fetchingPostalCode = false;
      this.form.get('offlineAddress.postalCode').setErrors({ invalidCep: true });
      this.form.get('offlineAddress.street').reset();
      this.form.get('offlineAddress.no').reset();
      this.form.get('offlineAddress.city').reset();
      this.form.get('offlineAddress.state').reset();
      this.form.get('offlineAddress.addInfo').reset();
      Toast.fire({
        icon: 'error',
        title: 'Macacos me mordam! 🙊',
        text: 'Não conseguimos achar seu endereço pelo CEP, tente novamente',
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        heightAuto: false
      });
    });

    this.addressesSub = this.addressService.addresses.subscribe(addresses => {
      this.addresses = addresses;
      if (this.addresses.length > 0) {
        const address = this.addresses.find(ad => ad.defaultAddress === true);
        if (address) {
          this.selectedAddressId = address.addressId;
          this.form.get('selectedAddressId').setValue(this.selectedAddressId);
          const selectedAddress = this.addresses.find(ad => ad.addressId === this.selectedAddressId);
          this.selectedAddressState = selectedAddress.state;
          this.postalCodeEmitter.next(selectedAddress.postalCode);
        }
      }
    });

    this.authService.userIsAuthenticated.subscribe(authenticated => {
      this.authenticated = authenticated;
      if (authenticated) {
        this.form.controls.offlineAddress.disable();
        this.form.controls.selectedAddressId.enable();
      } else {
        this.form.controls.offlineAddress.enable();
        this.form.controls.selectedAddressId.disable();
      }
    });

    this.formChangesSub = this.form.valueChanges.pipe(
      distinctUntilChanged(),
      pairwise()
    ).subscribe(([oldValue, newValue]) => {
      if (oldValue.paymentMethod !== newValue.paymentMethod) {
        if (newValue.paymentMethod === 'creditCard') {
          this.form.controls.card.enable();
        } else {
          this.form.controls.card.disable();
        }
      }

      if (!this.authenticated && oldValue.offlineAddress.postalCode !== newValue.offlineAddress.postalCode) {
        if (newValue.offlineAddress.postalCode.length === 9) {
          this.loaders.fetchingPostalCode = true;
          this.addressService.postalCodeEmitter.next(newValue.offlineAddress.postalCode);
          this.postalCodeEmitter.next(newValue.offlineAddress.postalCode);
        }
      }

      if (oldValue.freightMode !== newValue.freightMode) {
        if (newValue.freightMode === 'pac') {
          this.totalFreight = this.freightOptions.pac.totalFreight;
        } else {
          this.totalFreight = this.freightOptions.sedex.totalFreight;
        }
        this.totalOrder = this.totalProducts + this.totalFreight;
      }

      if (oldValue.selectedAddressId !== newValue.selectedAddressId && newValue.selectedAddressId) {
        this.postalCodeEmitter.next(this.addresses.find(ad => ad.addressId === newValue.selectedAddressId).postalCode);
      }
    });

    this.freightResultSub = combineLatest([
      this.cartService.cartTotal.pipe(tap(total => { this.totalProducts = total; })),
      this.cartService.cartWeightTotal.pipe(tap(weight => { this.totalWeight = weight; })),
      this.postalCodeObservable
    ]).pipe(
      map(val => {
        return { amount: val[0], weight: val[1], postalCode: val[2] };
      }),
      distinctUntilChanged((p, q) => {
        if (p && q) {
          return p.amount === q.amount && p.weight === q.weight && p.postalCode === q.postalCode;
        }
      }),
      tap(res => {
        if (res && res.amount && res.weight) {
          this.totalFreight = 0;
          this.totalOrder = 0;
          this.freightOptions = {
            pac: {
              totalFreight: -1,
              eta: null
            },
            sedex: {
              totalFreight: -1,
              eta: null
            }
          };
        } else {
          this.totalFreight = null;
          this.totalOrder = null;
          this.freightOptions = null;
        }
      }),
      debounceTime(4000),
      switchMap(data => {
        return this.cartService.updateFreight(data);
      })).subscribe(result => {
        this.freightOptions = {
          pac: {
            totalFreight: parseFloat(result.pac.price.replace(',', '.')) + 10,
            eta: (!result.pac.errMsg) ?
              [this.addWeekdays(moment(), parseInt(result.pac.term, 10)),
              this.addWeekdays(moment(), parseInt(result.pac.term, 10) + 2)] :
              [this.addWeekdays(moment(), parseInt(result.pac.term, 10) - 7),
              this.addWeekdays(moment(), parseInt(result.pac.term, 10) + 2)]
          },
          sedex: {
            totalFreight: parseFloat(result.sedex.price.replace(',', '.')),
            eta: (!result.sedex.errMsg) ?
              [this.addWeekdays(moment(), parseInt(result.sedex.term, 10) - 1),
              this.addWeekdays(moment(), parseInt(result.sedex.term, 10))]
              :
              [this.addWeekdays(moment(), parseInt(result.sedex.term, 10) - 7),
              this.addWeekdays(moment(), parseInt(result.sedex.term, 10))]
          }
        };

        if (this.form.get('freightMode').value === 'pac') {
          this.totalFreight = this.freightOptions.pac.totalFreight;
          if (result.pac.errMsg) {
            Toast.fire({
              icon: 'warning',
              title: result.pac.errMsg,
              heightAuto: false
            });
          }
        } else {
          this.totalFreight = this.freightOptions.sedex.totalFreight;
          if (result.sedex.errMsg) {
            Toast.fire({
              icon: 'warning',
              title: result.sedex.errMsg,
              heightAuto: false
            });
          }
        }

        this.totalOrder = this.totalProducts + this.totalFreight;

      }, err => {
        Toast.fire({
          icon: 'error',
          title: 'O serviço dos Correios não está disponível para este CEP',
          heightAuto: false
        });
        this.form.get('selectedAddressId').setValue(null);
        const filteredCep = this.addresses.find(ad => ad.addressId === this.selectedAddressId).postalCode;
        const disabledCeps = this.addresses.filter(ad => ad.postalCode === filteredCep);
        disabledCeps.forEach((value) => {
          this.disabledCeps.push(value.addressId);
        });
        this.selectedAddressId = null;
      });
  }

  ionViewWillEnter() {
    this.addressService.fetchAddresses().subscribe();

    this.cartService.loadPublicKey().subscribe(_ => { },
      error => {
        this.iuguServiceDisabled = true;
        this.form.get('paymentMethod').setValue('boleto');
      });
  }


  clearCart() {
    this.cartService.storeCart([]);
  }

  addressAdd(addressId?: string) {
    this.modalCtrl.create({
      component: AddEditAddressComponent,
      cssClass: 'modal-lg',
      componentProps: { addressId }
    })
      .then(modalEl => {
        modalEl.present();
      });
  }

  addWeekdays(date: moment.Moment, days: number) {
    moment.locale('pt-BR');
    let dateDays = moment(date);
    let dateBusinessDays = moment(date);

    while (days > 0) {
      dateDays = date.add(1, 'days');
      days -= 1;
    }

    while (days > 0) {
      dateBusinessDays = date.add(1, 'days');
      if (dateBusinessDays.isoWeekday() !== 6 && dateBusinessDays.isoWeekday() !== 7) {
        days -= 1;
      }
    }
    const diff = dateDays.diff(dateBusinessDays, 'days');
    if (diff <= 7) {
      return `${dateBusinessDays.format('dddd')} que vem`;
    } else {
      return `o dia ${dateBusinessDays.format('DD')} de ${dateBusinessDays.format('MMMM')}`;
    }
  }

  async creditCardNoChange(cardNumber: string) {
    let found = false;
    let animate = false;
    // tslint:disable-next-line: forin
    for (const key in this.creditCards) {
      if (this.creditCards[key].noRegex.test(cardNumber)) {
        if (this.creditCardBanner !== key) {
          this.creditCardBanner = key;
          this.creditCardNoLength = this.creditCards[key].noLength;
          this.creditCardNoChunkLength = this.creditCards[key].noChunkLength;
          this.creditCardCVVLength = this.creditCards[key].cvvLength;
          animate = true;
        }
        found = true;
        break;
      }
    }
    if (!found) {
      if (this.creditCardBanner !== 'genericCard') {
        this.creditCardBanner = 'genericCard';
        this.creditCardNoLength = 20;
        this.creditCardNoChunkLength = 22;
        this.creditCardCVVLength = 4;
        animate = true;
      }
    }
    if (animate) {
      this.nextCardDiv.nativeElement.classList.replace(
        this.nextCardDiv.nativeElement.classList[1],
        this.creditCardBanner
      );
      const nextCardAnimation = this.fadeAnimation(true, this.nextCardDiv);
      const presentCardAnimation = this.fadeAnimation(false, this.presentCardDiv);
      const animations = createAnimation()
        .addAnimation([presentCardAnimation, nextCardAnimation]);
      await animations.play();
      this.presentCardDiv.nativeElement.classList.replace(
        this.presentCardDiv.nativeElement.classList[1],
        this.creditCardBanner
      );
    }

  }

  cardNoLengthValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (control.value.length > this.creditCardNoChunkLength) {
        control.setValue(control.value.substring(0, this.creditCardNoChunkLength));
      }
      const stripedVal = control.value.replace(/\D/g, '');
      if (stripedVal.length !== this.creditCardNoLength) {
        return { cardNoLength: true };
      }
      return null;
    };
  }

  isEmptyProducts(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (isEmpty(control.value)) {
        return { emptyProducts: true };
      }
      return null;
    };
  }

  luhnValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const val = control.value.replace(/\D/g, '');
      let numberProduct, checkSumTotal = 0;
      for (let digitCounter = val.length - 1; digitCounter >= 0; digitCounter = digitCounter - 2) {
        checkSumTotal += parseInt(val.charAt(digitCounter), 10);
        numberProduct = String((val.charAt(digitCounter - 1) * 2));
        for (let productDigitCounter = 0; productDigitCounter < numberProduct.length; productDigitCounter++) {
          checkSumTotal += parseInt(numberProduct.charAt(productDigitCounter), 10);
        }
      }
      if (checkSumTotal % 10 !== 0) {
        return { luhn: true };
      }
      return null;
    };
  }

  flipCreditCard(event: CustomEvent) {
    if (this.creditCardBanner === 'amex') {
      this.amexCVVfoccused = !this.amexCVVfoccused;
    } else if (this.creditCardBanner === 'genericCard') {
      return;
    } else {
      this.creditCardFlipped = !this.creditCardFlipped;
      this.animationFlipCard(this.creditCardFlipped);
    }
  }

  populateCart(products: FormArray) {
    this.form.controls.products = products;
  }

  onSubmit() {
    markFormGroupTouched(this.form);
    this.loaders.placingOrder = true;
    if (this.form.valid) {
      let placeOrderObservable: Observable<PlaceOrderResponse>;
      if (this.form.value.paymentMethod === 'creditCard') {
        placeOrderObservable = interval(200)
          .pipe(
            map(_ => this.cartService.publicKey),
            takeWhile(publicKey => {
              return publicKey == null;
            }, true),
            switchMap(publicKey => {
              if (publicKey != null) {
                return this.cartService.getInternalCardHash(
                  this.form.value.products,
                  this.form.value.cpf,
                  this.form.value.selectedAddressId,
                  this.form.value.card
                );
              }
            }),
            switchMap(encoded => this.cartService.getCardHash(encoded)),
            switchMap(cardHash => {
              return this.cartService.placeOrder(
                this.form.value.products,
                this.form.value.freightMode,
                this.form.value.cpf,
                (this.authenticated) ? this.form.value.selectedAddressId : null,
                (this.authenticated) ? null : {
                  email: this.form.value.offlineAddress.email,
                  name: this.form.value.offlineAddress.name,
                  postalCode: this.form.value.offlineAddress.postalCode,
                  street: this.form.value.offlineAddress.street,
                  no: this.form.value.offlineAddress.no,
                  city: this.form.value.offlineAddress.city,
                  state: this.form.value.offlineAddress.state,
                  addInfo: this.form.value.offlineAddress.addInfo,
                },
                cardHash
              );
            }),
          );
      } else if (this.form.value.paymentMethod === 'boleto') {
        placeOrderObservable = this.cartService.placeOrder(
          this.form.value.products,
          this.form.value.freightMode,
          this.form.value.cpf,
          (this.authenticated) ? this.form.value.selectedAddressId : null,
          (this.authenticated) ? null : {
            email: this.form.value.offlineAddress.email,
            name: this.form.value.offlineAddress.name,
            postalCode: this.form.value.offlineAddress.postalCode,
            street: this.form.value.offlineAddress.street,
            no: this.form.value.offlineAddress.no,
            city: this.form.value.offlineAddress.city,
            state: this.form.value.offlineAddress.state,
            addInfo: this.form.value.offlineAddress.addInfo,
          }
        );
      }

      placeOrderObservable.subscribe(result => {
        if (result.code === 201) {
          if (result.link) {
            window.open(result.link);
          }
          Toast.fire({
            icon: 'success',
            title: `🤠 Pedido realizado com sucesso, Roy!`,
            heightAuto: false
          });
          if (result.token && !this.authenticated) {
            this.router.navigateByUrl(`/pedido?pedido=${result.orderId}&token=${result.token}`);
          } else {
            this.router.navigateByUrl(`/pedido?pedido=${result.orderId}`);
          }
          this.clearCart();
        }
        this.loaders.placingOrder = false;
      }, err => {
        let title;
        let text;
        let refresh: boolean;
        if (err.status === 402) {
          title = '🤕 Não foi possível realizar seu pagamento';
          text = err.error.message + 'Tente usar outro cartão ou pagar no boleto.';
          refresh = false;
        } else {
          title = '🤕 Houve um erro na sua requisição!';
          text = err.error.message;
          refresh = false;
          // this.clearCart();
        }

        Swal.fire({
          title,
          text,
          icon: 'error',
          confirmButtonColor: '#ff4500',
          confirmButtonText: '😒 Entendo...',
          target: 'ion-split-pane',
          heightAuto: false
        }).then(_ => {
          if (refresh) {
            window.location.reload();
          }
        });
        this.loaders.placingOrder = false;
      });

    } else {
      this.loaders.placingOrder = false;
      Toast.fire({
        icon: 'error',
        title: `🤔 Você preencheu todos os campos corretamente?`,
        heightAuto: false
      });
    }
  }

  ngOnDestroy() {
    if (this.addressesSub) {
      this.addressesSub.unsubscribe();
    }
    if (this.formChangesSub) {
      this.formChangesSub.unsubscribe();
    }

    if (this.locationOutputSub) {
      this.locationOutputSub.unsubscribe();
    }
    if (this.freightResultSub) {
      this.freightResultSub.unsubscribe();
    }
    if (this.fetchAddressesSub) {
      this.fetchAddressesSub.unsubscribe();
    }
  }

  async animationFlipCard(flip: boolean) {
    const flipCardAnimation = createAnimation()
      .addElement(this.creditCardDiv.nativeElement)
      .easing('ease-in')
      .keyframes([
        { offset: 0.2, transform: `rotate3d(0, 1, 0, 90deg)` },
        { offset: 0.4, transform: `rotate3d(0, 1, 0, ${flip ? 200 : 20}deg)` },
        { offset: 0.6, transform: `rotate3d(0, 1, 0, ${flip ? 170 : -10}deg)` },
        { offset: 0.8, transform: `rotate3d(0, 1, 0, ${flip ? 185 : 5}deg)` },
      ])
      .fromTo(
        'transform',
        flip ? 'rotate3d(0, 1, 0, 0deg)' : 'rotate3d(0, 1, 0, 180deg)',
        flip ? 'rotate3d(0, 1, 0, 180deg)' : 'rotate3d(0, 1, 0, 0deg)'
      );

    const animations = [
      flipCardAnimation,
      this.flipContentAnimation(flip, this.bannerLogoDiv),
      this.flipContentAnimation(flip, this.cardFrontDiv),
      this.flipContentAnimation(!flip, this.cardBackDiv)
    ];

    const flipAnimation = createAnimation()
      .duration(1000)
      .addAnimation(animations);
    const cvvAnimation = this.cvvGlowAnimation(this.cvvDiv);
    await flipAnimation.play();
    await cvvAnimation.play();
  }

  flipContentAnimation(flip: boolean, element: ElementRef) {
    return createAnimation()
      .addElement(element.nativeElement)
      .keyframes([
        { offset: 0.4, opacity: flip ? 1 : 0 },
        { offset: 0.41, opacity: flip ? 0 : 1 },
      ])
      .fromTo(
        'opacity',
        flip ? 1 : 0,
        flip ? 0 : 1
      );
  }

  cvvGlowAnimation(element: ElementRef) {
    return createAnimation()
      .addElement(element.nativeElement)
      .duration(2000)
      .keyframes([
        { offset: 0.2, border: `3px solid transparent` },
        { offset: 0.4, border: `3px solid orangered` },
        { offset: 0.6, border: `3px solid transparent` },
      ])
      .fromTo(
        'border',
        '3px solid transparent',
        '3px solid orangered'
      );
  }

  cardFillAnimation(cardBanner: string, element: ElementRef) {
    const animation = createAnimation()
      .addElement(element.nativeElement)
      .duration(2000)
      .keyframes([
        { offset: 0.2, border: `3px solid transparent` },
        { offset: 0.4, border: `3px solid orangered` },
        { offset: 0.6, border: `3px solid transparent` },
      ])
      .fromTo(
        'border',
        '3px solid transparent',
        '3px solid orangered'
      );
  }

  fadeAnimation(fadeIn: boolean, element: ElementRef) {
    return createAnimation()
      .addElement(element.nativeElement)
      .duration(600)
      .fromTo(
        'opacity',
        fadeIn ? '0' : '1',
        fadeIn ? '1' : '0'
      )
      .afterStyles({
        opacity: fadeIn ? '0' : '1'
      });
  }
}
