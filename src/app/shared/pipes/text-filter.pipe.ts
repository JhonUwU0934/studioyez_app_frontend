import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'textFilter'
})
export class TextFilterPipe implements PipeTransform {

  transform(value: string, limit: number = 2): string {
    // Dividir el texto en palabras
    const words = value.split(' ');

    

// Limitar la cantidad de palabras
    const limitedWords = words.slice(0, limit);

    // Capitalizar la primera letra si todas las palabras están en mayúsculas
    const capitalizedWords = limitedWords.map(word => {
      if (word === word.toUpperCase()) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return word;
    });

    const result = capitalizedWords.join(' ');

    return result.length < value.length ? result + '...' : result;
  }

}
