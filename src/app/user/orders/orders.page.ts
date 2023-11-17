import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrderService } from './orders.service';
import { Order } from './models/order.model';
import { ModalController, Platform } from '@ionic/angular';
import { ViewOrderComponent } from './view-order/view-order.component';
import { Subscription } from 'rxjs';
import { OrderStatus } from './enums/order-status.enum';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements OnInit, OnDestroy {
  skip: number;
  loadedOrders: Order[];
  loadedOrdersSub: Subscription;
  routeSub: Subscription;
  dataLoaded = false;
  orderStatus = OrderStatus;
  autoLoader: boolean;
  private selectedOrder: Order;
  routerSubs: Subscription;
  disableLoader = false;


  constructor(
    private orderService: OrderService,
    private modalCtrl: ModalController,
    private route: ActivatedRoute,
    public platform: Platform
  ) { }

  arrayOne(n: number): any[] {
    return Array(n);
  }

  ngOnInit() {
    this.loadedOrdersSub = this.orderService.orders.subscribe(orders => {
      this.loadedOrders = orders;
    });

    this.routeSub = this.route.queryParams.subscribe(params => {
      if (params.hasOwnProperty('pedido')) {
        this.OrderView(params.pedido, false);
        this.autoLoader = false;
      } else {
        this.autoLoader = true;
      }
    });
  }

  ionViewWillEnter() {
    this.skip = 0;
    if (this.autoLoader) {
      this.loadResults();
    }
  }

  loadResults(event?) {
    this.orderService.fetchOrders(this.skip).subscribe(result => {
      this.skip = this.skip + result.length;
      this.dataLoaded = true;
      if (event) {
        event.target.complete();
      }
    });
  }

  ionViewWillLeave() {
    this.dataLoaded = false;
    this.loadedOrders = [];
  }

  ngOnDestroy() {
    if (this.loadedOrdersSub) {
      this.loadedOrdersSub.unsubscribe();
    }

    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  OrderView(orderNo: number, loaded: boolean): void {
    if (loaded) {
      this.orderService.getOrder(orderNo).subscribe(order => {
        this.selectedOrder = order;
        this.presentModal(false);
      });
    } else {
      this.orderService.fetchOrder(orderNo).subscribe(order => {
        this.selectedOrder = order;
        this.presentModal(true);
      });
    }
  }

  async presentModal(afterLoad: boolean) {
    const modal = await this.modalCtrl.create({
      component: ViewOrderComponent,
      cssClass: 'modal-lg',
      componentProps: {
        selectedOrder: this.selectedOrder
      }
    });

    if (afterLoad) {
      modal.onDidDismiss().then(() => {
        this.loadResults();
      });
    }

    return await modal.present();
  }

  navigateExternalLink(url: string): void {
    window.open(url, '_blank');
  }

}
