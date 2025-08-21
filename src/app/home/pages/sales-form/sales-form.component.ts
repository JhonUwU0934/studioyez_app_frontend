import { Component, HostListener, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
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
  stock_disponible: number;
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
  cantidadExcedida: boolean = false; // ✅ NUEVO: Para mostrar error de cantidad excedida
  
  // ✅ NUEVAS PROPIEDADES PARA PAGO COMBINADO + CRÉDITO
  valorEfectivo: number = 0;
  valorTransferencia: number = 0;
  valorCredito: number = 0;
  fechaPromesaPago: string = '';
  totalPagado = signal(0);
  valorDevuelto = signal(0);
  pagoInsuficiente: boolean = false;
  fechaInvalida: boolean = false;

  codigoBuscado: string = '';
  productoEncontrado: ProductoConVariantes | null = null;
  varianteSeleccionada: Variante | null = null;
  cantidadAAgregar: number = 1; // ✅ NUEVO: Cantidad a agregar

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
    valor_efectivo: [0, [Validators.min(0)]],
    valor_transferencia: [0, [Validators.min(0)]],
    valor_credito: [0, [Validators.min(0)]],
    fecha_promesa_pago: [''],
  }, { validators: this.pagoValidoValidator.bind(this) });

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

    // Establecer el producto encontrado para mostrar sus variantes
    this.productoEncontrado = producto;
    this.codigoBuscado = '';
    this.cantidadAAgregar = 1; // ✅ Resetear cantidad
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
    this.cantidadExcedida = false;
    
    // ✅ Ajustar cantidad si excede el máximo disponible
    const maxDisponible = this.getMaxCantidadDisponible();
    if (this.cantidadAAgregar > maxDisponible) {
      this.cantidadAAgregar = maxDisponible;
    }
  }

  // ✅ VALIDADOR PERSONALIZADO PARA PAGO + CRÉDITO
  pagoValidoValidator(group: any) {
    if (!this.isItemsArrayValid()) {
      return { noProductos: true };
    }
    
    const efectivo = group.get('valor_efectivo')?.value || 0;
    const transferencia = group.get('valor_transferencia')?.value || 0;
    const credito = group.get('valor_credito')?.value || 0;
    const fechaPromesa = group.get('fecha_promesa_pago')?.value;
    
    const totalPagado = efectivo + transferencia + credito;
    const totalVenta = this.calcularTotalGeneral();
    
    // Validar que el total sea suficiente
    if (totalPagado < totalVenta) {
      return { pagoInsuficiente: true };
    }
    
    // Validar fecha de promesa si hay crédito
    if (credito > 0) {
      if (!fechaPromesa) {
        return { fechaPromesaRequerida: true };
      }
      
      const fecha = new Date(fechaPromesa);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (fecha <= hoy) {
        return { fechaPromesaInvalida: true };
      }
      
      // Validar que no sea más de 6 meses
      const seiseMeses = new Date();
      seiseMeses.setMonth(seiseMeses.getMonth() + 6);
      
      if (fecha > seiseMeses) {
        return { fechaPromesaMuyLejana: true };
      }
    }
    
    return null;
  }

  // ✅ NUEVOS MÉTODOS PARA PAGO COMBINADO + CRÉDITO
  onValorEfectivoChange() {
    this.valorEfectivo = this.saleForm.get('valor_efectivo')?.value || 0;
    this.calcularTotales();
    this.saleForm.updateValueAndValidity(); // ✅ Actualizar validación
  }

  onValorTransferenciaChange() {
    this.valorTransferencia = this.saleForm.get('valor_transferencia')?.value || 0;
    this.calcularTotales();
    this.saleForm.updateValueAndValidity(); // ✅ Actualizar validación
  }

  onValorCreditoChange() {
    this.valorCredito = this.saleForm.get('valor_credito')?.value || 0;
    this.calcularTotales();
    this.saleForm.updateValueAndValidity(); // ✅ Actualizar validación
  }

  onFechaPromesaChange() {
    this.fechaPromesaPago = this.saleForm.get('fecha_promesa_pago')?.value || '';
    this.saleForm.updateValueAndValidity(); // ✅ Actualizar validación
  }

  calcularTotales() {
    const totalVenta = this.calcularTotalGeneral();
    const totalPagado = this.valorEfectivo + this.valorTransferencia + this.valorCredito;
    
    this.totalPagado.set(totalPagado);
    
    if (totalPagado < totalVenta && totalPagado > 0) {
      this.pagoInsuficiente = true;
      this.valorDevuelto.set(0);
    } else {
      this.pagoInsuficiente = false;
      // El cambio se calcula solo sobre efectivo + transferencia (no crédito)
      const pagadoEnEfectivo = this.valorEfectivo + this.valorTransferencia;
      const cambio = Math.max(0, pagadoEnEfectivo - totalVenta);
      this.valorDevuelto.set(cambio);
    }
  }

  // ✅ MÉTODOS AUXILIARES PARA VALIDACIÓN + CRÉDITO
  esPagoValido(): boolean {
    const totalVenta = this.calcularTotalGeneral();
    const totalPagado = this.valorEfectivo + this.valorTransferencia + this.valorCredito;
    return totalPagado >= totalVenta;
  }

  getTotalRestante(): number {
    const totalVenta = this.calcularTotalGeneral();
    const totalPagado = this.valorEfectivo + this.valorTransferencia + this.valorCredito;
    return Math.max(0, totalVenta - totalPagado);
  }

  // ✅ NUEVO: Método para validar fecha mínima
  getFechaMinima(): string {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    return manana.toISOString().split('T')[0];
  }

  // ✅ NUEVO: Método para validar fecha máxima (6 meses)
  getFechaMaxima(): string {
    const seiseMeses = new Date();
    seiseMeses.setMonth(seiseMeses.getMonth() + 6);
    return seiseMeses.toISOString().split('T')[0];
  }

  // ✅ MÉTODOS PARA BOTONES DE ACCESO RÁPIDO + CRÉDITO
  pagarSoloEfectivo() {
    const totalVenta = this.calcularTotalGeneral();
    this.saleForm.patchValue({
      valor_efectivo: totalVenta,
      valor_transferencia: 0,
      valor_credito: 0,
      fecha_promesa_pago: ''
    });
    this.valorEfectivo = totalVenta;
    this.valorTransferencia = 0;
    this.valorCredito = 0;
    this.fechaPromesaPago = '';
    this.calcularTotales();
    this.saleForm.updateValueAndValidity(); // ✅ Actualizar validación
  }

  pagarSoloTransferencia() {
    const totalVenta = this.calcularTotalGeneral();
    this.saleForm.patchValue({
      valor_efectivo: 0,
      valor_transferencia: totalVenta,
      valor_credito: 0,
      fecha_promesa_pago: ''
    });
    this.valorEfectivo = 0;
    this.valorTransferencia = totalVenta;
    this.valorCredito = 0;
    this.fechaPromesaPago = '';
    this.calcularTotales();
    this.saleForm.updateValueAndValidity(); // ✅ Actualizar validación
  }

  pagarSoloCredito() {
    const totalVenta = this.calcularTotalGeneral();
    const fechaPromesa = this.getFechaMinima();
    this.saleForm.patchValue({
      valor_efectivo: 0,
      valor_transferencia: 0,
      valor_credito: totalVenta,
      fecha_promesa_pago: fechaPromesa
    });
    this.valorEfectivo = 0;
    this.valorTransferencia = 0;
    this.valorCredito = totalVenta;
    this.fechaPromesaPago = fechaPromesa;
    this.calcularTotales();
    this.saleForm.updateValueAndValidity(); // ✅ Actualizar validación
  }

  pagarMitadMitad() {
    const totalVenta = this.calcularTotalGeneral();
    const mitad = totalVenta / 2;
    this.saleForm.patchValue({
      valor_efectivo: mitad,
      valor_transferencia: mitad,
      valor_credito: 0,
      fecha_promesa_pago: ''
    });
    this.valorEfectivo = mitad;
    this.valorTransferencia = mitad;
    this.valorCredito = 0;
    this.fechaPromesaPago = '';
    this.calcularTotales();
    this.saleForm.updateValueAndValidity(); // ✅ Actualizar validación
  }

  // ✅ NUEVOS MÉTODOS PARA MANEJAR CANTIDAD
  incrementarCantidad() {
    const maxDisponible = this.getMaxCantidadDisponible();
    if (this.cantidadAAgregar < maxDisponible) {
      this.cantidadAAgregar++;
    }
  }

  decrementarCantidad() {
    if (this.cantidadAAgregar > 1) {
      this.cantidadAAgregar--;
    }
  }

  onCantidadInputChange() {
    const maxDisponible = this.getMaxCantidadDisponible();
    
    // Asegurar que la cantidad esté en el rango válido
    if (this.cantidadAAgregar < 1) {
      this.cantidadAAgregar = 1;
    } else if (this.cantidadAAgregar > maxDisponible) {
      this.cantidadAAgregar = maxDisponible;
      this.cantidadExcedida = true;
    } else {
      this.cantidadExcedida = false;
    }
  }

  validarCantidad() {
    this.onCantidadInputChange();
  }

  getMaxCantidadDisponible(): number {
    if (!this.varianteSeleccionada || !this.productoEncontrado) return 0;
    
    // Buscar si ya existe esta variante en el carrito
    const productoExistente = this.productosFiltrados.find(
      item => item.codigo === this.productoEncontrado!.codigo && 
               item.variante_id === this.varianteSeleccionada!.id
    );
    
    // Stock disponible menos lo que ya está en el carrito
    const stockDisponible = this.varianteSeleccionada.existente_en_almacen;
    const cantidadEnCarrito = productoExistente ? productoExistente.cantidad : 0;
    
    return Math.max(0, stockDisponible - cantidadEnCarrito);
  }

  onAgregarProducto() {
    if (!this.productoEncontrado || !this.varianteSeleccionada || this.cantidadAAgregar <= 0) return;

    // ✅ MODIFICADO: Verificar si ya existe la variante en el carrito
    const existingIndex = this.productosFiltrados.findIndex(
      (item) => item.codigo === this.productoEncontrado!.codigo && 
                item.variante_id === this.varianteSeleccionada!.id
    );

    if (existingIndex !== -1) {
      // ✅ Si ya existe, sumar la cantidad
      const productoExistente = this.productosFiltrados[existingIndex];
      const nuevaCantidad = productoExistente.cantidad + this.cantidadAAgregar;
      
      // Verificar que no exceda el stock
      if (nuevaCantidad > this.varianteSeleccionada.existente_en_almacen) {
        this.cantidadExcedida = true;
        this.showStockError();
        return;
      }
      
      // Actualizar cantidad y total
      productoExistente.cantidad = nuevaCantidad;
      productoExistente.total = productoExistente.precio_por_unidad * nuevaCantidad;
      
      // Actualizar en el array de quantities
      this.quantities[existingIndex] = nuevaCantidad;
      
    } else {
      // ✅ Si no existe, crear nuevo producto
      const nuevoProducto: ProductoVenta = {
        codigo: this.productoEncontrado.codigo,
        denominacion: this.productoEncontrado.denominacion,
        cantidad: this.cantidadAAgregar,
        total: parseFloat(this.varianteSeleccionada.precio_por_unidad) * this.cantidadAAgregar,
        descuento: 0,
        precio_por_unidad: parseFloat(this.varianteSeleccionada.precio_por_unidad),
        variante_seleccionada: this.varianteSeleccionada,
        variante_id: this.varianteSeleccionada.id,
        sku_variante: this.varianteSeleccionada.sku,
        color_nombre: this.varianteSeleccionada.color?.nombre || 'Sin color',
        talla_nombre: this.varianteSeleccionada.talla?.nombre || 'Sin talla',
        stock_disponible: this.varianteSeleccionada.existente_en_almacen
      };

      this.productosFiltrados.push(nuevoProducto);
      
      // Inicializar cantidad en el array de quantities
      const newIndex = this.productosFiltrados.length - 1;
      this.quantities[newIndex] = this.cantidadAAgregar;
      this.porcentaje[newIndex] = 0;
    }

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
    this.cantidadExcedida = false; // ✅ NUEVO
  }

  public resetSelection() {
    this.productoEncontrado = null;
    this.varianteSeleccionada = null;
    this.cantidadAAgregar = 1; // ✅ Resetear cantidad
    this.resetErrorStates();
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
    this.calcularTotales(); // ✅ NUEVO: Recalcular totales de pago cuando cambie el total
    this.saleForm.updateValueAndValidity(); // ✅ Actualizar validación cuando cambie el total
  }

  calcularTotalGeneral() {
    return this.productosFiltrados.reduce(
      (total, producto) => total + Number(producto.total),
      0
    );
  }

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
        variante_id: producto.variante_id,
        sku_variante: producto.sku_variante
      };
    });

    return productosReducidos;
  }

  getSubmit() {
    if (!this.isItemsArrayValid()) return;
    
    // Validar que el pago sea suficiente
    if (!this.esPagoValido()) {
      const totalRestante = this.getTotalRestante();
      this.showErrorModal(`Faltan ${totalRestante.toLocaleString()} por pagar para completar la venta`);
      return;
    }

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
      valor_efectivo: this.valorEfectivo,
      valor_transferencia: this.valorTransferencia,
      valor_credito: this.valorCredito,
      fecha_promesa_pago: this.fechaPromesaPago || null,
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
          const cambioMsg = this.valorDevuelto() > 0 ? 
            `\n\nCambio a devolver: ${this.valorDevuelto().toLocaleString()}` : '';
          
          const successModal: modalModel = {
            viewModal: true,
            clickOutside: true,
            title: 'Venta Exitosa',
            colorIcon: 'green',
            icon: 'fa-solid fa-check-circle',
            message: `Venta creada exitosamente. Código: ${result.data.codigo_factura}${cambioMsg}`,
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

  getVariantePrecio(variante: Variante): number {
    return parseFloat(variante.precio_por_unidad);
  }
}