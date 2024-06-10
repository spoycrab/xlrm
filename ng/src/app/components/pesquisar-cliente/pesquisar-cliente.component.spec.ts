import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PesquisarClienteComponent } from './pesquisar-cliente.component';

describe('PesquisarClienteComponent', () => {
  let component: PesquisarClienteComponent;
  let fixture: ComponentFixture<PesquisarClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PesquisarClienteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PesquisarClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
