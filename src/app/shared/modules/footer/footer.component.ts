import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {

  constructor() { }

  navigateExternalLink(url: string): void {
    window.open(url, '_blank');
  }

}
