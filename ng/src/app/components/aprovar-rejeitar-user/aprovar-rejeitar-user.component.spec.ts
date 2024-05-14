import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AprovarRejeitarUserComponent } from './aprovar-rejeitar-user.component';

describe('AprovarRejeitarUserComponent', () => {
  let component: AprovarRejeitarUserComponent;
  let fixture: ComponentFixture<AprovarRejeitarUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AprovarRejeitarUserComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AprovarRejeitarUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
