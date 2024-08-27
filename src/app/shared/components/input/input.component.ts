import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { inputModel } from '../../models/input.model';
import { UtilitiesService } from '../../services/utilities.service';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
})
export class InputComponent implements OnInit {

  @Input() form!: FormGroup;
  @Input() arrayInput!: inputModel;
  puntoAgregadoPorFuncion: boolean = false;

  constructor(private utilities: UtilitiesService){}

  ngOnInit(): void {}

  formatoNumerico(event: any) {
    // Obtener el valor actual del input
    let numero = event.target.value;

     // Validar que solo contenga números y el punto decimal
     const numerosYDecimalValidos = /^[0-9.]*$/;
     if (!numerosYDecimalValidos.test(numero)) {
       // Si no contiene números o el punto decimal, elimina el contenido no válido
       this.form.get(this.arrayInput.controlName)?.patchValue(numero.replace(/[^0-9.]/g, ''));
       return;
     }

    // Aplicar el formato de miles y millones
    let numeroFormateado = this.utilities.formatoMilesMillones(numero);

    this.form.get(this.arrayInput.controlName)?.patchValue(numeroFormateado);

  }

  onlyNumbers(event: any){
    // Obtener el valor actual del input
    let numero = event.target.value;

    //Validar que solo contenga números, el punto decimal, espacios y paréntesis
    const numerosYDecimalValidos = /^[0-9 .()+]*$/;
    if (!numerosYDecimalValidos.test(numero)) {
      // Si no contiene números o el punto decimal, elimina el contenido no válido
      this.form.get(this.arrayInput.controlName)?.patchValue(numero.replace(/[^0-9 .()+]/g, ''));
      return
    }

  }

}
