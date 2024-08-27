import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtro'
})
export class FiltroPipe implements PipeTransform {
  transform(value: any[], page: number = 0): any[] {
    const copy = [...value]; // Copia el array original
    return copy.slice(page, page+5);
  }
}
