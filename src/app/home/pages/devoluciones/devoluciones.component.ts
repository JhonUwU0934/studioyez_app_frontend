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
  selector: 'app-devoluciones',
  templateUrl: './devoluciones.component.html',
  styleUrls: ['./devoluciones.component.scss']
})
export class DevolucionesComponent {


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
  public page: number = 0;
  p: number = 1;


  constructor(
    private router: Router
  ) {}


  public data: any = {};
  search: string = '';

  private subscriptions$ = new Subscription();


  ngOnInit(): void {

    this.loader.setLoader(true);

    let token;
    this.subscriptions$.add(
      this.auth.getUsuario.subscribe(usuario => {
        token = 'Bearer '+ usuario.token;
      })
    );


    const UrlApi = `${this.baseUrl}/api/v1/devolucionclientealmacen`;
    const headers = {'Authorization': token};

    this.subscriptions$.add(
      this.apiGet.getDebtInfo(UrlApi, headers)
      .subscribe((resp)=>{
        console.log(resp);

        this.loader.setLoader(false);
        this.data = resp
      })
    );

  }

  ngOnDestroy(): void{
    if (this.subscriptions$) this.subscriptions$.unsubscribe();
    this.loader.setLoader(false);
  };

  nextPage(){
    this.page += 5;
  }

  prevPage(){
    if (this.page > 0) {
      this.page -= 5;
    }
  }

  doSomething(){
    this.router.navigate(['/home/devoluciones-form']);
  }

}
