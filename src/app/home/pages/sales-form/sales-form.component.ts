import { Component, HostListener, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
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
import { Producto } from '../../models/login.model';
import { modalModel } from 'src/app/shared/models/modal.model';

@Component({
  selector: 'app-sales-form',
  templateUrl: './sales-form.component.html',
  styleUrls: ['./sales-form.component.scss'],
})
export class SalesFormComponent {
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
  private utilities = inject(UtilitiesService);

  private baseUrl: string = environments.baseUrl;
  private subscriptions$ = new Subscription();

  token!: string;
  id!: string;
  valid: boolean = false;
  validProduct: boolean = false;
  existProduct: boolean = false;

  codigoBuscado: string = '';

  cantidadProducto: number = 1;
  multiplicador: number = 2;
  private timeout: any;
  quantities: { [index: number]: number } = {};
  porcentaje: { [index: number]: number } = {};

  arraySelects: any = {
      selects: [
        {
          value: 0,
          name: '0',
        },
        {
          value: 1,
          name: '1',
        },
        {
          value: 2,
          name: '2',
        },
        {
          value: 3,
          name: '3',
        },
        {
          value: 4,
          name: '4',
        },
        {
          value: 5,
          name: '5',
        },
        {
          value: 6,
          name: '6',
        },
        {
          value: 7,
          name: '7',
        },
        {
          value: 8,
          name: '8',
        },
        {
          value: 9,
          name: '9',
        },
        {
          value: 10,
          name: '10',
        },
        {
          value: 11,
          name: '11',
        },
        {
          value: 12,
          name: '12',
        },
        {
          value: 13,
          name: '13',
        },
        {
          value: 14,
          name: '14',
        },
        {
          value: 15,
          name: '15',
        },
        {
          value: 16,
          name: '16',
        },
        {
          value: 17,
          name: '17',
        },
        {
          value: 18,
          name: '18',
        },
        {
          value: 19,
          name: '19',
        },
        {
          value: 20,
          name: '20',
        },
        {
          value: 21,
          name: '21',
        },
        {
          value: 22,
          name: '22',
        },
        {
          value: 23,
          name: '23',
        },
        {
          value: 24,
          name: '24',
        },
        {
          value: 25,
          name: '25',
        },
        {
          value: 26,
          name: '26',
        },
        {
          value: 27,
          name: '27',
        },
        {
          value: 28,
          name: '28',
        },
        {
          value: 29,
          name: '29',
        },
        {
          value: 30,
          name: '30',
        },
        {
          value: 31,
          name: '31',
        },
        {
          value: 32,
          name: '32',
        },
        {
          value: 33,
          name: '33',
        },
        {
          value: 34,
          name: '34',
        },
        {
          value: 35,
          name: '35',
        },
        {
          value: 36,
          name: '36',
        },
        {
          value: 37,
          name: '37',
        },
        {
          value: 38,
          name: '38',
        },
        {
          value: 39,
          name: '39',
        },
        {
          value: 40,
          name: '40',
        },
        {
          value: 41,
          name: '41',
        },
        {
          value: 42,
          name: '42',
        },
        {
          value: 43,
          name: '43',
        },
        {
          value: 44,
          name: '44',
        },
        {
          value: 45,
          name: '45',
        },
        {
          value: 46,
          name: '46',
        },
        {
          value: 47,
          name: '47',
        },
        {
          value: 48,
          name: '48',
        },
        {
          value: 49,
          name: '49',
        },
        {
          value: 50,
          name: '50',
        },
        {
          value: 51,
          name: '51',
        },
        {
          value: 52,
          name: '52',
        },
        {
          value: 53,
          name: '53',
        },
        {
          value: 54,
          name: '54',
        },
        {
          value: 55,
          name: '55',
        },
        {
          value: 56,
          name: '56',
        },
        {
          value: 57,
          name: '57',
        },
        {
          value: 58,
          name: '58',
        },
        {
          value: 59,
          name: '59',
        },
        {
          value: 60,
          name: '60',
        },
        {
          value: 61,
          name: '61',
        },
        {
          value: 62,
          name: '62',
        },
        {
          value: 63,
          name: '63',
        },
        {
          value: 64,
          name: '64',
        },
        {
          value: 65,
          name: '65',
        },
        {
          value: 66,
          name: '66',
        },
        {
          value: 67,
          name: '67',
        },
        {
          value: 68,
          name: '68',
        },
        {
          value: 69,
          name: '69',
        },
        {
          value: 70,
          name: '70',
        },
        {
          value: 71,
          name: '71',
        },
        {
          value: 72,
          name: '72',
        },
        {
          value: 73,
          name: '73',
        },
        {
          value: 74,
          name: '74',
        },
        {
          value: 75,
          name: '75',
        },
        {
          value: 76,
          name: '76',
        },
        {
          value: 77,
          name: '77',
        },
        {
          value: 78,
          name: '78',
        },
        {
          value: 79,
          name: '79',
        },
        {
          value: 80,
          name: '80',
        },
        {
          value: 81,
          name: '81',
        },
        {
          value: 82,
          name: '82',
        },
        {
          value: 83,
          name: '83',
        },
        {
          value: 84,
          name: '84',
        },
        {
          value: 85,
          name: '85',
        },
        {
          value: 86,
          name: '86',
        },
        {
          value: 87,
          name: '87',
        },
        {
          value: 88,
          name: '88',
        },
        {
          value: 89,
          name: '89',
        },
        {
          value: 90,
          name: '90',
        },
        {
          value: 91,
          name: '91',
        },
        {
          value: 92,
          name: '92',
        },
        {
          value: 93,
          name: '93',
        },
        {
          value: 94,
          name: '94',
        },
        {
          value: 95,
          name: '95',
        },
        {
          value: 96,
          name: '96',
        },
        {
          value: 97,
          name: '97',
        },
        {
          value: 98,
          name: '98',
        },
        {
          value: 99,
          name: '99',
        },
        {
          value: 100,
          name: '100',
        }
      ]
      
    }


  total = signal(0);
  p: number = 1;


  productosFiltrados: any[] = [];
  productos: any[] = [];

  saleForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    cell: ['', [Validators.required]],
  });

  arrayInput1: inputModel = {
    labelExists: true,
    iconExists: false,
    decimal: false,
    name: 'Nombre',
    placeholder: 'Ingresa el nombre',
    icon: 'fa-solid fa-hashtag',
    controlName: 'name',
    type: 'text',
  };

  arrayInput2: inputModel = {
    labelExists: true,
    iconExists: false,
    decimal: false,
    name: 'Celular',
    placeholder: 'Ingresa el celular',
    icon: 'fa-solid fa-hashtag',
    controlName: 'cell',
    type: 'text',
  };

  private productosCopia: any[] = [];

  ngOnInit(): void {
    this.subscriptions$.add(
      this.auth.getUsuario.subscribe((usuario) => {
        this.token = 'Bearer ' + usuario.token;
        this.id = usuario.id;
      })
    );
    this.getProductos();
  }

  onEnterPressed() {
    const productosEncontrados = this.productos.filter((elemento: any) => elemento.codigo === this.codigoBuscado);

    if (productosEncontrados.length > 0) {if (productosEncontrados[0].existente_en_almacen === 0) {this.existProduct = true;return;} else {this.existProduct = false;}}
    this.valid = productosEncontrados.length === 0;
    this.validProduct = productosEncontrados.length > 0;
    this.codigoBuscado = '';

    if (productosEncontrados.length > 0) {
      const existingIndex = this.productosFiltrados.findIndex((item) => item.codigo === productosEncontrados[0].codigo);
      if (existingIndex === -1) {
        this.productosFiltrados.push(...productosEncontrados);
        this.actualizarTotalGeneral();
        this.validProduct = false;
      } else {
        this.validProduct = true;
      }
    }
  }

  onCantidadChange(producto: any, index: number) {
    const indexEnProductosFiltrados = this.productosFiltrados.findIndex((item) => item.codigo === producto.codigo);
    let cantidad = this.quantities[index];
    this.productosFiltrados[indexEnProductosFiltrados].total = producto.precio_por_unidad * cantidad;
    this.productosFiltrados[indexEnProductosFiltrados].cantidad = cantidad;
    this.actualizarTotalGeneral();
  }

  

  prod:number = 0;

  onPorcentajeChange(producto: any, index: number){
       let cantidad = this.quantities[index];
       const productosEnc = this.productosCopia.filter((elemento: any) => elemento.codigo === producto.codigo);
       this.prod = productosEnc[0].total;
       const indexEnProductosFiltrados = this.productosFiltrados.findIndex((item) => item.codigo === producto.codigo);
       let porcent = Number(String(this.porcentaje[index]).replace(/[,.]/g, ''));
       this.productosFiltrados[indexEnProductosFiltrados].precio_por_unidad = this.prod - porcent;
       this.productosFiltrados[indexEnProductosFiltrados].total = (this.prod - porcent) * cantidad;
       this.productosFiltrados[indexEnProductosFiltrados].descuento = porcent;
       this.actualizarTotalGeneral();    
       console.log(this.obtenerDatosCombinados());
       
  }


  convertirAPorcentaje(numero: number): number {
    return numero / 100;
  }

  onDeleteProducto(producto: any) {
    const index = this.productosFiltrados.findIndex((item) => item.codigo === producto.codigo);
    this.productosFiltrados.splice(index, 1);
    this.actualizarTotalGeneral();
  }

  private actualizarTotalGeneral() {
    const totalGeneral = this.calcularTotalGeneral();
    this.total.set(totalGeneral);
  }

  calcularTotalGeneral() {
    return this.productosFiltrados.reduce((total, producto) => total + Number(producto.total),0);
  }

  
  isItemsArrayValid(): boolean {
    return this.productosFiltrados.length > 0;
  }

  

  getProductos() {
    this.loader.setLoader(true);
    const UrlApi = `${this.baseUrl}/api/v1/productos`;
    const headers = { Authorization: this.token };

    this.apiGet.getDebtInfo(UrlApi, headers).subscribe((resp) => {

      this.loader.setLoader(false);
      this.productos = resp.data;
      this.productosCopia = JSON.parse(JSON.stringify(resp.data));
      console.log(this.productosCopia);

      this.productos.forEach((producto, index) => {
        this.quantities[index] = 1;
      });

    });
  }

  private obtenerDatosCombinados() {
    const productosReducidos = this.productosFiltrados.map((producto) => {
      return {
        cantidad: producto.cantidad,
        codigo: producto.codigo,
        total: producto.total,
        descuento: producto.descuento
      };
    });

    return productosReducidos;
  }

  getSubmit() {

    const formData = this.saleForm.getRawValue();

    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', this.token);

    var raw = JSON.stringify({
      vendedor: this.id,
      nombre_comprador: formData.name,
      numero_comprador: formData.cell,
      cantidad: this.obtenerDatosCombinados().length,
      productos: this.obtenerDatosCombinados(),
      precio_venta: this.total(),
    });

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: undefined,
    };

    fetch(`${this.baseUrl}/api/v1/ventas`, requestOptions)
      .then((response) => response.json())
      .then(
        (result) => {
          console.log(result);

            this.buttonService.setCHange(false);
            this.router.navigate(['/home/ventas']);
          
          // if (result.success) {
          
          // }else{
        
          // }
         
        })
      .catch((error) => {
            this.buttonService.setCHange(false);
            const newModalData: modalModel = {
              viewModal: true,
              clickOutside: true,
              title: 'Atención',
              colorIcon: 'red',
              icon: 'fa-solid fa-triangle-exclamation',
              message: 'Cantidad ha excedida con respecto a la existencia',
              onMethod: () => {
                newModalData.viewModal = false;
              },
              onMethodAction: () => {},
              loader: false,
              buttonText: 'Cerrar',
            };
    
            this.modalService.setArray(newModalData);
      });

  }

  ngOnDestroy(): void {
    if (this.subscriptions$) this.subscriptions$.unsubscribe();
    this.loader.setLoader(false);
  }

  doSomething() {
    this.router.navigate(['/home/ventas']);
  }
}




























  // scannedCodes: string[] = [];
  // currentCode: string = '';

  // @HostListener('document:keydown', ['$event'])
  // handleKeyDown(event: KeyboardEvent) {
  //   // Verificar si la tecla presionada es "Enter"
  //   // console.log(event);
  //   if (event.key === 'Enter') {
  //     this.scannedCodes.push(this.currentCode);
  //     this.currentCode = ''; // Limpiar el código actual
  //     // console.log(this.scannedCodes);
  //   } else {
  //     this.currentCode += event.key;
  //   }
  // }


   //por si necesito centralizarlo en un servicio
  // this.getArrayObservable()
  // .subscribe((newArray) => {
  //   this.productosFiltrados = newArray;
  // });
  // productosNew: any[] = [];
  // productsSubject = new BehaviorSubject<any>(this.productosNew);
  // public getArray(): any {
  //   return {...this.productosNew};
  // }
  // public setArray(newArray: any) {
  //   this.productosNew = newArray;
  //   this.productsSubject.next(this.productosNew);
  // }
  // public getArrayObservable() {
  //   return this.productsSubject.asObservable();
  // }

    // onPorcentajeChange(producto: any, index: number){
  //   let cantidad = this.quantities[index];

  //   const productosEnc = this.productosCopia.filter((elemento: any) => elemento.codigo === producto.codigo);
  //   this.prod = productosEnc[0].total;
   
  //   const indexEnProductosFiltrados = this.productosFiltrados.findIndex((item) => item.codigo === producto.codigo);
  //   let porcent = this.convertirAPorcentaje(this.porcentaje[index]);
  //   this.productosFiltrados[indexEnProductosFiltrados].precio_por_unidad = this.prod - (this.prod * porcent);
  //   this.productosFiltrados[indexEnProductosFiltrados].total = (this.prod - (this.prod * porcent)) * cantidad;
  //   this.actualizarTotalGeneral();
  // }