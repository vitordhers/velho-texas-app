import { Component, OnInit, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import Product from '../models/product.model';
import { NavController, Platform } from '@ionic/angular';
import { ProductService } from '../products.service';
import { Subscription } from 'rxjs';
import { CartService } from 'src/app/cart/cart.service';
import ItemList from 'src/app/shared/models/itemlist.model';
import { Toast } from '../../shared/constants/toast.constant';


@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
})

export class ProductDetailPage implements OnInit, OnDestroy {
  @ViewChild('cartNavigation') template;
  @ViewChild('container', { read: ViewContainerRef }) container;
  public product: Product;

  private productSub: Subscription;
  private productInCartSub: Subscription;
  private paramMapSub: Subscription;
  private paramMapFetchSub: Subscription;

  public inCart: number;
  public dataLoaded = false;

  public cardContent = 'description';

  public productCounter = 1;

  public slideOpts = {
    initialSlide: 0,
    speed: 400
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private productsService: ProductService,
    private cartService: CartService,
    public platform: Platform
  ) { }

  ngOnInit() {
    this.paramMapSub = this.route.paramMap.subscribe(paramMap => {
      // if (!paramMap.has('productId')) {
      //   this.navCtrl.navigateBack('/produtos');
      //   return;
      // }

      this.productSub = this.productsService.getProduct(paramMap.get('productId')).subscribe(product => {
        this.product = product;
      });

      this.productInCartSub = this.cartService.getCartItem(paramMap.get('productId')).subscribe(result => {
        if (result) {
          if (Object.keys(result).length) {
            this.inCart = result.quantity;
          } else {
            this.inCart = 0;
          }
        }
      });
    });
  }

  ionViewDidEnter() {
    this.paramMapFetchSub = this.route.paramMap.subscribe(paramMap => {
      this.productsService.fetchProduct(paramMap.get('productId')).subscribe(result => {
        this.dataLoaded = true;
      });
    });
  }

  ngOnDestroy() {
    if (this.productSub) {
      this.productSub.unsubscribe();
    }
    if (this.productInCartSub) {
      this.productInCartSub.unsubscribe();
    }
  }

  goBack() {
    this.navCtrl.back();
  }

  add() {
    this.productCounter++;
    if (this.productCounter > this.product.skus.length) {
      this.productCounter = this.product.skus.length;
    }
  }

  remove() {
    this.productCounter--;
    if (this.productCounter <= 0) {
      this.productCounter = 1;
    }
  }

  segmentChanged($event) {
    this.cardContent = $event.detail.value;
  }

  addToCart(html: HTMLDivElement) {
    this.productsService.clearAvailables();
    const product = new ItemList(
      this.product.productId,
      this.product.productName,
      this.product.brand,
      this.product.unit,
      this.product.price,
      this.product.shippingWeight,
      this.product.skus,
      this.productCounter
    );
    this.cartService.addToCart(product).subscribe(result => {
      Toast.fire({
        icon: 'success',
        title: '🤠 Pronto, fi!',
        html
        // onBeforeOpen: () => {
        //   this.cloneTemplate();
        // }
      });
    });
  }

  // cloneTemplate() {
  //   const container = document.getElementById('container');
  //   container.append(this.template);
  // }


}
