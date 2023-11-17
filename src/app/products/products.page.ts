import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';
import { ProductService } from './products.service';
import Product from './models/product.model';
import { Subscription, BehaviorSubject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchParamsUser } from './models/search-params-user.model';
import tippy from 'tippy.js';
import { hideAll } from 'tippy.js';
import { QueryParams } from './models/query-params.model';
import { CartService } from '../cart/cart.service';
import ItemList from '../shared/models/itemlist.model';
import { Toast } from '../shared/constants/toast.constant';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})

export class ProductsPage implements OnInit, OnDestroy {
  @ViewChild('drawerContainer') drawer;
  tooltipInstances = {};

  private loader;
  public disableLoader = false;
  public dataLoaded = false;
  public loadedProducts: Product[];
  public results = 0;
  public devWidth = this.platform.width();

  public inCart: { [productId: string]: number } = {};

  private inCartSubs: Subscription;
  private productsSubscription: Subscription;
  private paramsSubscription: Subscription;
  private fetchProductsSubscription: Subscription;

  private currentSkip: number;
  public currentLimit = 12;

  public displayList = false;

  public preFiltersControls: {
    categories: { [key: string]: boolean },
    brands: { [key: string]: boolean },
    tags: { [key: string]: boolean }
  };
  public preFilters: { categories: string[], brands: string[], tags: string[] };
  filters: SearchParamsUser;

  public resultFilters: {
    categories: { _id: string, label: string, quantity: number }[],
    prices: { lower: number, upper: number },
    brands: { _id: string, label: string, quantity: number }[],
    tags: { label: string, category_index: string[], filters: { _id: string, label: string, quantity: number }[] }[]
  };

  public knobValues = {
    lower: null,
    upper: null
  };

  public sorting: 'relevance' | 'bigger' | 'smaller' = 'relevance';
  public sortOpts = {
    relevance: {
      title: 'Relevância',
      value: 'relevance'
    },
    bigger: {
      title: 'Maior Preço',
      value: 'bigger'
    },
    smaller: {
      title: 'Menor Preço',
      value: 'smaller'
    }
  };

  details: { [key: string]: boolean } = {};

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    public platform: Platform,
    private router: Router
  ) { }

  toggleDisplayList() {
    this.displayList = !this.displayList;
  }

  ngOnInit(): void {
    this.productsSubscription = this.productService.products.subscribe(products => {
      this.loadedProducts = products;
      if (products.length === 0) {
        this.details = {};
      } else {
        this.loadedProducts.map(product => {
          this.details = { ...this.details, [product.productId]: false };
        });
      }
    });

    this.inCartSubs = this.cartService.cartItens.subscribe(items => {
      if (items.length) {
        items.forEach(item => {
          this.inCart = { ...this.inCart, [item.productId]: item.quantity };
        });
      } else {
        this.inCart = {};
      }
    });

    this.paramsSubscription = this.route.queryParams.subscribe(params => {
      this.resetFilters(true);
      if (Object.keys(params).length) {
        for (const key in params) {
          if (params.hasOwnProperty(key)) {
            if (key === 'categorias[]' || key === 'marcas[]' || key === 'tags[]') {
              if (typeof params[key] === 'string') {
                this.filters[key] = [{ _id: params[key], label: '' }];
              } else {
                params[key].forEach(param => {
                  this.filters[key].push({ _id: param, label: '' });
                });
              }
            } else {
              this.filters[key] = params[key];
            }

          }
        }
      }

      this.query(params, this.currentSkip, this.currentLimit, this.sorting);
    });
  }

  prepareQuery(query: SearchParamsUser, skip: number, limit: number, sort: string) {
    const queryParams: QueryParams = {};

    for (const key in query) {
      if (query[key] && query[key].length) {
        if (key === 'categorias[]' || key === 'marcas[]' || key === 'tags[]') {
          query[key].forEach(param => {
            if (queryParams[key]) {
              queryParams[key].push(param._id);
            } else {
              queryParams[key] = [param._id];
            }
          });
        } else {
          queryParams[key] = query[key];
        }
      }
    }

    this.router.navigate(['/produtos'], { queryParams });
  }

  query(params: QueryParams, skip: number, limit: number, sort: string) {
    if (skip === 0) {
      this.dataLoaded = false;
      this.resultFilters = { categories: [], prices: { lower: null, upper: null }, brands: [], tags: [] };
    }

    this.productService.fetchProducts(skip, limit, sort, params).subscribe(results => {
      if (results.prices && results.prices.length) {
        this.resetFilters();
        this.resultFilters.prices = {
          upper: results.prices[0].max,
          lower: results.prices[0].min
        };
        this.knobValues = { ...this.resultFilters.prices };
      }

      if (results.brands && results.brands.length) {
        results.brands.forEach(brand => {
          this.preFiltersControls.brands = { ...this.preFiltersControls.brands, [brand._id]: false };

          this.resultFilters.brands.push({ _id: brand._id, label: brand._id, quantity: brand.total });
          const filterIndex = this.filters['marcas[]'].findIndex(filter => filter._id === brand._id);
          if (filterIndex !== -1) {
            this.filters['marcas[]'][filterIndex].label = brand._id;
          }
        });
        this.resultFilters.brands.sort((a, b) => `${a.label}(${a.quantity})`.length - `${b.label}(${b.quantity})`.length);
      }

      if (results.categories && results.categories.length) {
        results.categories.forEach(category => {
          this.results = this.results + category.total;
          this.preFiltersControls.categories = { ...this.preFiltersControls.categories, [category._id]: false };

          const temp = results.template.find(template => template._id === category._id);
          this.resultFilters.categories.push({ _id: temp._id, label: temp.categoryName, quantity: category.total });
          for (const key in temp.tags) {
            if (temp.tags.hasOwnProperty(key)) {
              const index = this.resultFilters.tags.findIndex(tag => tag.label === key);
              if (index === -1) {
                this.resultFilters.tags.push({ label: key, category_index: [temp._id + temp.tags[key]], filters: [] });
              } else {
                this.resultFilters.tags[index].category_index.push(temp._id + temp.tags[key]);
              }
            }
          }
        });
        this.resultFilters.categories.sort((a, b) => `${a.label}(${a.quantity})`.length - `${b.label}(${b.quantity})`.length);
      }

      if (results.tags && results.tags.length) {
        results.tags.forEach(resultTag => {
          this.preFiltersControls.tags = { ...this.preFiltersControls.tags, [resultTag.tag]: false };

          const indexA = this.resultFilters.tags.findIndex(tag => tag.category_index.includes(resultTag.category + resultTag.index));
          if (indexA !== -1) {
            this.resultFilters.tags[indexA].filters.push({ _id: resultTag.category, label: resultTag.tag, quantity: resultTag.total });
            this.resultFilters.tags[indexA].filters.sort((a, b) => `${a.label}(${a.quantity})`.length - `${b.label}(${b.quantity})`.length);

            if (this.filters['tags[]'].length) {
              const indexB = this.filters['tags[]'].findIndex(subtag => subtag._id === resultTag.tag);
              if (indexB !== -1) {
                this.filters['tags[]'][indexB].label = this.resultFilters.tags[indexA].label;
              }
            }
          }
        });
      }

      if (results.template && results.template.length && this.filters['categorias[]'].length) {
        results.template.forEach(category => {
          const filterIndex = this.filters['categorias[]'].findIndex(filter => filter._id === category._id);
          if (filterIndex !== -1) {
            this.filters['categorias[]'][filterIndex].label = category.categoryName;
          }
        });

      }

      if (results.products.length < this.currentLimit) {
        this.disableLoader = true;
      }
      if (this.loader) {
        this.loader.complete();
      }
      this.dataLoaded = true;
      this.currentSkip = this.currentSkip + results.products.length;
    });
  }

  showPopover(
    filter: 'categories' | 'prices' | 'brands' | 'tags',
    value: any,
    host: HTMLDivElement,
    content: HTMLDivElement,
    instance: string
  ) {
    if (!this.tooltipInstances[instance]) {
      this.tooltipInstances[instance] = tippy(host, {
        allowHTML: true,
        content,
        placement: 'right',
        trigger: 'manual',
        hideOnClick: false,
        theme: 'light',
        appendTo: this.drawer._element.nativeElement
      });
    }


    if (filter === 'categories' || filter === 'brands') {
      this.preFiltersControls[filter][value] = !this.preFiltersControls[filter][value];
      if (this.preFiltersControls[filter][value]) {
        this.preFilters[filter].push(value);
      } else {
        const index = this.preFilters[filter].findIndex(f => f === value);
        if (index !== -1) {
          this.preFilters[filter].splice(index, 1);
        }
      }
      if (this.preFilters[filter].length !== 0 && this.preFilters[filter].length !== this.resultFilters[filter].length) {
        this.tooltipInstances[instance].show();
      } else {
        this.tooltipInstances[instance].hide();
      }
    } else if (filter === 'prices') {
      if (value.lower === this.resultFilters.prices.lower && value.upper === this.resultFilters.prices.upper) {
        this.tooltipInstances[instance].hide();
      } else {
        this.tooltipInstances[instance].show();
      }
    } else if (filter === 'tags') {
      for (const key in this.preFiltersControls.tags) {
        if (this.preFiltersControls.tags.hasOwnProperty(key) && key !== value[0]) {
          this.preFiltersControls.tags[key] = false;
        }
      }
      this.preFilters.tags.splice(0, 1);
      this.preFiltersControls.tags[value[0]] = !this.preFiltersControls.tags[value[0]];
      if (this.preFiltersControls.tags[value[0]]) {
        this.preFilters.tags.push(value[0]);
      } else {
        const indexA = this.preFilters.tags.findIndex(f => f === value[0]);
        if (indexA !== -1) {
          this.preFilters.tags.splice(indexA, 1);
        }
      }

      const indexB = this.resultFilters.tags.findIndex(subfilter => subfilter.label === value[1]);
      if (this.preFilters.tags.length === 1) {
        this.tooltipInstances[instance].show();
      } else {
        this.tooltipInstances[instance].hide();
      }
    }
  }

  applyFilter(filter: 'pesquisa' | 'categorias[]' | 'precos[]' | 'marcas[]' | 'tags[]', values?: string[] | number[] | string) {
    if (typeof values === 'string') {
      if (filter === 'pesquisa') {
        this.filters = { ...this.filters, [filter]: values };
      }
    } else {
      if (filter !== 'pesquisa') {
        values.forEach(value => {
          if (filter === 'precos[]') {
            if (typeof value === 'number') {
              this.filters[filter].push(value);
            }
          } else {
            if (typeof value === 'string') {
              this.filters[filter].push({ _id: value, label: '' });
            }
          }
        });
      }
    }

    this.tooltipInstances = {};
    hideAll();
    this.currentSkip = 0;
    this.prepareQuery(this.filters, this.currentSkip, this.currentLimit, this.sorting);
  }

  resetFilters(full = false) {
    if (full) {
      this.filters = { pesquisa: null, 'categorias[]': [], 'precos[]': [], 'marcas[]': [], 'tags[]': [] };
      this.currentSkip = 0;
    }
    this.results = 0;
    this.disableLoader = false;
    this.preFiltersControls = { categories: {}, brands: {}, tags: {} };
    this.preFilters = { categories: [], brands: [], tags: [] };
    this.tooltipInstances = {};
  }

  removeFilter(subfilter?: 'pesquisa' | 'categorias[]' | 'precos[]' | 'marcas[]' | 'tags[]', value?: string | string[]) {
    if (subfilter) {
      if (value) {
        if ((subfilter === 'categorias[]' || subfilter === 'marcas[]' || subfilter === 'tags[]') && typeof value === 'string') {
          const index = this.filters[subfilter].findIndex(filter => filter._id === value);
          if (index !== -1) {
            this.filters[subfilter].splice(index, 1);
          }
        } else {
          this.filters[subfilter] = null;
        }
      } else {
        this.filters = { ...this.filters, [subfilter]: null };
      }
    } else {
      this.resetFilters(true);
    }

    this.currentSkip = 0;
    this.prepareQuery(this.filters, this.currentSkip, this.currentLimit, this.sorting);
  }

  adjustLimit(limit: number) {
    if (limit > this.currentLimit) {
      const dif = limit - this.currentLimit;
      this.prepareQuery(this.filters, this.currentSkip, dif, this.sorting);
      this.currentLimit = limit;
    } else if (limit < this.currentLimit) {
      const dif = this.currentLimit - limit;
      this.productService.spliceProducts(dif);
      this.currentSkip = Math.max(this.currentSkip - dif, 0);
      this.currentLimit = limit;
    } else {
      return;
    }
  }

  sortResults(sorting: 'relevance' | 'bigger' | 'smaller') {
    this.sorting = sorting;
    this.currentSkip = 0;
    this.prepareQuery(this.filters, this.currentSkip, this.currentLimit, this.sorting);
  }

  loadResults(event) {
    this.loader = event.target;
    this.prepareQuery(this.filters, this.currentSkip, this.currentLimit, this.sorting);
  }

  tooltip(element: HTMLDivElement, instance: string, message: string) {
    if (!this.tooltipInstances.hasOwnProperty(instance)) {
      this.tooltipInstances[instance] = tippy(element, {
        content: message,
        placement: 'top',
        trigger: 'manual',
        hideOnClick: true
      });
    }
    this.tooltipInstances[instance].show();
  }

  hideTooltip(instance: string) {
    if (this.tooltipInstances.hasOwnProperty(instance)) {
      this.tooltipInstances[instance].hide();
    }
  }

  stopProp(value: string) {
    this.resetFilters(true);
    this.applyFilter('tags[]', [value]);
  }

  ionViewDidLeave() {
    this.tooltipInstances = {};
  }

  addToCart(cartItem: ItemList) {
    this.productService.clearAvailables();
    this.cartService.addToCart(cartItem).subscribe(_ => {
      Toast.fire('', `+ 1 ${cartItem.unit[0]} de ${cartItem.productName} no carrin!🤠`, 'success');
    });
  }

  ngOnDestroy(): void {
    if (this.productsSubscription) {
      this.productsSubscription.unsubscribe();
    }
    if (this.fetchProductsSubscription) {
      this.fetchProductsSubscription.unsubscribe();
    }
    if (this.paramsSubscription) {
      this.paramsSubscription.unsubscribe();
    }
    if (this.inCartSubs) {
      this.inCartSubs.unsubscribe();
    }
  }


}
