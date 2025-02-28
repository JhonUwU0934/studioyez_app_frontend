import { Component, inject } from '@angular/core';
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
  selector: 'app-products-form',
  templateUrl: './products-form.component.html',
  styleUrls: ['./products-form.component.scss']
})
export class ProductsFormComponent {

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private apiPost = inject(ApiPostService);
  private apiPut = inject(ApiPutService);
  private apiGet = inject(ApiGetService);
  private modalService = inject(ModalService);
  private buttonService = inject(ButtonService);
  private router = inject(Router)
  private activateR = inject(ActivatedRoute)
  private loader = inject(LoaderService);


  // productForm!: FormGroup;
  private baseUrl: string = environments.baseUrl;
  private subscriptions$ = new Subscription();

  token!: string;
  saleId: string = '';
  product!: any;


  // productFormInit(): FormGroup {
  //   return this.fb.group({
  //     quantity: ['', [Validators.required]],
  //     wholesalePrice: ['', [Validators.required]],
  //     unitPrice: ['', [Validators.required]],
  //     sellingPrice: ['', [Validators.required]],
  //     salesperson: ['', [Validators.required]],
  //   });
  // }

  productForm: FormGroup = this.fb.group({
      code: ['', [Validators.required]],
      denomination: ['', [Validators.required]],
      image: ['', [Validators.required]],
      existence: ['', [Validators.required]],
      wholesale: ['', [Validators.required]],
      unit: ['', [Validators.required]],
  });

  arrayInput1: inputModel = {
    labelExists: true,
    iconExists: false,
    decimal: false,
    name: 'Código',
    placeholder: 'Código',
    icon: 'fa-solid fa-hashtag',
    controlName: 'code',
    type: 'text',
  };

  arrayInput3: inputModel = {
    labelExists: true,
    iconExists: false,
    decimal: false,
    name: 'Denominación',
    placeholder: 'Denominación',
    icon: 'fa-solid fa-money-check-dollar',
    controlName: 'denomination',
    type: 'text',
  };

  arrayInput4: inputModel = {
    labelExists: true,
    iconExists: false,
    decimal: false,
    name: 'Imagen',
    placeholder: 'Imagen',
    icon: 'fa-solid fa-money-check-dollar',
    controlName: 'image',
    type: 'text',
  };

  arrayInput5: inputModel = {
    labelExists: true,
    iconExists: false,
    decimal: false,
    name: 'Existencia',
    placeholder: 'Existencia',
    icon: 'fa-solid fa-money-check-dollar',
    controlName: 'existence',
    type: 'number',
  };

  arrayInput6: inputModel = {
    labelExists: true,
    iconExists: false,
    decimal: true,
    name: 'Por mayor',
    placeholder: 'Por mayor',
    icon: 'fa-solid fa-user',
    controlName: 'wholesale',
    type: 'text',
  };

  arrayInput7: inputModel = {
    labelExists: true,
    iconExists: false,
    decimal: true,
    name: 'Por unidad	',
    placeholder: 'Por unidad	',
    icon: 'fa-solid fa-user',
    controlName: 'unit',
    type: 'text',
  };

  ngOnInit(): void {

    this.subscriptions$.add(
      this.auth.getUsuario.subscribe((usuario) => {
        this.token = 'Bearer ' + usuario.token;
      })
    ) 
    
    this.saleId = this.activateR.snapshot.paramMap.get('id') as string;
    if (this.saleId) {
      this.getIDUrl();
    }
  }

  getIDUrl(){
    this.loader.setLoader(true);

    const UrlApi = `${this.baseUrl}/api/v1/productos/${this.saleId}`;
    const headers = {'Authorization': this.token};

    this.subscriptions$.add(
      this.apiGet.getDebtInfo(UrlApi, headers)
      .subscribe((resp)=>{
   
        this.loader.setLoader(false);
        this.product = resp;  
        this.productForm.patchValue({
          code: this.product.data.codigo,
          denomination: this.product.data.denominacion,
          image: this.product.data.imagen,
          existence: this.product.data.existente_en_almacen,
          wholesale: this.product.data.precio_por_mayor,
          unit: this.product.data.precio_por_unidad,
        });  
      })
    )

    
  }

  getSubmit() {
    const formData = this.productForm.getRawValue();
    const currentDate: Date = new Date();
  
    const paramsBody = {
      codigo: formData.code,
      denominacion: formData.denomination,
      imagen: formData.image,
      existente_en_almacen: formData.existence,
      precio_por_mayor: formData.wholesale,
      precio_por_unidad: formData.unit,
    };
  
    const headers = {
      Authorization: this.token,
    };
  
    const UrlApi = this.saleId
      ? `${this.baseUrl}/api/v1/productos/${this.saleId}`
      : `${this.baseUrl}/api/v1/productos`;
  
    const apiObservable = this.saleId
      ? this.apiPut.updateDebtInfo(UrlApi, paramsBody, headers)
      : this.apiPost.getDebtInfo(UrlApi, paramsBody, headers);

      this.subscriptions$.add(
        apiObservable.subscribe(
          (resp) => {    
            this.buttonService.setCHange(false);
            this.router.navigate(['/home/productos']);
          },
          (error) => {}
        )
      )
  
    
  }
  
  ngOnDestroy(): void {
    if (this.subscriptions$) this.subscriptions$.unsubscribe();
    this.loader.setLoader(false);
  }

  doSomething(){
    this.router.navigate(['/home/productos']);
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
