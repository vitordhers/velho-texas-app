import { Component, OnInit, OnDestroy } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AuthService } from './auth/auth.service';
import { Router, RouterEvent, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private panesSub: Subscription;
  private authSub: Subscription;
  private previousAuthState = false;

  public splitPaneDisabled = true;
  public splitPaneVisible = false;
  public headerVisible = true;
  public cartIconDisabled = false;

  constructor(
    public platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private router: Router,
    public authService: AuthService,
  ) {
    this.initializeApp();
  }


  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  ngOnInit() {
    this.authSub = this.authService.userIsAuthenticated.subscribe(isAuthenticated => {
      if (!isAuthenticated && this.previousAuthState !== isAuthenticated) {
        this.router.navigateByUrl('/entrar');
      }
      this.previousAuthState = isAuthenticated;
    });

    this.panesSub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        if (/^\/usuario/g.test(e.url)) {
          this.splitPaneDisabled = false;
          this.headerVisible = false;
        } else {
          this.headerVisible = true;
          this.splitPaneDisabled = true;
          if (/^\/carrinho/g.test(e.url)) {
            this.cartIconDisabled = true;
          } else {
            this.cartIconDisabled = false;
          }
        }
      });
  }

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
    if (this.panesSub) {
      this.panesSub.unsubscribe();
    }
  }

  isSplitPaneVisible(e: CustomEvent) {
    this.splitPaneVisible = e.detail.visible;
  }

  onLogout() {
    this.authService.logout();
    this.router.navigateByUrl('/entrar');
    this.splitPaneDisabled = true;
  }
}
