import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConcederAcessoComponent } from './conceder-acesso.component';

describe('ConcederAcessoComponent', () => {
  let component: ConcederAcessoComponent;
  let fixture: ComponentFixture<ConcederAcessoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConcederAcessoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConcederAcessoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
