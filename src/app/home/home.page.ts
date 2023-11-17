import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { CartService } from '../cart/cart.service';
import Product from '../products/models/product.model';
import { Toast } from '../shared/constants/toast.constant';
import ItemList from '../shared/models/itemlist.model';
import { HomeService } from './home.service';
import { dummyProduct } from '../products/constants/dummy-product.constant';
import { Router } from '@angular/router';
import { ProductService } from '../products/products.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  @ViewChild('mainSlider', { static: false }) slides;

  public slideOpts = {
    on: {
      beforeInit() {
        const swiper = this;
        swiper.classNames.push(`${swiper.params.containerModifierClass}fade`);
        const overwriteParams = {
          slidesPerView: 1,
          slidesPerColumn: 1,
          slidesPerGroup: 1,
          watchSlidesProgress: true,
          spaceBetween: 0,
          virtualTranslate: true,
        };
        swiper.params = Object.assign(swiper.params, overwriteParams);
        swiper.params = Object.assign(swiper.originalParams, overwriteParams);
      },
      setTranslate() {
        const swiper = this;
        const { slides } = swiper;
        for (let i = 0; i < slides.length; i += 1) {
          const $slideEl = swiper.slides.eq(i);
          const offset$$1 = $slideEl[0].swiperSlideOffset;
          let tx = -offset$$1;
          if (!swiper.params.virtualTranslate) { tx -= swiper.translate; }
          let ty = 0;
          if (!swiper.isHorizontal()) {
            ty = tx;
            tx = 0;
          }
          const slideOpacity = swiper.params.fadeEffect.crossFade
            ? Math.max(1 - Math.abs($slideEl[0].progress), 0)
            : 1 + Math.min(Math.max($slideEl[0].progress, -1), 0);
          $slideEl
            .css({
              opacity: slideOpacity,
            })
            .transform(`translate3d(${tx}px, ${ty}px, 0px)`);
        }
      },
      setTransition(duration) {
        const swiper = this;
        const { slides, $wrapperEl } = swiper;
        slides.transition(duration);
        if (swiper.params.virtualTranslate && duration !== 0) {
          let eventTriggered = false;
          slides.transitionEnd(() => {
            if (eventTriggered) { return; }
            if (!swiper || swiper.destroyed) { return; }
            eventTriggered = true;
            swiper.animating = false;
            const triggerEvents = ['webkitTransitionEnd', 'transitionend'];
            triggerEvents.forEach(el => {
              $wrapperEl.trigger(el);
            });
            // for (let i = 0; i < triggerEvents.length; i += 1) {
            //   $wrapperEl.trigger(triggerEvents[i]);
            // }
          });
        }
      },
    }
  };

  public dataLoaded = false;
  public brands: { _id: string, total: number }[] = [];
  public categories: { _id: string, categoryName: string }[] = [];
  public devWidth = this.platform.width();

  private currentBundle = [];
  public mostSold: any = this.devWidth > 475 ? [[dummyProduct, dummyProduct, dummyProduct]] : [[dummyProduct]];
  public onSale = this.devWidth > 475 ? [[dummyProduct, dummyProduct, dummyProduct]] : [[dummyProduct]];
  public new = this.devWidth > 475 ? [[dummyProduct, dummyProduct, dummyProduct]] : [[dummyProduct]];

  private bundleLimit = this.devWidth > 475 ? 3 : 1;

  public inCart: { [productId: string]: number } = {};
  private inCartSubs: Subscription;

  constructor(
    private homeService: HomeService,
    public platform: Platform,
    public cartService: CartService,
    private productService: ProductService,
    private router: Router
  ) { }

  ngOnInit() {
    this.inCartSubs = this.cartService.cartItens.subscribe(items => {
      if (items.length) {
        items.forEach(item => {
          this.inCart = { ...this.inCart, [item.productId]: item.quantity };
        });
      } else {
        this.inCart = {};
      }
    });

    this.homeService.fetchHomeData().subscribe(result => {
      this.brands = result.brands;
      this.categories = result.categories;

      this.mostSold = [];
      result.products.mostSold.forEach((product, index, array) => {
        const newItemList = new ItemList(
          product._id,
          product.productName,
          product.brand,
          product.unit,
          product.price,
          product.shippingWeight,
          product.skus,
          product.skus.length
        );

        const newProduct = new Product(
          newItemList,
          product.tags,
          product.category_id,
          product.netWeight,
          product.description
        );

        if (index % this.bundleLimit) {
          this.currentBundle.push(newProduct);
        } else {
          this.mostSold.push(this.currentBundle);
          this.currentBundle = [newProduct];
        }

        if (index + 1 === array.length) {
          this.mostSold.push(this.currentBundle);
        }
      });

      this.mostSold.shift();
      this.currentBundle = [];

      this.onSale = [];
      result.products.onSale.forEach((product, index, array) => {
        const newItemList = new ItemList(
          product._id,
          product.productName,
          product.brand,
          product.unit,
          product.price,
          product.shippingWeight,
          product.skus,
          product.skus.length
        );

        const newProduct = new Product(
          newItemList,
          product.tags,
          product.category_id,
          product.netWeight,
          product.description
        );

        if (index % this.bundleLimit) {
          this.currentBundle.push(newProduct);
        } else {
          this.onSale.push(this.currentBundle);
          this.currentBundle = [newProduct];
        }

        if (index + 1 === array.length) {
          this.onSale.push(this.currentBundle);
        }
      });

      this.onSale.shift();
      this.currentBundle = [];

      this.new = [];
      result.products.new.forEach((product, index, array) => {
        const newItemList = new ItemList(
          product._id,
          product.productName,
          product.brand,
          product.unit,
          product.price,
          product.shippingWeight,
          product.skus,
          product.skus.length
        );

        const newProduct = new Product(
          newItemList,
          product.tags,
          product.category_id,
          product.netWeight,
          product.description
        );

        if (index % this.bundleLimit) {
          this.currentBundle.push(newProduct);
        } else {
          this.new.push(this.currentBundle);
          this.currentBundle = [newProduct];
        }

        if (index + 1 === array.length) {
          this.new.push(this.currentBundle);
        }
      });

      this.new.shift();
      this.currentBundle = [];

      this.dataLoaded = true;
    });
  }

  ngOnDestroy() {
    this.inCartSubs.unsubscribe();
  }

  ionViewWillEnter() {
    this.autoPlay('start');
  }

  addToCart(cartItem: ItemList) {
    this.productService.clearAvailables();
    this.cartService.addToCart(cartItem).subscribe(_ => {
      Toast.fire('', `+ 1 ${cartItem.unit[0]} de ${cartItem.productName} no carrin!🤠`, 'success');
    });
  }

  autoPlay(mode: 'start' | 'stop') {
    if (mode === 'start') {
      this.slides.startAutoplay();
    } else {
      this.slides.stopAutoplay();
    }
  }


  slide(el: any, direction: 'right' | 'left') {
    if (direction === 'right') {
      el.slideNext();
    } else {
      el.slidePrev();
    }
  }

  highlightIcon(el, highlight: boolean) {
    highlight ? el.el.classList.add('hovered') : el.el.classList.remove('hovered');
  }

  tagEvent(e: Event) {
    this.router.navigate(['/produtos'], { queryParams: { 'tags[]': e } });
  }
}
