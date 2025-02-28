import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customNumber'
})
export class CustomNumberPipe implements PipeTransform {

  transform(value: number): string {
    // Convierte el número a una cadena y quita los decimales si existen
    const integerValue = Math.floor(value).toString();

    const parts = integerValue.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    if (parts[1]) {
      return `${integerPart}.${parts[1]}`;
    }

    return integerPart;
  }

}
