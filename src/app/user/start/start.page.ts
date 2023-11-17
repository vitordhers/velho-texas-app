import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Platform } from '@ionic/angular';

import { UserStart } from './models/user-start.model';
import { UserStatus } from '../../shared/enums/user-status.enum';
import { Toast } from '../../shared/constants/toast.constant';
import { UserService } from '../user.service';

@Component({
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
})
export class StartPage implements OnInit {

  public intro = false;
  public dataLoaded = false;

  public userData: UserStart;

  public userStatus = UserStatus;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    public platform: Platform
  ) { }

  ngOnInit() {
    if (this.route.snapshot.queryParams.aoba === true) {
      this.intro = true;
    }
  }

  ionViewWillEnter() {
    this.userService.fetchUserData().subscribe(loadedData => {
      if (loadedData) {
        this.dataLoaded = true;
        this.userData = loadedData;
      }
    });
  }

  ionViewWillLeave() {
    this.dataLoaded = false;
    this.userData = null;
  }

  unsubscribeAllNotifications() {
    this.userService.unsubscribeAll().subscribe(result => {
      if (result) {
        Toast.fire({
          icon: 'success',
          title: '🤠 Pronto, fi!',
          text: 'Você foi desinscrito de todas nossas listas de notificações!'
        });
        delete this.userData.communication;
        this.userData = { ...this.userData, communication: { mailcomm: false, wppcomm: false } };
      } else {
        Toast.fire({
          icon: 'error',
          title: '😒 Deu ruim!',
          text: 'Não foi possível desinscrever você. Tente novamente mais tarde!'
        });
      }
    });
  }

}
