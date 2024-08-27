import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevolucionesFormComponent } from './devoluciones-form.component';

describe('DevolucionesFormComponent', () => {
  let component: DevolucionesFormComponent;
  let fixture: ComponentFixture<DevolucionesFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DevolucionesFormComponent]
    });
    fixture = TestBed.createComponent(DevolucionesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
