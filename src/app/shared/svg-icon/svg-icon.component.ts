import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-svg-icon',
  templateUrl: './svg-icon.component.html',
  styleUrls: ['./svg-icon.component.scss'],
})

export class SvgIconComponent implements OnInit {
  private iconWidth = '16px';
  private iconHeight = '16px';

  private pathMap: string;

  constructor() { }

  ngOnInit() { }

}
