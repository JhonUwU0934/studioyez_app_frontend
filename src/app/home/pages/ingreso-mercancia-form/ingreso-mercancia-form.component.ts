import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { inputModel } from 'src/app/shared/models/input.model';
import { ApiGetService } from 'src/app/shared/services/api-get.service';
import { ApiPostService } from 'src/app/shared/services/api-post.service';
import { ApiPutService } from 'src/app/shared/services/api-put.service';
import { ButtonService } from 'src/app/shared/services/button.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { environments } from 'src/environments/environments';

@Component({
  selector: 'app-ingreso-mercancia-form',
  templateUrl: './ingreso-mercancia-form.component.html',
  styleUrls: ['./ingreso-mercancia-form.component.scss']
})
export class IngresoMercanciaFormComponent implements OnInit, OnDestroy {

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private apiPost = inject(ApiPostService);
  private apiPut = inject(ApiPutService);
  private apiGet = inject(ApiGetService);
  private modalService = inject(ModalService);
  private buttonService = inject(ButtonService);
  private router = inject(Router);
  private activateR = inject(ActivatedRoute);
  private loader = inject(LoaderService);

  private baseUrl: string = environments.baseUrl;
  private subscriptions$ = new Subscription();

  token!: string;
  saleId: string = '';
  product!: any;
  products: any[] = [];

  productForm: FormGroup = this.fb.group({
    date: ['', [Validators.required]],
    cantidad: ['', [Validators.required]],
  });

  arrayInput3: inputModel = {
    labelExists: true,
    iconExists: false,
    decimal: false,
    name: 'Fecha ingreso',
    placeholder: 'Fecha ingreso',
    icon: 'fa-solid fa-money-check-dollar',
    controlName: 'date',
    type: 'date',
  };

  arrayInput4: inputModel = {
    labelExists: true,
    iconExists: false,
    decimal: false,
    name: 'Cantidad ingreso',
    placeholder: 'Cantidad ingreso',
    icon: 'fa-solid fa-money-check-dollar',
    controlName: 'cantidad',
    type: 'number',
  };

  data: any = { productos: [] };
  productoSeleccionado: any;

  ngOnInit(): void {
    this.getProducts();

    this.subscriptions$.add(
      this.auth.getUsuario.subscribe((usuario) => {
        this.token = 'Bearer ' + usuario.token;
      })
    );
  }

  getProducts() {
    this.subscriptions$.add(
      this.auth.getUsuario.subscribe(usuario => {
        const token = 'Bearer ' + usuario.token;
        const UrlApi = `${this.baseUrl}/api/v1/productos`;
        const headers = { 'Authorization': token };

        this.apiGet.getDebtInfo(UrlApi, headers).subscribe((resp) => {
          console.log("API Response:", resp);
          this.data = resp;
          this.products = resp.data;
          console.log('Data:', this.products);
          this.loader.setLoader(false);
        });
      })
    );
  }

  seleccionarProducto(event: any) {
    const id = event.target ? event.target.value : null;
    if (id) {
      this.productoSeleccionado = id;
    }
    console.log(this.productoSeleccionado)
    return this.productoSeleccionado;
  }



  getSubmit() {
    const formData = this.productForm.getRawValue();

    const headers = {
      Authorization: this.token
    };

    const paramsBody = {
      producto_id: this.seleccionarProducto(event),
      fecha: formData.date,
      cantidad_de_ingreso: formData.cantidad
    };

    const UrlApi = `${this.baseUrl}/api/v1/ingresodemercancia`;

    const apiObservable = this.apiPost.getDebtInfo(UrlApi, paramsBody, headers);

    this.subscriptions$.add(
      apiObservable.subscribe(
        (resp) => {
          console.log(resp);
          this.buttonService.setCHange(false);
          this.router.navigate(['/home/ingreso-mercancia']);
        },
        (error) => {
          this.buttonService.setCHange(false);
          console.log('There has been a problem with your fetch operation:', error);

        }
      )
    );
  }




  ngOnDestroy(): void {
    this.subscriptions$.unsubscribe();
    this.loader.setLoader(false);
  }

  doSomething() {
    this.router.navigate(['/home/ingreso-mercancia']);
  }

  formatDate(date: Date): string {
    const year: number = date.getFullYear();
    const month: number = date.getMonth() + 1;
    const day: number = date.getDate();
    return `${year}-${this.padNumber(month)}-${this.padNumber(day)}`;
  }

  padNumber(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }
}
