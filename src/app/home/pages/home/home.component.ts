import { Component, Input, inject, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Subscription, retry } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ApiGetService } from 'src/app/shared/services/api-get.service';
import { ApiPostService } from 'src/app/shared/services/api-post.service';
import { ApiPutService } from 'src/app/shared/services/api-put.service';
import { ButtonService } from 'src/app/shared/services/button.service';
import { EncryptationService } from 'src/app/shared/services/encryptation.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { ModalChangeService } from 'src/app/shared/services/modal-change.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { UtilitiesService } from 'src/app/shared/services/utilities.service';
import { environments } from 'src/environments/environments';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private apiPost = inject(ApiPostService);
  private apiPut = inject(ApiPutService);
  private modalService = inject(ModalService);
  private modalChangeService = inject(ModalChangeService);
  private buttonService = inject(ButtonService);
  public encryptation = inject(EncryptationService);
  private loader = inject(LoaderService);
  private utilities = inject(UtilitiesService);
  private apiGet = inject(ApiGetService);

  private baseUrl: string = environments.baseUrl;

  cardPs: any = {
    icon: 'bx bx-dock-left icon',
    coloricon: '#EA353B',
    title: 'Facturación',
    route: 'facturacion',
    subtitle: 'Comprobante de Deudas Pagadas.',
  };
  cardSc: any = {
    icon: 'bx bx-calculator icon',
    coloricon: 'rgb(181 215 124)',
    title: 'Ventas',
    route: 'ventas',
    subtitle: 'Encuentra tu Mejor Opción Financiera.',
  };
  cardPy: any = {
    icon: 'bx bx-credit-card icon',
    coloricon: '#ffa534',
    title: 'Gastos',
    route: 'gastos',
    subtitle: 'Detalla tu gastos diarios.',
  };
  cardCont: any = {
    icon: 'bx bxs-contact icon',
    coloricon: 'rgb(113 144 209)',
    title: 'Productos',
    route: 'productos',
    subtitle: 'Busca en nuestros productos.',
  };

  sales!: number;
  bills!: number;
  total!: number;
  amount!: number;
  salesD!: number;
  token!: string;
  amountID!: number;
  userID!: string;

  skeleton = signal(true) ;


  private subscriptions$ = new Subscription();

  ngOnInit(): void {

    this.subscriptions$.add(

      this.auth.getUsuario
      .subscribe((usuario) => {
        this.token = 'Bearer ' + usuario.token;
        this.userID = usuario.id
      })

    )  

    const UrlApi = `${this.baseUrl}/api/v1/balance`;
    const headers = {'Authorization': this.token};  
  
    this.subscriptions$.add(

      this.apiGet.getDebtInfo(UrlApi,headers)
      .subscribe((resp) => {
        this.skeleton.set(false)       
        this.sales = resp.total_ventas;
        this.bills = resp.total_gastos;
        this.total = resp.balance_diario;
        this.amount = resp.monto_diario;
        this.salesD = resp.cantidad_ventas;
        this.amountID = resp.monto_id;     
      })

    )
 

  }

  amountOpenModal() {
    const newModalChangeData: any = {
      viewModal: true,
      onMethod: () => {

        newModalChangeData.viewModal = false;
        this.skeleton.set(true)       
        const headers = {'Authorization': this.token};  

        const paramsBody = this.amountID 
        ? {monto: newModalChangeData.newAmount.replace(/\./g, '')}
        : {creador_id: this.userID, monto: newModalChangeData.newAmount.replace(/\./g, '')}

        const UrlApi = this.amountID 
        ? `${this.baseUrl}/api/v1/monto/${this.amountID}`
        : `${this.baseUrl}/api/v1/monto`

        const apiObservable = this.amountID
        ? this.apiPut.updateDebtInfo(UrlApi, paramsBody, headers)
        : this.apiPost.getDebtInfo(UrlApi, paramsBody, headers);
   
        this.subscriptions$.add(

          apiObservable.subscribe(
            (resp) => {    
              this.skeleton.set(false)            
              this.amount = resp.monto_diario;
              this.sales = resp.total_ventas;
              this.bills = resp.total_gastos;
              this.salesD = resp.cantidad_ventas;
              this.total = resp.balance_diario;
            },
            (error) => {}
          )
    
        )

      
      
      },
    };

    this.modalChangeService.setArray(newModalChangeData);
  }

  ngOnDestroy(): void {
    if (this.subscriptions$) this.subscriptions$.unsubscribe();
  }
 
}


//metodo para actualizar localstorage y observable 

// let _usuario;

// if (localStorage.getItem('usuario')) {
//   _usuario = this.auth.getItemFromLocalStorage('usuario');
// }
// _usuario.amount = newModalChangeData.newAmount.replace(/\./g, ''); //quitar puntos decimal
// this.auth.setUsuario = _usuario;

// let UsuarioEncrypt = btoa(
//   this.encryptation.encrypt(JSON.stringify(_usuario))
// );
// localStorage.setItem('usuario', UsuarioEncrypt);

// this.sub$ = this.auth.getUsuario.subscribe((usuario) => {
//   this.sales = usuario.sales;
//   this.bills = usuario.bills;
//   this.total = usuario.total;
//   this.amount = usuario.amount;
//   this.salesD = usuario.salesD;
//   this.token = 'Bearer ' + usuario.token;
//   this.creadorID = 17;
// });