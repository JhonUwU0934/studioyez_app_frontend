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
import { UtilitiesService } from 'src/app/shared/services/utilities.service';
import { environments } from 'src/environments/environments';

@Component({
  selector: 'app-bills-form',
  templateUrl: './bills-form.component.html',
  styleUrls: ['./bills-form.component.scss']
})
export class BillsFormComponent {

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
  private utilities = inject(UtilitiesService)


  // salesForm!: FormGroup;
  private baseUrl: string = environments.baseUrl;
  private subscriptions$ = new Subscription();


  token!: string;
  billId: string = '';
  bill!: any;


  billForm: FormGroup = this.fb.group({
      description: ['', [Validators.required]],
      amount: ['', [Validators.required]],
  });


  arrayInput3: inputModel = {
    labelExists: true,
    iconExists: false,
    decimal: true,
    name: 'Monto',
    placeholder: 'Monto',
    icon: 'fa-solid fa-money-check-dollar',
    controlName: 'amount',
    type: 'text',
  };

  ngOnInit(): void {

    this.subscriptions$.add(
      this.auth.getUsuario.subscribe((usuario) => {
        this.token = 'Bearer ' + usuario.token;
      })
    );
   
    this.billId = this.activateR.snapshot.paramMap.get('id') as string;
    
    if (this.billId) {
      this.getIDUrl();
    }
  }

  getIDUrl(){
    this.loader.setLoader(true);

    const UrlApi = `${this.baseUrl}/api/v1/gastos/${this.billId}`;
    const headers = {'Authorization': this.token};

    this.subscriptions$.add(
      this.apiGet.getDebtInfo(UrlApi, headers)
      .subscribe((resp)=>{
        this.loader.setLoader(false);
        this.bill = resp;  
        this.billForm.patchValue({
          description: resp.data.descripcion,
          amount:  this.utilities.formatoMilesMillones(resp.data.monto.toString()),
        })
      })
    );

   
  }

  getSubmit() {
    const formData = this.billForm.getRawValue();
    const currentDate: Date = new Date();
    const formattedDate: string = this.formatDate(currentDate);
  
    const paramsBody = {
      descripcion: formData.description,
      fecha: formattedDate,
      monto: formData.amount.replace(/\./g, '')
    };
  
    const headers = {
      Authorization: this.token,
    };
  
    const UrlApi = this.billId
      ? `${this.baseUrl}/api/v1/gastos/${this.billId}`
      : `${this.baseUrl}/api/v1/gastos`;
  
    const apiObservable = this.billId
      ? this.apiPut.updateDebtInfo(UrlApi, paramsBody, headers)
      : this.apiPost.getDebtInfo(UrlApi, paramsBody, headers);
  
      
    this.subscriptions$.add(
      apiObservable.subscribe(
        (resp) => {
          this.buttonService.setCHange(false);
          this.router.navigate(['/home/gastos']);
        },
        (error) => {}
      )
    );
  
  }
  

  ngOnDestroy(): void {
    if (this.subscriptions$) this.subscriptions$.unsubscribe();
    this.loader.setLoader(false);
  }

  doSomething(){
    this.router.navigate(['/home/gastos']);
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
