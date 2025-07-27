import { Component, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ApiGetService } from 'src/app/shared/services/api-get.service';
import { ApiPostService } from 'src/app/shared/services/api-post.service';
import { ButtonService } from 'src/app/shared/services/button.service';
import { EncryptationService } from 'src/app/shared/services/encryptation.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { UtilitiesService } from 'src/app/shared/services/utilities.service';
import { environments } from 'src/environments/environments';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent {

  
  private fb = inject(FormBuilder); 
  private auth = inject(AuthService); 
  private apiPost = inject(ApiPostService);
  private modalService = inject(ModalService);
  private buttonService = inject(ButtonService);
  public  encryptation = inject(EncryptationService);
  private loader = inject(LoaderService);
  private utilities = inject(UtilitiesService)
  private apiGet = inject(ApiGetService);


  private baseUrl: string = environments.baseUrl;

  
  constructor(
    private router: Router
  ) {}


  public data: any = {};
  public page: number = 0;
  p: number = 1;
  token!: string;
  search: string = '';

  private subscriptions$ = new Subscription();


  ngOnInit(): void {
  
    this.loader.setLoader(true);

    this.subscriptions$.add(
      this.auth.getUsuario.subscribe(usuario => { 
        this.token = 'Bearer '+ usuario.token; 
      })
    );
 
    const UrlApi = `${this.baseUrl}/api/v1/ventas`;
    const headers = {'Authorization': this.token};

    this.subscriptions$.add(
      this.apiGet.getDebtInfo(UrlApi, headers)
      .subscribe((resp)=>{
        this.loader.setLoader(false);
        this.data = resp
        console.log(this.data);
        
      })
    );
   
  }

  ngOnDestroy(): void{
    if (this.subscriptions$) this.subscriptions$.unsubscribe();
    this.loader.setLoader(false);
  };

  activateSale(id:any, data: any){
    data.loading =  true;

    const UrlApi = `${this.baseUrl}/api/v1/factura`;

    // const paramsBody = {
    //   id: id,
    // };

    // const headers = {'Authorization': this.token};

    // this.apiPost.getDebtInfo(UrlApi, paramsBody, headers)
    // .subscribe((resp)=>{
    //   console.log(resp);    
    // })

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    myHeaders.append("Authorization", this.token);

    var urlencoded = new URLSearchParams();
    urlencoded.append("id", id);

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: urlencoded,
      redirect: undefined
    };

    fetch(UrlApi, requestOptions)
      .then(response => response.text())
      .then(result => {
        data.loading =  false;
        window.location.reload();
      })
      .catch(error => console.log('error', error));

  }

  redirigirAPagina(url: string) {
    window.location.href = url;
  }
  nextPage(){
    this.page += 5;
  }

  prevPage(){
    if (this.page > 0) {
      this.page -= 5;
    }
  }

  doSomething(){
    this.router.navigate(['/home/ventas-form']);
  }

}
