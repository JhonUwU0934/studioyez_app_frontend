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

// INTERFACES PARA VARIANTES CORREGIDAS
interface Variante {
  id: number;
  sku: string;
  existente_en_almacen: number;
  precio_por_mayor: string;
  precio_por_unidad: string;
  imagen_variante?: string;
  activo: boolean;
  color?: Color;
  talla?: Talla;
}

interface Color {
  id: number;
  nombre: string;
  codigo_hex?: string;
}

interface Talla {
  id: number;
  nombre: string;
  orden: number;
}

interface ProductoConVariantes {
  id: number;
  codigo: string;
  denominacion: string;
  imagen?: string;
  existente_en_almacen: number;
  precio_por_mayor: string;
  precio_por_unidad: string;
  variantes?: Variante[];
}

interface ProductoVenta {
  codigo: string;
  denominacion: string;
  cantidad: number;
  total: number;
  descuento: number;
  precio_por_unidad: number;
  variante_seleccionada?: Variante;
  variante_id?: number;
  sku_variante?: string;
  // Campos para mostrar en la tabla
  color_nombre?: string;
  talla_nombre?: string;
  stock_disponible: number; // ✅ CORREGIDO: Ya no opcional
}

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
  noVariantes: boolean = false;

  codigoBuscado: string = '';
  productoEncontrado: ProductoConVariantes | null = null;
  varianteSeleccionada: Variante | null = null;

  cantidadProducto: number = 1;
  multiplicador: number = 2;
  private timeout: any;
  quantities: { [index: number]: number } = {};
  porcentaje: { [index: number]: number } = {};

  total = signal(0);
  p: number = 1;

  productos: ProductoConVariantes[] = [];
  productosFiltrados: ProductoVenta[] = [];

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

  private productosCopia: ProductoConVariantes[] = [];

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
    this.resetErrorStates();
    
    const productosEncontrados = this.productos.filter(
      (elemento: ProductoConVariantes) => elemento.codigo === this.codigoBuscado
    );

    if (productosEncontrados.length === 0) {
      this.valid = true;
      return;
    }

    const producto = productosEncontrados[0];
    
    // Verificar si el producto tiene variantes
    if (!producto.variantes || producto.variantes.length === 0) {
      this.noVariantes = true;
      return;
    }

    // Verificar si el producto ya está en la lista
    const existingIndex = this.productosFiltrados.findIndex(
      (item) => item.codigo === producto.codigo
    );
    
    if (existingIndex !== -1) {
      this.validProduct = true;
      return;
    }

    // Establecer el producto encontrado para mostrar sus variantes
    this.productoEncontrado = producto;
    this.codigoBuscado = '';
  }

  onVarianteSelected(variante: Variante) {
    if (!this.productoEncontrado) return;

    // Verificar stock de la variante
    if (variante.existente_en_almacen === 0) {
      this.existProduct = true;
      return;
    }

    this.varianteSeleccionada = variante;
    this.existProduct = false;
  }

  onAgregarProducto() {
    if (!this.productoEncontrado || !this.varianteSeleccionada) return;

    const nuevoProducto: ProductoVenta = {
      codigo: this.productoEncontrado.codigo,
      denominacion: this.productoEncontrado.denominacion,
      cantidad: 1,
      total: parseFloat(this.varianteSeleccionada.precio_por_unidad),
      descuento: 0,
      precio_por_unidad: parseFloat(this.varianteSeleccionada.precio_por_unidad),
      variante_seleccionada: this.varianteSeleccionada,
      variante_id: this.varianteSeleccionada.id,
      sku_variante: this.varianteSeleccionada.sku,
      color_nombre: this.varianteSeleccionada.color?.nombre || 'Sin color',
      talla_nombre: this.varianteSeleccionada.talla?.nombre || 'Sin talla',
      stock_disponible: this.varianteSeleccionada.existente_en_almacen // ✅ CORREGIDO: Siempre tendrá valor
    };

    this.productosFiltrados.push(nuevoProducto);
    
    // Inicializar cantidad en el array de quantities
    const newIndex = this.productosFiltrados.length - 1;
    this.quantities[newIndex] = 1;
    this.porcentaje[newIndex] = 0;

    this.actualizarTotalGeneral();
    this.resetSelection();
  }

  onCantidadChange(producto: ProductoVenta, index: number) {
    const cantidad = this.quantities[index];
    
    // Verificar que no exceda el stock disponible
    if (cantidad > producto.stock_disponible) {
      this.quantities[index] = producto.stock_disponible;
      this.showStockError();
      return;
    }

    const indexEnProductosFiltrados = this.productosFiltrados.findIndex(
      (item) => item.codigo === producto.codigo && item.variante_id === producto.variante_id
    );
    
    if (indexEnProductosFiltrados !== -1) {
      this.productosFiltrados[indexEnProductosFiltrados].total = 
        producto.precio_por_unidad * cantidad;
      this.productosFiltrados[indexEnProductosFiltrados].cantidad = cantidad;
      this.actualizarTotalGeneral();
    }
  }

  onPorcentajeChange(producto: ProductoVenta, index: number) {
    const cantidad = this.quantities[index];
    const precioOriginal = producto.variante_seleccionada?.precio_por_unidad || producto.precio_por_unidad;
    const precioNumerico = parseFloat(precioOriginal.toString());
    
    const indexEnProductosFiltrados = this.productosFiltrados.findIndex(
      (item) => item.codigo === producto.codigo && item.variante_id === producto.variante_id
    );
    
    if (indexEnProductosFiltrados !== -1) {
      const descuento = Number(String(this.porcentaje[index]).replace(/[,.]/g, ''));
      const precioConDescuento = precioNumerico - descuento;
      
      this.productosFiltrados[indexEnProductosFiltrados].precio_por_unidad = precioConDescuento;
      this.productosFiltrados[indexEnProductosFiltrados].total = precioConDescuento * cantidad;
      this.productosFiltrados[indexEnProductosFiltrados].descuento = descuento;
      this.actualizarTotalGeneral();
    }
  }

  onDeleteProducto(producto: ProductoVenta) {
    const index = this.productosFiltrados.findIndex(
      (item) => item.codigo === producto.codigo && item.variante_id === producto.variante_id
    );
    
    if (index !== -1) {
      this.productosFiltrados.splice(index, 1);
      delete this.quantities[index];
      delete this.porcentaje[index];
      this.actualizarTotalGeneral();
    }
  }

  private resetErrorStates() {
    this.valid = false;
    this.validProduct = false;
    this.existProduct = false;
    this.noVariantes = false;
  }

  // ✅ CORREGIDO: Ahora es público para poder usarse en el template
  public resetSelection() {
    this.productoEncontrado = null;
    this.varianteSeleccionada = null;
  }

  private showStockError() {
    const newModalData: modalModel = {
      viewModal: true,
      clickOutside: true,
      title: 'Stock Insuficiente',
      colorIcon: 'red',
      icon: 'fa-solid fa-triangle-exclamation',
      message: 'La cantidad solicitada excede el stock disponible de esta variante',
      onMethod: () => {
        newModalData.viewModal = false;
      },
      onMethodAction: () => {},
      loader: false,
      buttonText: 'Cerrar',
    };
    this.modalService.setArray(newModalData);
  }

  private actualizarTotalGeneral() {
    const totalGeneral = this.calcularTotalGeneral();
    this.total.set(totalGeneral);
  }

  calcularTotalGeneral() {
    return this.productosFiltrados.reduce(
      (total, producto) => total + Number(producto.total),
      0
    );
  }

  // ✅ NUEVO MÉTODO: Para calcular cantidad total en el template
  calcularCantidadTotal(): number {
    return this.productosFiltrados.reduce((sum, p) => sum + p.cantidad, 0);
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
      console.log('Productos con variantes:', this.productos);
    });
  }

  private obtenerDatosCombinados() {
    const productosReducidos = this.productosFiltrados.map((producto) => {
      return {
        cantidad: producto.cantidad,
        codigo: producto.codigo,
        total: producto.total,
        descuento: producto.descuento,
        variante_id: producto.variante_id, // NUEVO CAMPO OBLIGATORIO
        sku_variante: producto.sku_variante // CAMPO ALTERNATIVO
      };
    });

    return productosReducidos;
  }

  getSubmit() {
    if (!this.isItemsArrayValid()) return;

    const formData = this.saleForm.getRawValue();
    this.buttonService.setCHange(true);

    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', this.token);

    var raw = JSON.stringify({
      vendedor: this.id,
      nombre_comprador: formData.name,
      numero_comprador: formData.cell,
      productos: this.obtenerDatosCombinados(),
    });

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: undefined,
    };

    fetch(`${this.baseUrl}/api/v1/ventas`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log('Respuesta del servidor:', result);
        this.buttonService.setCHange(false);

        if (result.data && result.data.id) {
          // Venta exitosa
          const successModal: modalModel = {
            viewModal: true,
            clickOutside: true,
            title: 'Venta Exitosa',
            colorIcon: 'green',
            icon: 'fa-solid fa-check-circle',
            message: `Venta creada exitosamente. Código: ${result.data.codigo_factura}`,
            onMethod: () => {
              successModal.viewModal = false;
              this.router.navigate(['/home/ventas']);
            },
            onMethodAction: () => {},
            loader: false,
            buttonText: 'Continuar',
          };
          this.modalService.setArray(successModal);
        } else {
          // Error en la respuesta
          this.showErrorModal(result.error || 'Error desconocido al crear la venta');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        this.buttonService.setCHange(false);
        this.showErrorModal('Error de conexión. Verifique su conexión a internet.');
      });
  }

  private showErrorModal(message: string) {
    const errorModal: modalModel = {
      viewModal: true,
      clickOutside: true,
      title: 'Error',
      colorIcon: 'red',
      icon: 'fa-solid fa-triangle-exclamation',
      message: message,
      onMethod: () => {
        errorModal.viewModal = false;
      },
      onMethodAction: () => {},
      loader: false,
      buttonText: 'Cerrar',
    };
    this.modalService.setArray(errorModal);
  }

  ngOnDestroy(): void {
    if (this.subscriptions$) this.subscriptions$.unsubscribe();
    this.loader.setLoader(false);
  }

  doSomething() {
    this.router.navigate(['/home/ventas']);
  }

  // MÉTODOS AUXILIARES PARA EL TEMPLATE
  getVarianteDisplay(variante: Variante): string {
    let display = variante.sku || `ID: ${variante.id}`;
    if (variante.color) display += ` - ${variante.color.nombre}`;
    if (variante.talla) display += ` - ${variante.talla.nombre}`;
    return display;
  }

  getVarianteStock(variante: Variante): string {
    return `Stock: ${variante.existente_en_almacen}`;
  }

  // ✅ CORREGIDO: Convertir a número antes de formatear
  getVariantePrecio(variante: Variante): number {
    return parseFloat(variante.precio_por_unidad);
  }
}