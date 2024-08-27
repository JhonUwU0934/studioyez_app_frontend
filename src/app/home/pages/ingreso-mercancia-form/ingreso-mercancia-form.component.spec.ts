import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresoMercanciaFormComponent } from './ingreso-mercancia-form.component';

describe('IngresoMercanciaFormComponent', () => {
  let component: IngresoMercanciaFormComponent;
  let fixture: ComponentFixture<IngresoMercanciaFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IngresoMercanciaFormComponent]
    });
    fixture = TestBed.createComponent(IngresoMercanciaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
