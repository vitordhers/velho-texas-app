import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RedefinepasswordPage } from './redefinepassword.page';

describe('RedefinepasswordPage', () => {
  let component: RedefinepasswordPage;
  let fixture: ComponentFixture<RedefinepasswordPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RedefinepasswordPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RedefinepasswordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
