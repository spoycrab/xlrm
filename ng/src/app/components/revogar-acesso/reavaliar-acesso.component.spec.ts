import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevogarAcessoComponent } from './reavaliar-acesso.component';

describe('RevogarAcessoComponent', () => {
  let component: RevogarAcessoComponent;
  let fixture: ComponentFixture<RevogarAcessoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevogarAcessoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RevogarAcessoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
