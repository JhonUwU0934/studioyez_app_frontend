import { Component, inject } from '@angular/core';
import { Subscription, finalize } from 'rxjs';
import { ButtonService } from 'src/app/shared/services/button.service';
import { EncryptationService } from 'src/app/shared/services/encryptation.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { loginModel } from '../../models/login.model';
import { formModel } from 'src/app/shared/models/form.model';
import { Router } from '@angular/router';
import { AbstractControl } from '@angular/forms';
import { modalModel } from 'src/app/shared/models/modal.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  arrayForm: formModel = {
    title: 'Iniciar sesión',
    text: 'Inicia sesión con los datos que ingresaste durante tu registro.',
    inputs: [
      {
        placeholder: 'Correo',
        formcontrolName: 'ID',
        type: 'emalil',
        id: 'Correo',
        name: 'Correo',
        icon: 'fa-solid fa-envelope'
      },
      {
        placeholder: 'Contraseña',
        formcontrolName: 'contraseña',
        type: 'password',
        id: 'Contraseña',
        name: 'Contraseña',
        icon: 'fa-solid fa-lock',
        isEyeChange: false
      },
    ],
    buttonText: 'Enviar',
    twoPassword: true,
    forgotPassword:true,
    onRecovery:() =>{
      this.router.navigateByUrl('/auth/recovery')    
    }
  };
  
  private loginSubscription!: Subscription;
  dataLogin!: loginModel;

  //servicios injectados
  public authService = inject(AuthService);
  public router = inject(Router);
  public encryptation = inject(EncryptationService);
  public modalService = inject(ModalService);
  public buttonService = inject(ButtonService);


  constructor() {}

  formContact(formdata: AbstractControl) {

    this.dataLogin = formdata.getRawValue();     

  
    this.loginSubscription = this.authService.login(this.dataLogin.ID, this.dataLogin.contraseña)
    .subscribe((resp) => {
      if (resp.success === true) {
     
        this.router.navigate(['/home']);
        this.buttonService.setCHange(false);

      } else if (resp.success == false) {

        this.buttonService.setCHange(false);

        const newModalData: modalModel = {
          viewModal: true,
          clickOutside: true,
          title: 'Atención',
          colorIcon: 'red',
          icon: 'fa-solid fa-triangle-exclamation',
          message: resp.message,
          onMethod: () => {
            newModalData.viewModal = false;
          },
          onMethodAction: () => {},
          loader: false,
          buttonText: 'Cerrar',
        };

        this.modalService.setArray(newModalData);
      } else {
  
        this.buttonService.setCHange(false);

        const newModalData: modalModel = {
          viewModal: true,
          clickOutside: true,
          title: 'Atención',
          colorIcon: 'red',
          icon: 'fa-solid fa-triangle-exclamation',
          message: 'En este momento estamos presentando fallas.',
          onMethod: () => {
            newModalData.viewModal = false;
          },
          onMethodAction: () => {},
          loader: false,
          buttonText: 'Cerrar',
        };

        this.modalService.setArray(newModalData);
      }
    }); 
    
  }

  ngOnDestroy(): void {
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
  }

}
