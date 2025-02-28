import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { UtilitiesService } from '../services/utilities.service';

@Directive({
  selector: '[appFormatoNumerico]'
})
export class FormatoNumericoDirective {

  private el = inject(ElementRef)
  
  constructor() {}

  @HostListener('input', ['$event'])
  onInput(event: any) {
    let numero = event.target.value;

    // Validar que solo contenga números y el punto decimal
    const numerosYDecimalValidos = /^[0-9.]*$/;
    if (!numerosYDecimalValidos.test(numero)) {
      const numeroLimpio = numero.replace(/[^0-9.]/g, '');
      event.target.value = numeroLimpio;
      return;
    }

    // Aplicar el formato de miles y millones
    let numeroFormateado = this.formatoMilesMillones(numero);

    event.target.value = numeroFormateado;
  }

  formatoMilesMillones(numero: string) {
     // Remover los puntos existentes para facilitar el formateo
     numero = numero.replace(/\./g, '');

     // Verificar si el número tiene decimales
     let tieneDecimales = false;
     if (numero.includes('.')) {
       tieneDecimales = true;
     }
 
     // Dividir el número en partes enteras y decimales (si existen)
     let partes = numero.split('.');
     let parteEntera = partes[0];
     let parteDecimal = partes[1] || '';
 
     // Agregar puntos para separar miles y millones
     parteEntera = parteEntera.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
 
     // Volver a unir las partes
     let numeroFormateado = parteEntera;
     if (tieneDecimales) {
       numeroFormateado += '.' + parteDecimal;
     }
 
     return numeroFormateado;
  }

}
