import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environments } from 'src/environments/environments';
import { Router } from '@angular/router';
import { ApiPostService } from 'src/app/shared/services/api-post.service';
import { usuarioModel } from '../models/usuario.model';
import { BehaviorSubject, Observable, catchError, map, of, pipe, retry, tap } from 'rxjs';
import { ModalService } from 'src/app/shared/services/modal.service';
import { modalModel } from 'src/app/shared/models/modal.model';
import { ButtonService } from 'src/app/shared/services/button.service';
import { ApiGetService } from '../../shared/services/api-get.service';

import jwt_decode from 'jwt-decode';
import { EncryptationService } from 'src/app/shared/services/encryptation.service';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private baseUrl: string = environments.baseUrl;
  private _usuario!: usuarioModel;
  private _usuarioSubject = new BehaviorSubject<any>(this._usuario);


  constructor(
    private apiPost: ApiPostService,
    public  buttonService: ButtonService,
    private router: Router,
    public  encryptation: EncryptationService,
    private modalService: ModalService
  ) {}

  set setUsuario(usuario: any) {
    this._usuarioSubject.next(usuario);
  }

  get getUsuario(): Observable<any> {
    return this._usuarioSubject.asObservable();
  }

  register(name: string,email: string,password: string,password_confirmation: string) {

    const UrlApi = `${this.baseUrl}/api/register`;

    const paramsBody = {
      name: name,
      email: email,
      password: password,
      password_confirmation: password_confirmation
    };

    const headers = {};

    return this.apiPost.getDebtInfo(UrlApi, paramsBody, headers)
    .pipe(
      tap(resp => {

          const amount:number = 700000;
          const sales:number = 700000;
          const pays:number = 700000;
          const total:number = 700000;

          this._usuario = {
            token: resp.token,
            email: resp.user?.email!,
            id: resp.user?.id!,
            name: resp.user?.name!,
            amount:resp.monto_diario,
            bills:resp.total_gastos,
            sales:resp.total_ventas,
            total:resp.balance_diario,
            salesD: resp.cantidad_ventas
          };

          this.setUsuario = this._usuario;

          let UsuarioEncrypt = btoa(this.encryptation.encrypt(JSON.stringify(this._usuario)));
          
          localStorage.setItem('usuario', UsuarioEncrypt);
        
      }),
      //el map me muta o cambia el observable que viene y me devuelve otro
      map((resp) => resp),
      catchError((err) => of(err.error.message))
    )
  

  }

  login(email: string, password: string) {
    
    const UrlApi = `${this.baseUrl}/api/login`;

    const paramsBody = {
      email: email,
      password: password,
    };

    const headers = {};

    return this.apiPost.getDebtInfo(UrlApi, paramsBody, headers)
      .pipe(
      retry(2),
      tap((resp) => {
        if (resp) {
          console.log(resp.token); 
          this._usuario = {
            token: resp.token,
            email: resp.user?.email!,
            id: resp.user?.id!,
            name: resp.user?.name!,
            amount:resp.monto_diario,
            bills:resp.total_gastos,
            sales:resp.total_ventas,
            total:resp.balance_diario,
            salesD: resp.cantidad_ventas
          };
          
          this.setUsuario = this._usuario;

          let UsuarioEncrypt = btoa(this.encryptation.encrypt(JSON.stringify(this._usuario)));

          localStorage.setItem('usuario', UsuarioEncrypt); 

        }
      }),
      //el map me muta o cambia el observable que viene y me devuelve otro
      map((resp) => resp),
      catchError((err) => of(err.error.message))
    );
  }

  getItemFromLocalStorage(key: string) {

    const itemString = localStorage.getItem(key);
    const decryptedItemString = this.encryptation.decrypt(itemString || '');
    const decryptedItemObject = JSON.parse(decryptedItemString);
    return decryptedItemObject;
     
  }

  validationToken(): Observable<boolean> {
    if (!localStorage.getItem('usuario')) return of(false);

    if (localStorage.getItem('usuario')) {
      
      this._usuario = this.getItemFromLocalStorage('usuario');
      this.setUsuario = this._usuario;

    }

    let token = this._usuario.token;
    let decoded: any = jwt_decode(token || '');
    const expirationDate = new Date(decoded.exp * 1000);
    let currentDate = new Date();

    if (expirationDate < currentDate) {
      // Token ha expirado

      localStorage.removeItem('usuario');

      this.buttonService.setCHange(false);
      this.router.navigate(['./auth'])

      const newModalData: modalModel = {
        viewModal: true,
        title: 'Atencion!',
        colorIcon: 'red',
        icon: 'fa-solid fa-triangle-exclamation',
        message: 'Tu sesión ha caducado, vuelve a ingresar.',
        onMethod:() =>{
          newModalData.viewModal = false;
        },
        onMethodAction: () => {
    
        },
        buttonText: 'Aceptar',
      };
  
      this.modalService.setArray(newModalData);  
      
      return of(false);
    } else {
      // Token es válido
      return of(true);
    }
  }

  logout() {

    const newModalData: modalModel = {
      viewModal: true,
      title: 'Atencion!',
      colorIcon: 'red',
      icon: 'fa-solid fa-triangle-exclamation',
      message: '¿Estás seguro que deseas cerrar sesión?',
      onMethod:() =>{
        newModalData.viewModal = false;
      },
      isThereaButton2:true,
      onMethodAction: () => {
        localStorage.removeItem('usuario');

        newModalData.viewModal = false;
        this.router.navigate(['/auth/login']);

      },
      buttonText: 'No',
      buttonTextSecondary:'Sí'
    };

    this.modalService.setArray(newModalData);
    
  }

}
