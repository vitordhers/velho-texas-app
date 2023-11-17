import { Component, OnInit, Input } from '@angular/core';
import { Order } from '../models/order.model';
import { ModalController } from '@ionic/angular';
import { OrderService } from '../orders.service';
import { OrderStatus } from '../enums/order-status.enum';
import { Toast } from '../../../shared/constants/toast.constant';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-order',
  templateUrl: './view-order.component.html',
  styleUrls: ['./view-order.component.scss'],
})
export class ViewOrderComponent implements OnInit {
  @Input() selectedOrder: Order;
  @Input() modal: boolean;
  @Input() token: string;
  orderStatus = OrderStatus;
  constructor(
    private modalCtrl: ModalController,
    private ordersService: OrderService
  ) { }

  ngOnInit() { }

  dismissModal() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  navigateExternalLink(url: string): void {
    window.open(url, '_blank');
  }

  checkRepentance(): boolean {
    const deliveryTime = new Date(this.selectedOrder.freight.deliveryDate).getTime();
    const nowTime = new Date().getTime();
    const diff = (nowTime - deliveryTime) / (1000 * 3600 * 24);
    if (diff > 7) {
      return false;
    } else {
      return true;
    }
  }

  cancelOrder(orderNo: number, orderId: string) {
    Swal.fire({
      title: '😥 Tem certeza',
      html: `que deseja cancelar o Pedido Nº <b>${orderNo}</b>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#5a1f01',
      cancelButtonColor: '#ff4500',
      confirmButtonText: 'Cancela, fi!',
      cancelButtonText: 'Não sô!',
      heightAuto: false
    }).then((result) => {
      if (result.value) {
        this.ordersService.cancelOrder(orderId, this.token).subscribe(res => {
          Toast.fire({
            icon: 'success',
            title: 'Pedido cancelado com sucesso, Roy! 😉',
            heightAuto: false
          });
          if (this.modal) {
            this.modalCtrl.dismiss();
          }
        }, err => {
          console.log(err);
          Toast.fire({
            icon: 'error',
            title: 'Não foi possível cancelar seu pedido! 🤕',
            text: err,
            heightAuto: false
          });
          if (this.modal) {
            this.modalCtrl.dismiss();
          }
        });
      }
    });
  }

  parseDate(date: string) {
    return new Date(date);
  }
}
