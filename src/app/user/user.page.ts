import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Platform, IonTabs, createAnimation } from '@ionic/angular';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})
export class UserPage implements OnInit {
  @ViewChild('inkbar', { static: false }) inkbar: ElementRef<HTMLDivElement>;
  public mobile: boolean;

  private activeTab?: HTMLElement;
  private selectedTab: HTMLElement;
  constructor(public platform: Platform) {
    this.mobile = platform.width() < 991;
  }

  ngOnInit() {
  }

  tabChange(tabsRef: IonTabs) {
    this.activeTab = (tabsRef.outlet as any).activatedView.element;
    for (const key in (tabsRef.tabBar as any).el.childNodes) {
      if (typeof (tabsRef.tabBar as any).el.childNodes[key] === 'object') {
        if ((tabsRef.tabBar as any).el.childNodes[key].tab === (tabsRef.outlet as any).activatedView.stackId) {
          this.selectedTab = (tabsRef.tabBar as any).el.childNodes[key];
          const dim = this.selectedTab.getBoundingClientRect();
          if (dim.width !== 0) {
            this.inkBarNavigateAnimation(dim.width, dim.x);
          }
        }
      }
    }
  }

  ionViewWillLeave() {
    this.propagateToActiveTab('ionViewWillLeave');
  }

  ionViewDidLeave() {
    this.propagateToActiveTab('ionViewDidLeave');
  }

  ionViewWillEnter() {
    this.propagateToActiveTab('ionViewWillEnter');
  }

  ionViewDidEnter() {
    this.propagateToActiveTab('ionViewDidEnter');
    if (this.selectedTab) {
      const dim = this.selectedTab.getBoundingClientRect();
      this.inkBarNavigateAnimation(dim.width, dim.x);
    }
  }

  private propagateToActiveTab(eventName: string) {
    if (this.activeTab) {
      this.activeTab.dispatchEvent(new CustomEvent(eventName));
    }
  }

  inkBarNavigateAnimation(width: number, offset: number) {
    // console.log(offset);
    const animation = createAnimation()
      .addElement(this.inkbar.nativeElement)
      .duration(500)
      .easing('cubic-bezier(0.35, 0, 0.25, 1)')
      .to('width', width + 'px')
      .to('left', this.mobile ? offset + 'px' : - 273.19 + offset + 'px');
    animation.play();
  }

}
