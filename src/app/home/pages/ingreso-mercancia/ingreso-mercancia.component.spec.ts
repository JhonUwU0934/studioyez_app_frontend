import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresoMercanciaComponent } from './ingreso-mercancia.component';

describe('DevolucionesComponent', () => {
  let component: IngresoMercanciaComponent;
  let fixture: ComponentFixture<IngresoMercanciaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IngresoMercanciaComponent]
    });
    fixture = TestBed.createComponent(IngresoMercanciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
