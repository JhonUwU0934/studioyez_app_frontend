import { Directive, Input, SimpleChanges, TemplateRef, ViewContainerRef } from '@angular/core';
import { SkeletonRectComponent } from '../components/skeleton-rect/skeleton-rect.component';

@Directive({
  selector: '[skeleton]'
})
export class SkeletonRectangleDirective {

  // Definir propiedades de entrada con valores predeterminados
  @Input('skeleton') isLoading = false; // Indica si se debe mostrar el esqueleto o no
  @Input('skeletonRepeat') size = 1; // Cantidad de elementos de esqueleto a mostrar
  @Input('skeletonWidth') width!: string; // Ancho de los elementos de esqueleto
  @Input('skeletonHeight') height!: string; // Alto de los elementos de esqueleto
  @Input('skeletonClassName') className!: string; // Clase CSS para los elementos de esqueleto
  
  // Constructor de la directiva
  constructor(
    private tpl: TemplateRef<any>, // Referencia a la plantilla donde se aplicará la directiva
    private vcr: ViewContainerRef) { } // Referencia al contenedor de la vista donde se renderizará el contenido

  // Método que se ejecuta cuando cambian las propiedades de entrada
  ngOnChanges(changes: SimpleChanges) {
    // Verificar si la propiedad 'isLoading' ha cambiado
    if (changes['isLoading']) {
      this.vcr.clear(); // Limpiar cualquier contenido previo en el contenedor de la vista

      // Comprobar si isLoading es verdadero (carga en progreso)
      if (changes['isLoading'].currentValue) {
        // Generar elementos de esqueleto según la cantidad especificada en 'size'
        Array.from({ length: this.size }).forEach(() => {
          // Crear un componente SkeletonRectComponent de manera dinámica
          const ref = this.vcr.createComponent(SkeletonRectComponent);
       
          // Asignar propiedades al componente de esqueleto creado dinámicamente
          Object.assign(ref.instance, {
            // Si 'skeletonWidth' es 'rand', generar un ancho aleatorio entre 30% y 90%, de lo contrario, usar el ancho especificado
            // width: this.width === 'rand' ? `${Math.random() * (90 - 30) + 30}%` : this.width,
            width: this.width === 'rand' ? `${Math.floor(Math.random() * (90 - 30 + 1)) + 30}%` : this.width,
            height: this.height, // Usar el alto especificado
            className: this.className // Usar la clase CSS especificada
          });
        });
      } else {
        // Si isLoading es falso (carga completada), mostrar la plantilla original
        this.vcr.createEmbeddedView(this.tpl); // Crear una vista incrustada usando la plantilla original
      }
    }
  }
}
