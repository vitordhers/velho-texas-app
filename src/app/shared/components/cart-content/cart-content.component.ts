import { Component, OnInit, Output, EventEmitter, OnDestroy, Input } from '@angular/core';
import { FormArray, FormGroup, FormBuilder } from '@angular/forms';
import { CartService } from 'src/app/cart/cart.service';
import { ProductService } from 'src/app/products/products.service';
import { Subscription } from 'rxjs';
import { AvailabilityResponse } from 'src/app/products/models/availability-response.model';
import ItemList from '../../models/itemlist.model';
import { Toast } from '../../constants/toast.constant';
import { hideAll } from 'tippy.js';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cart-content',
  templateUrl: './cart-content.component.html',
  styleUrls: ['./cart-content.component.scss'],
})
export class CartContentComponent implements OnInit, OnDestroy {
  @Output() cart: EventEmitter<FormArray> = new EventEmitter<FormArray>();
  public form: FormGroup;
  public availability: AvailabilityResponse = {};
  public loaders = { fetchingPostalCode: false, placingOrder: false };
  public totalProducts: number;
  public totalWeight: number;
  private cartItensSub: Subscription;
  private totalSub: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private cartService: CartService,
    private productsService: ProductService,
  ) { }


  get f() { return this.form.controls; }
  get p() { return this.f.products as FormArray; }

  ngOnInit() {
    this.form = this.formBuilder.group({
      products: new FormArray([])
    });

    this.cartItensSub = this.cartService.cartItens.subscribe(itens => {
      if (itens) {
        this.productsService.getItensQuantity(itens).subscribe(availability => {
          this.p.clear();
          this.availability = availability;

          itens.forEach((item) => {
            if (this.availability[item.productId]) {
              if (
                this.availability[item.productId].price !== item.price ||
                this.availability[item.productId].quantity < item.quantity
              ) {
                let html;

                // tslint:disable-next-line: label-position
                errorBreak: if (this.availability[item.productId].quantity === 0) {
                  html = `checamos nosso estoque melhor e o produto <b>${item.productName}</b> não está mais disponível.
                      🙏 Agradecemos sua compreensão, Roy!`;
                  this.cartService.removeCartItem(item.productId).subscribe();
                  break errorBreak;
                } else if (this.availability[item.productId].quantity < item.quantity) {
                  this.populateCart(item, this.availability[item.productId].quantity);
                  this.cartService.updateProductQuantity(item.productId, this.availability[item.productId].quantity).subscribe();
                  html = `checamos nosso estoque melhor e o produto <b>${item.productName}</b>
                      não está mais disponível na quantidade desejada.
                      🙏 Agradecemos sua compreensão, Roy!`;
                  break errorBreak;
                } else if (this.availability[item.productId].price !== item.price) {
                  html = `checamos nosso estoque melhor e o preço do produto <b>${item.productName}</b>
                  não é mais R$ ${item.price.toFixed(2)}, mas sim R$ ${this.availability[item.productId].price.toFixed(2)}.
                  🙏 Agradecemos sua compreensão, Roy!`;
                  this.cartService.updateProductPrice(item.productId, this.availability[item.productId].price).subscribe();
                }
                Swal.fire({
                  title: '🤔 Oops...',
                  html,
                  icon: 'error',
                  confirmButtonColor: '#ff4500',
                  confirmButtonText: '😒 Entendo...',
                  heightAuto: false
                });
              } else {
                this.populateCart(item);
              }
            }
          });

          this.cart.emit(this.p);
        });
      }
    });

    this.totalSub = this.cartService.cartTotal.subscribe(total => { this.totalProducts = total; });
  }

  populateCart(item: ItemList, quantity: number = null) {
    if (item) {
      this.p.controls.push(
        this.formBuilder.group({
          productId: [item.productId],
          productName: [item.productName],
          brand: [item.brand],
          unit: [item.unit],
          shippingWeight: [item.shippingWeight],
          price: [item.price],
          quantity: quantity || [item.quantity]
        })
      );
    }
  }

  removeCartItem(productIndex: number) {
    hideAll();
    Swal.fire({
      title: '🤔 Tem certeza',
      html: `que deseja remover o item <b>${this.p.value[productIndex].productName}</b> do carrinho?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#5a1f01',
      cancelButtonColor: '#ff4500',
      confirmButtonText: 'Tira memo!',
      cancelButtonText: 'Não sô!',
      target: 'ion-split-pane',
      heightAuto: false
    }).then((result) => {
      if (result.value) {
        this.cartService.removeCartItem(this.p.value[productIndex].productId).subscribe(_ => { });

        Toast.fire({
          icon: 'success',
          title: 'Item removido com sucesso, Roy! 😉'
        });
      }
    });
  }

  changeQuantity(productIndex: number, changeType: string) {
    if (changeType === 'increment') {
      this.p.value[productIndex].quantity++;
    } else if (changeType === 'decrement') {
      this.p.value[productIndex].quantity--;
      if (this.p.value[productIndex].quantity === 0) {
        this.p.value[productIndex].quantity = 1;
      }
    }
    this.cartService.updateProductQuantity(this.p.value[productIndex].productId, this.p.value[productIndex].quantity).subscribe();
  }

  ngOnDestroy() {
    if (this.cartItensSub) {
      this.cartItensSub.unsubscribe();
    }
    if (this.totalSub) {
      this.totalSub.unsubscribe();
    }
  }

}
