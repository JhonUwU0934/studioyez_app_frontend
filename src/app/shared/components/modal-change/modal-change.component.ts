import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { Subscription } from 'rxjs';
import { ModalChangeService } from '../../services/modal-change.service';
import { UtilitiesService } from '../../services/utilities.service';

@Component({
  selector: 'app-modal-change',
  templateUrl: './modal-change.component.html',
  styleUrls: ['./modal-change.component.scss']
})
export class ModalChangeComponent {

  private auth =  inject(AuthService)
  private utilities = inject(UtilitiesService)
  private modalChangeService =  inject(ModalChangeService)

  modalArray: any = {};

  constructor(){}

  $subscription!: Subscription;
  @ViewChild('container',{static: false})  container!: ElementRef;

  ngOnInit() {
    this.$subscription =  this.modalChangeService.getArrayObservable()
    .pipe(   
      )
    .subscribe((newArray) => {
      this.modalArray = newArray;
    });
  }

  ngOnDestroy(): void {
    if (this.$subscription) {
      this.$subscription.unsubscribe();
    }
  }

  formatoNumerico(event: any) {
    // Obtener el valor actual del input
    let numero = event.target.value;

    // Validar que solo contenga números y el punto decimal
    const numerosYDecimalValidos = /^[0-9.]*$/;
    if (!numerosYDecimalValidos.test(numero)) {
      // Si no contiene números o el punto decimal, elimina el contenido no válido
      const numeroLimpio = numero.replace(/[^0-9.]/g, '');
      event.target.value = numeroLimpio;
      return;
    }

    // Aplicar el formato de miles y millones
    let numeroFormateado = this.utilities.formatoMilesMillones(numero);

    event.target.value = numeroFormateado;
  }


}
