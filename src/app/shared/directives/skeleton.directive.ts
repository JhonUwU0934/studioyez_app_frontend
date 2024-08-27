import { Directive, Input, SimpleChanges, TemplateRef, ViewContainerRef } from '@angular/core';
import { SkeletonComponent } from '../components/skeleton/skeleton.component';
import { SkeletonType } from '../enums/skeleton-type';



@Directive({
  selector: '[Ske]'
})
export class SkeletonDirective {

  @Input('Ske') isLoading = false;
  @Input('SkeType') type = 'single';
  @Input('SkeWidth') width!: string;
  @Input('SkeHeight') height!: string;
  @Input('skeRepeat') size = 1;
  @Input('SkeWidthRect1') widthRect1!: string;
  @Input('SkeHeightRect1') heightRect1!: string;
  @Input('SkeWidthLabel')  widthLabel!: string;
  @Input('SkeHeightLabel') heightLabel!: string;
  @Input('SkeWidthInput')  widthInput!: string;
  @Input('SkeHeightInput') heightInput!: string;


  
  // widthLabel: string = '100%';
  // heightLabel: string = '20px';
  // widthInput: string = '100%';
  // heightInput: string = '20px';


  // Otras propiedades necesarias según el tipo de esqueleto

  constructor(
    private tpl: TemplateRef<any>, 
    private vcr: ViewContainerRef) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isLoading']) {
      this.vcr.clear();

      if (changes['isLoading'].currentValue) {
        const ref = this.vcr.createComponent(SkeletonComponent);

        if (this.type === 'single') {

          Object.assign(ref.instance, {
            type: this.type,
            widthRect1: this.widthRect1 ?? '100%',
            heightRect1: this.heightRect1 ?? '100%px', 
            width: this.width ?? '100%',
            height: this.height ?? '100%', 
          });
        
        } else if (this.type === 'multiple') {

          Array.from({ length: this.size }).forEach(() => {     
            Object.assign(ref.instance, {
              width: this.width === 'rand' ? `${Math.floor(Math.random() * (90 - 30 + 1)) + 30}%` : this.width,
              height: this.height,
            })
          })
         
        } else if (this.type === 'label-input') {

          Object.assign(ref.instance, {
            type: this.type,
            widthLabel: this.widthLabel ?? '100%',
            heightLabel: this.heightLabel ?? '20px',
            widthInput: this.widthInput ?? '100%',
            heightInput: this.heightInput ?? '20px',
          });
          
        }

      
      } else {
        this.vcr.createEmbeddedView(this.tpl);
      }
    }
  }

}
