import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { formModel } from 'src/app/shared/models/form.model';
import { registerModel } from '../../models/register.model';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ButtonService } from 'src/app/shared/services/button.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { AbstractControl } from '@angular/forms';
import { modalModel } from 'src/app/shared/models/modal.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  arrayForm: formModel = {
    title: 'Regístrate',
    text: '',
    selects: [
      {
        icon: 'fa-solid fa-address-card',
        labelExists: true,
        name: 'Tipo de documento',
        placeholder: 'Tu tipo de documento',
        controlName: 'checkID',
        selects: [
          {
            value: 2,
            name: 'Cédula de ciudadania',
          },
          {
            value: 1,
            name: 'Cédula de extranjería',
          },
        ],
      }
    ], 
    inputs: [
      {
        placeholder: 'Numero de documento',
        formcontrolName: 'ID',
        type: 'text',
        id: 'Correo',
        name: 'Correo',
        icon: 'fa-solid fa-envelope'
      },
      {
        placeholder: 'password',
        formcontrolName: 'contraseña',
        type: 'password',
        id: 'Contraseña',
        name: 'Contraseña',
        icon:'fa-solid fa-lock',
        isEyeChange: false,
        validations: [
        {
          validErrors: 'minlength',
          descriptErrors: 'minimo 8 caracteres',
        },
        {
          validErrors: 'pattern',
          descriptErrors: 'ser numérica',
        }]
      },
      {
        placeholder: 'Confirmar password',
        formcontrolName: 'contraseña_two',
        type: 'password',
        id: 'Contraseña_two',
        name: 'Contraseña_two',
        icon:'fa-solid fa-lock',
        isEyeChange: false,
      },
    ],
    checks:[
      {
        label:'Acepto las políticas de privacidad y tratamientos de datos de la compañía.', 
        formcontrolName:'term'
      }
    ],
    buttonText: 'Enviar',
    twoPassword: true, //esta variable es para mostrar o no las validaciones de contraseña, las de validations que esta arriba
    forgotPassword:false,
    onRecovery:() =>{
       
    }
  };

  private registerSubscription!: Subscription;
  dataRegister!: registerModel;

  constructor(
  private authservice : AuthService,
  private router: Router,
  public buttonService: ButtonService,
  private modalService: ModalService,
  ){}

  formContact(formdata: AbstractControl) {

    // this.dataRegister = formdata.getRawValue();
      
    // this.registerSubscription = this.authservice
    // .register(this.dataRegister.checkID, this.dataRegister.ID, this.dataRegister.contraseña, this.dataRegister.contraseña_two, this.dataRegister.term)
    //   .subscribe((success) => {
    //     if (success === true) {
          
    //       this.router.navigate(['/home']);
    //       this.buttonService.setCHange(false);

    //       const newModalData: modalModel = {
    //         viewModal: true,
    //         title: 'Bienvenido!',
    //         colorIcon: 'green',
    //         icon: 'fa-solid fa-triangle-exclamation',
    //         message: 'Ya te encuentras registrado!',
    //         onMethod:() =>{
    //           newModalData.viewModal = false;
    //         },
    //         onMethodAction: () => {
            
    //         },
    //         loader: false,
    //         buttonText: 'Cerrar',
    //       };
  
    //       setTimeout(() => {
    //         this.modalService.setArray(newModalData);
    //       }, 1000);

    //     } else {
    //       this.buttonService.setCHange(false);
  
    //       const newModalData: modalModel = {
    //         viewModal: true,
    //         title: 'Atención',
    //         colorIcon: 'red',
    //         icon: 'fa-solid fa-triangle-exclamation',
    //         message: success,
    //         onMethod:() =>{
    //           newModalData.viewModal = false;
    //         },
    //         onMethodAction: () => {
            
    //         },
    //         loader: false,
    //         buttonText: 'Cerrar',
    //       };
  
    //       this.modalService.setArray(newModalData);
    //     }
    //   });
    
  }

  ngOnDestroy(): void {
    if (this.registerSubscription) {
      this.registerSubscription.unsubscribe();
    }
  }

}
