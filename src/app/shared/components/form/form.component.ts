import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { formModel } from '../../models/form.model';
import { ValidatorsService } from '../../validators/validators.service';


@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent {

  @Input() arrayForm!: formModel;
  @Output() formDataEvent = new EventEmitter<AbstractControl>();
  myForm!: FormGroup;
  load_spinner: boolean = false;
  isEyeChange:boolean = false;


  constructor(
    private readonly fb: FormBuilder,
    private validators: ValidatorsService
  ) {}

  ngOnInit(): void {
    this.myForm = this.initFormLogin(this.arrayForm);
  }

  // Esta función recibe un objeto "formModel" como argumento y devuelve un "FormGroup" de Angular.
initFormLogin(form: formModel): FormGroup {
  const formGroup: any = {}; 
  let valids: any;  // Creamos un objeto vacío donde almacenaremos los valores de formulario y sus validaciones.
  let hasTwoPasswords = false;

  form.selects?.forEach((select) => {
    formGroup[select.controlName] = ['',Validators.required]
  });

  form.checks?.forEach((check) => {
    formGroup[check.formcontrolName] = ['',Validators.required]
  });

  const validationMap: any = {  // Este es un objeto de validación que se utiliza para asignar las validaciones apropiadas a cada tipo de entrada.
    'text': [Validators.required],  // Si el tipo de entrada es "text", entonces es requerido.
    'email': [Validators.required, Validators.email],  // Si el tipo de entrada es "email", entonces es requerido y debe ser una dirección de correo electrónico válida.
    'number': [Validators.required],  // Si el tipo de entrada es "number", entonces es requerido.
    'password': [  // Si el tipo de entrada es "password", entonces es requerido, debe tener al menos 8 caracteres y debe contener al menos un número.
      Validators.required
    ]
  };
  // Iteramos sobre cada objeto "input" en la matriz "inputs" del objeto "form" que se nos pasó como argumento.
  form.inputs?.forEach((input) => {
    valids = validationMap[input.type];  // Aquí obtenemos las validaciones apropiadas para este tipo de entrada, desde el objeto "validationMap".
    formGroup[input.formcontrolName] = ['', valids];  // Aquí asignamos un objeto que contiene un valor inicial vacío y las validaciones correspondientes para este campo de entrada.
    if (input.formcontrolName === 'contraseña_two') { //aqui detectamos si tenemos segunda contraseña para asi hacer la validacion de contraseñas 1 y 2
      hasTwoPasswords = true;
    }
  });

  let globalValidators: any = {};

  if (hasTwoPasswords) {
    globalValidators = {
      validators: [
        this.validators.controlValuesAreEqual('contraseña','contraseña_two')
      ]
    };
  }
  
  return this.fb.group(formGroup,globalValidators);  // Devolvemos el "FormGroup" construido a partir del objeto "formGroup" que hemos creado.
  
}


  onSubmit() {
    const formData = this.myForm.getRawValue(); 
    this.formDataEvent.emit(this.myForm);
  }

  eyeChange(item:any){
    item.isEyeChange = !item.isEyeChange;
  }

}
