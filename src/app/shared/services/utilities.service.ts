import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilitiesService {

  constructor() {}

  //metodo que me permite psar un numero a formato de miles y millones
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

  //metodo que me permite tomar un arreeglo y devolverlo aleatoreo
  shuffle(array: any[]): any[] {
    const shuffledArray = [...array];

    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i],];
    }

    return shuffledArray;
  }
  
   //metodo para que solo se puedan ingresar numeros
   onlyNumbers(e: any) {
    let key = e.charCode;
    return key >= 48 && key <= 57;
  }

  //agrega puntos decimales a los numeros
    formatNumDecimal(num:number) {
      return num.toString().replace(/\D/g, "")
          .replace(/([0-9])([0-9]{3})$/, '$1.$2')
          .replace(/\B(?=(\d{3})+(?!\d)\.?)/g, ".");
    }

    //
    formatNumber(num:number) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    //agrega los puntos decimales a los numeros
    removeCharacter(num:number) {
        return num.toString().replace(/[^0-9]/g, "");
    }

    //le agrega puntos a los numeros
    formatearNumero(nStr: String) {
      nStr += '';
      let x = nStr.split('.');
      let x1 = x[0];
      let x2 = x.length > 1 ? ',' + x[1] : '';
      var rgx = /(\d+)(\d{3})/;
      while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + '.' + '$2');
      }
      return x1 + x2;
    }


}
