import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { Platform, IonButton, Animation, createAnimation } from '@ionic/angular';
import { SearchService } from './search.service';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription, EMPTY } from 'rxjs';
import { QuickProducts } from '../../../products/models/quick-search-products.model';
import { distinctUntilChanged, debounceTime, switchMap, map, tap, skip } from 'rxjs/operators';
import { AuthService } from '../../../auth/auth.service';
import { CartService } from '../../../cart/cart.service';
import tippy from 'tippy.js';
import { hideAll } from 'tippy.js';
import Swal from 'sweetalert2';
import { Notificate } from './models/notificate.model';

@Component({
  selector: 'app-searchtoolbar',
  templateUrl: './search-toolbar.page.html',
  styleUrls: ['./search-toolbar.page.scss']
})
export class SearchToolbarPage implements OnInit, OnDestroy {
  @ViewChild('searchbar') searchbar;
  @Input() cartIconDisabled: boolean;
  searchValue = new BehaviorSubject<[string, boolean]>(null);
  focused = false;
  searchSub: Subscription;
  preSearchResults: number;

  productsSub: Subscription;
  loadingProducts = false;
  products: QuickProducts[] = [];

  cartSub: Subscription;

  notificationNumberSub: Subscription;
  notificationSub: Subscription;

  loadingNotifications = false;
  notificationsLoader;
  disableNotificationsLoader = false;
  notifications: Notificate[] = [];
  notificationsTotal: number;
  notificationsStart = 0;
  disableNotificationLoader = false;

  totalCartItems: number;

  devWidth: number;
  authSub: Subscription;
  authenticated: boolean;

  tooltipInstances: { [key: string]: any } = {};

  constructor(
    public platform: Platform,
    private searchService: SearchService,
    private router: Router,
    private authService: AuthService,
    public cartService: CartService
  ) {
    this.devWidth = this.platform.width();
  }

  get search() {
    return this.searchValue.asObservable();
  }

  ngOnInit() {
    this.searchSub = this.search.pipe(
      skip(1),
      tap(([search, nav]) => {
        if (!search || /^\s*$/.test(search)) {
          this.focused = false;
          this.loadingProducts = false;
        } else {
          if (nav) {
            const queryParams = { pesquisa: search };
            this.router.navigate(['/produtos'], {
              queryParams
            });
          }
          this.focused = (!nav) ? true : false;
          this.loadingProducts = (!nav) ? true : false;
        }
      }),
      map(([search, _]) => {
        if (search) {
          return search;
        } else {
          return '';
        }
      }),
      distinctUntilChanged((a, b) => a.split(' ').join('') === b.split(' ').join('')),
      debounceTime(600),
      map(search => {
        if (!search || /^\s*$/.test(search)) {
          return null;
        } else {
          return encodeURIComponent(search);
        }
      }),
      switchMap(search => {
        if (search) {
          return this.searchService.quickSearch(search);
        } else {
          return EMPTY;
        }
      })
    ).subscribe(result => {
      if (result && result.total[0]) {
        this.preSearchResults = result.total[0].total;
      }
    });

    this.productsSub = this.searchService.products.subscribe(products => {
      this.products = products;
      this.loadingProducts = false;
    });

    this.authSub = this.authService.userIsAuthenticated.subscribe(auth => {
      this.authenticated = auth;
    });

    this.cartSub = this.cartService.cartItens.subscribe(cartItems => {
      this.totalCartItems = cartItems.length;
    });

    this.notificationNumberSub = this.authService.notifications.subscribe(notificationsTotal => {
      this.notificationsTotal = notificationsTotal;
      this.disableNotificationsLoader = false;
    });

    this.notificationSub = this.searchService.notifications.subscribe(notifications => {
      this.notifications = notifications;
    });

  }

  ngOnDestroy() {
    if (this.productsSub) {
      this.productsSub.unsubscribe();
    }
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
  }

  searchChange(event) {
    const search = event.target.value;
    if (!search || /^\s*$/.test(search)) {
      this.searchService.emptyProducts();
    }
    this.searchValue.next([search, false]);
  }

  doSearch() {
    this.searchValue.next([this.searchbar.el.value, true]);
  }

  show(event) {
    if (this.devWidth < 768) {
      // FLIP
      // first
      const first = this.searchbar.el.parentElement.parentElement.getBoundingClientRect();
      // last
      this.searchbar.el.parentElement.parentElement.classList.add('animate-final');
      this.searchbar.el.parentElement.parentElement.nextElementSibling.classList.add('animate-shrink');
      this.searchbar.el.parentElement.parentElement.previousElementSibling.classList.add('animate-shrink');
      const last = this.searchbar.el.parentElement.parentElement.getBoundingClientRect();

      // invert
      const invert = {
        x: first.left - last.left,
        y: first.top - last.top,
        scaleX: first.width / last.width,
        scaleY: first.height / last.height
      };
      // play

      const expandAnimation: Animation = createAnimation()
        .addElement(this.searchbar.el.parentElement.parentElement)
        .duration(200)
        .easing('ease-in-out')
        .beforeStyles({
          ['transform-origin']: '0 0'
        })
        .fromTo(
          'transform',
          `translate(${invert.x}px, ${invert.y}px) scale(${invert.scaleX}, ${invert.scaleY})`,
          `translate(0, 0) scale(1, 1)`
        );
      const textOpacity: Animation = createAnimation()
        .addElement(this.searchbar.el)
        .duration(300)
        .easing('ease-in-out')
        .fromTo(
          '--placeholder-opacity',
          `0`,
          `0.5`
        );
      expandAnimation.play();
      textOpacity.play();
    }


    if (!this.focused) {
      this.focused = true;
      this.loadingProducts = false;
    }
  }

  hide() {
    console.log('HIDE');
    // FLIP
    // first
    const first = this.searchbar.el.parentElement.parentElement.getBoundingClientRect();
    // last
    this.searchbar.el.parentElement.parentElement.classList.remove('animate-final');
    this.searchbar.el.parentElement.parentElement.nextElementSibling.classList.remove('animate-shrink');
    this.searchbar.el.parentElement.parentElement.previousElementSibling.classList.remove('animate-shrink');
    const last = this.searchbar.el.parentElement.parentElement.getBoundingClientRect();
    // invert
    const invert = {
      x: first.left - last.left,
      y: first.top - last.top,
      scaleX: first.width / last.width,
      scaleY: first.height / last.height
    };
    // play

    const expandAnimation: Animation = createAnimation()
      .addElement(this.searchbar.el.parentElement.parentElement)
      .duration(200)
      .easing('ease-in-out')
      .beforeStyles({
        ['transform-origin']: '0 0'
      })
      .fromTo(
        'transform',
        `translate(${invert.x}px, ${invert.y}px) scale(${invert.scaleX}, ${invert.scaleY})`,
        `translate(0, 0) scale(1, 1)`
      );
    const textOpacity: Animation = createAnimation()
      .addElement(this.searchbar.el)
      .duration(300)
      .easing('ease-in-out')
      .fromTo(
        '--placeholder-opacity',
        `0`,
        `0.5`
      );

    expandAnimation.play();
    textOpacity.play();

    setTimeout(() => {
      this.focused = false;
      this.loadingProducts = false;
    }, 100);

  }

  popover(
    host: IonButton,
    content: any,
    instance: string
  ) {

    if (this.authenticated && instance === 'user') {
      hideAll();
      this.router.navigate(['/usuario/painel']);
    } else {
      if (instance === 'notifications' && this.notificationsStart === 0) {
        this.fetchNotifications();
      }
      if (!this.tooltipInstances[instance]) {
        this.tooltipInstances[instance] = tippy((host as any).el, {
          allowHTML: true,
          content,
          placement: instance === 'notifications' ? 'bottom-start' : 'bottom-end',
          trigger: 'manual',
          hideOnClick: instance === 'user' ? true : false,
          theme: 'light',
          onMount(popper) {
            popper.popperInstance.forceUpdate();
          }
        });
      }

      for (const key in this.tooltipInstances) {
        if (key !== instance) {
          this.tooltipInstances[key].hide();
        }
      }

      if (this.tooltipInstances[instance].state.isVisible) {
        this.tooltipInstances[instance].hide();
      } else {
        this.tooltipInstances[instance].show();
        if (instance === 'notifications') {
          this.tooltipInstances.notifications.popperInstance.update();
        }
      }
    }
  }

  showTooltip(
    host: HTMLElement,
    content: string,
    instance: string
  ) {
    if (!this.tooltipInstances[instance]) {
      this.tooltipInstances[instance] = tippy(host, {
        content,
        placement: 'left',
        trigger: 'manual',
        hideOnClick: true
      });
    }
    this.tooltipInstances[instance].show();
  }

  hideTooltip(instance: string) {
    if (this.tooltipInstances[instance]) {
      this.tooltipInstances[instance].hide();
    }
  }

  confirmEmptyCart() {
    Swal.fire({
      title: '🤔 É memo?',
      text: 'Tem certeza que deseja esvaziar o carrinho, Roy?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#5a1f01',
      cancelButtonColor: '#ff4500',
      confirmButtonText: 'Tira memo!',
      cancelButtonText: 'Melhor não',
      heightAuto: false
    }).then((result) => {
      if (result.value) {
        this.cartService.storeCart([]);
      }
    });
  }

  hideAll() {
    hideAll();
  }

  loadNotifications(event) {
    this.notificationsLoader = event.target;
    this.fetchNotifications(true);
  }

  fetchNotifications(scrollLoaded = false) {
    this.loadingNotifications = true;
    this.searchService.fetchNotifications(this.notificationsStart).subscribe(notifications => {
      this.notificationsStart = this.notificationsStart + notifications;
      this.loadingNotifications = false;

      if (this.tooltipInstances.hasOwnProperty('notifications')) {
        this.tooltipInstances.notifications.popperInstance.update();
        if (this.notificationsLoader && scrollLoaded) {
          this.notificationsLoader.complete();
        }
      }

      if (notifications < 10) {
        this.disableNotificationsLoader = true;
      }
    });
  }

  placeholder(): string {
    if (this.devWidth < 475) {
      if (this.focused) {
        return '... que nóis vê se tem';
      } else {
        return 'Busca...';
      }
    } else {
      return 'Busca que nóis vê se tem';
    }
  }

}
