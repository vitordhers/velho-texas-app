import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform, IonItemSliding, createAnimation, IonIcon } from '@ionic/angular';
import { AddressService } from './address.service';
import { Address } from './models/address.model';
import { ModalController } from '@ionic/angular';
import { AddEditAddressComponent } from './add-edit-address/add-edit-address.component';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { Toast } from '../../shared/constants/toast.constant';

@Component({
  selector: 'app-address',
  templateUrl: './address.page.html',
  styleUrls: ['./address.page.scss'],
})
export class AddressPage implements OnInit, OnDestroy {
  loading = false;
  addresses: Address[];
  addressesSub: Subscription;
  public mobile: boolean;
  public dataLoaded = false;

  constructor(
    private readonly addressService: AddressService,
    private readonly modalCtrl: ModalController,
    public readonly platform: Platform,
  ) {
    this.mobile = this.platform.is('mobile');
  }

  ngOnInit() {
    this.addressesSub = this.addressService.addresses.subscribe(addresses => {
      this.addresses = addresses;
    });
  }

  ionViewWillEnter() {
    this.addressService.fetchAddresses().subscribe(_ => {
      this.dataLoaded = true;
    });
  }

  ionViewWillLeave() {
    this.dataLoaded = false;
    this.addresses = [];
  }

  ngOnDestroy() {
    if (this.addressesSub) {
      this.addressesSub.unsubscribe();
    }
  }

  async addressAddEdit(addressId?: string, slidingEl?: IonItemSliding) {
    const modal = await this.modalCtrl.create({
      component: AddEditAddressComponent,
      cssClass: 'modal-lg',
      componentProps: { addressId, slidingEl }
    });

    modal.onDidDismiss().then((data) => {
      // console.log('MODAL DID DISMISS', data);
      console.log(this.addresses);
    });

    return modal.present();
  }

  updateDefaultAddress(id: string, slider) {
    Swal.fire({
      title: '🤔 É memo?',
      text: 'Tem certeza que quer mudar o endereço padrão, caubói?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#5a1f01',
      cancelButtonColor: '#ff4500',
      confirmButtonText: 'Mude, rapaiz!',
      cancelButtonText: 'Mió não',
      heightAuto: false
    }).then(r => {
      if (r.value) {
        this.addressService.updateDefaultAddress(id).subscribe(result => {
          if (result) {
            Toast.fire({
              icon: 'success',
              title: '🤠 Pronto, rapaiz!',
              text: 'Seu endereço padrão foi atualizado!',
              heightAuto: false
            });
            slider.closeOpened();
          }
        });
      }
    });
  }

  removeAddress(id: string) {
    Swal.fire({
      title: '🤔 É memo?',
      text: 'Tem certeza que quer de excluir esse endereço, caubói?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#5a1f01',
      cancelButtonColor: '#ff4500',
      confirmButtonText: 'Apague o endereço, Roy!',
      cancelButtonText: 'Melhor não',
      heightAuto: false
    }).then((result) => {
      if (result.value) {
        this.addressService.removeAddress(id).subscribe(res => {
          if (res) {
            Toast.fire({
              icon: 'success',
              title: '🤠 Pronto, rapaiz!',
              text: 'Seu endereço foi excluído!',
              heightAuto: false
            });
          } else {
            Toast.fire({
              icon: 'error',
              title: '😒 Deu ruim!',
              text: 'Não foi possível excluir o endereço! Tente novamente mais tarde!',
              heightAuto: false
            });
          }
        });
      }
    });
  }

  async slideItem(item: IonItemSliding, chevron) {
    const openAmount = await item.getOpenAmount();
    if (openAmount === 0) {
      item.open('end');
    } else {
      item.close();
    }
    const animation = createAnimation()
      .addElement(chevron.el)
      .duration(openAmount === 0 ? 500 : 500)
      .easing(openAmount === 0 ? 'ease-in' : 'ease-out')
      .fromTo(
        'transform',
        openAmount === 0 ? 'rotateY(0deg)' : 'rotateY(180deg)',
        openAmount === 0 ? 'rotateY(180deg)' : 'rotateY(0deg)'
      );

    animation.play();
  }
}
