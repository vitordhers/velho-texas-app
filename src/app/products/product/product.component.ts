import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import ItemList from 'src/app/shared/models/itemlist.model';
import tippy, { Instance, Props } from 'tippy.js';
import Product from '../models/product.model';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent implements OnInit {
  @Input() product: Product;
  @Input() devWidth: number;
  @Input() inCart: any;
  @Input() maxTitleLength: number;
  @Input() dataLoaded: boolean;

  @Output() tagEvent = new EventEmitter<string>();
  @Output() addToCart = new EventEmitter<ItemList>();

  private tooltipInstance: any;
  public detailsShown = false;
  public hovered = false;
  constructor() { }

  ngOnInit() { }

  showTooltip(ref, productName: string) {
    if (productName.length > this.maxTitleLength) {
      if (!this.tooltipInstance) {
        this.tooltipInstance = tippy(ref, {
          content: productName,
          placement: 'top',
          trigger: 'manual',
          hideOnClick: false,
          appendTo: ref
        });
      }
      this.tooltipInstance.show();
    }
  }

  hideTooltip() {
    if (this.tooltipInstance) {
      this.tooltipInstance.hide();
    }
  }

  stopProp(e: Event, value: string): void {
    e.stopPropagation();
    this.tagEvent.emit(value);
  }

  addItem(e: Event): void {
    e.stopPropagation();
    const newItem = new ItemList(
      this.product.productId,
      this.product.productName,
      this.product.brand,
      this.product.unit,
      this.product.price,
      this.product.shippingWeight,
      this.product.skus,
      1
    );

    this.addToCart.emit(newItem);
  }

}
