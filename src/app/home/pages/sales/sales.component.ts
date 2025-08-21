import { Component, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ApiGetService } from 'src/app/shared/services/api-get.service';
import { ButtonService } from 'src/app/shared/services/button.service';
import { EncryptationService } from 'src/app/shared/services/encryptation.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { UtilitiesService } from 'src/app/shared/services/utilities.service';
import { environments } from 'src/environments/environments';

// INTERFACES PARA LAS VENTAS CON VARIANTES
interface VentaProductoPivot {
  id_venta: number;
  id_producto: number;
  id: number;
  id_producto_variante?: number;
  cantidad: number;
  total_producto: string;
  descuento: string;
  sku_vendido?: string;
  precio_unitario_vendido?: string;
  created_at: string;
  updated_at: string;
}

interface ProductoVenta {
  id: number;
  codigo: string;
  denominacion: string;
  imagen?: string;
  existente_en_almacen: number;
  precio_por_mayor: string;
  precio_por_unidad: string;
  created_at?: string;
  updated_at: string;
  pivot: VentaProductoPivot;
}

interface Vendedor {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

interface VentaCompleta {
  id: number;
  producto_id?: number;
  cantidad?: number;
  fecha: string;
  precio_mayorista?: string;
  precio_unidad?: string;
  precio_venta: string;
  nombre_comprador: string;
  numero_comprador: string;
  codigo_factura: string;
  vendedor: Vendedor;
  created_at: string;
  updated_at: string;
  estado_pago?: string;
  url_factura?: string;
  productos: ProductoVenta[];
  loading?: boolean; // Para el estado de carga del botón
  // ✅ NUEVOS CAMPOS PARA CRÉDITO
  valor_efectivo?: string;
  valor_transferencia?: string;
  valor_credito?: string;
  valor_devuelto?: string;
  credito_pagado?: number; // 0=pendiente, 1=pagado, null=sin crédito
  fecha_credito?: string;
  fecha_promesa_pago?: string;
}

interface RespuestaVentas {
  data: VentaCompleta[];
}

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent {

  private fb = inject(FormBuilder); 
  private auth = inject(AuthService); 
  private modalService = inject(ModalService);
  private buttonService = inject(ButtonService);
  public encryptation = inject(EncryptationService);
  private loader = inject(LoaderService);
  private utilities = inject(UtilitiesService);
  private apiGet = inject(ApiGetService);

  private baseUrl: string = environments.baseUrl;

  constructor(private router: Router) {}

  public data: RespuestaVentas = { data: [] };
  public page: number = 0;
  p: number = 1;
  token!: string;
  search: string = '';

  private subscriptions$ = new Subscription();

  ngOnInit(): void {
    this.loader.setLoader(true);

    this.subscriptions$.add(
      this.auth.getUsuario.subscribe(usuario => { 
        this.token = 'Bearer ' + usuario.token; 
      })
    );
 
    const UrlApi = `${this.baseUrl}/api/v1/ventas`;
    const headers = {'Authorization': this.token};

    this.subscriptions$.add(
      this.apiGet.getDebtInfo(UrlApi, headers)
      .subscribe((resp: RespuestaVentas) => {
        this.loader.setLoader(false);
        this.data = resp;
        console.log('Ventas con variantes:', this.data);
      })
    );
  }

  ngOnDestroy(): void {
    if (this.subscriptions$) this.subscriptions$.unsubscribe();
    this.loader.setLoader(false);
  }

  activateSale(id: any, data: VentaCompleta) {
    data.loading = true;

    const UrlApi = `${this.baseUrl}/api/v1/factura`;

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
        data.loading = false;
        window.location.reload();
      })
      .catch(error => {
        console.log('error', error);
        data.loading = false;
      });
  }

  redirigirAPagina(url: string) {
    window.location.href = url;
  }

  nextPage() {
    this.page += 5;
  }

  prevPage() {
    if (this.page > 0) {
      this.page -= 5;
    }
  }

  doSomething() {
    this.router.navigate(['/home/ventas-form']);
  }

  // MÉTODOS PARA MANEJAR VARIANTES

  /**
   * Obtiene el total de productos vendidos en una venta
   */
  getTotalProductos(venta: VentaCompleta): number {
    return venta.productos.reduce((total, producto) => total + producto.pivot.cantidad, 0);
  }

  /**
   * Obtiene el total de productos diferentes en una venta
   */
  getTotalProductosDiferentes(venta: VentaCompleta): number {
    return venta.productos.length;
  }

  /**
   * Verifica si un producto tiene información de variante
   */
  tieneVariante(producto: ProductoVenta): boolean {
    return !!(producto.pivot.id_producto_variante && producto.pivot.sku_vendido);
  }

  /**
   * Obtiene información formateada de la variante
   */
  getInfoVariante(producto: ProductoVenta): string {
    if (!this.tieneVariante(producto)) {
      return 'Sin variante';
    }

    return `SKU: ${producto.pivot.sku_vendido}`;
  }

  /**
   * Obtiene información completa del producto para mostrar
   */
  getInfoProductoCompleta(producto: ProductoVenta): string {
    let info = `${producto.denominacion}`;
    
    if (this.tieneVariante(producto)) {
      info += ` (${producto.pivot.sku_vendido})`;
    }

    return info;
  }

  /**
   * Obtiene información de precios del producto
   */
  getInfoPrecio(producto: ProductoVenta): string {
    const precio = this.tieneVariante(producto) 
      ? producto.pivot.precio_unitario_vendido 
      : producto.precio_por_unidad;
    
    return `Precio: $${parseFloat(precio || '0').toLocaleString()}`;
  }

  /**
   * Obtiene información de cantidad y total
   */
  getInfoCantidadTotal(producto: ProductoVenta): string {
    const total = parseFloat(producto.pivot.total_producto).toLocaleString();
    return `Cantidad: ${producto.pivot.cantidad} | Total: $${total}`;
  }

  /**
   * Determina si mostrar badge de nueva venta (con variantes)
   */
  esVentaConVariantes(venta: VentaCompleta): boolean {
    return venta.productos.some(producto => this.tieneVariante(producto));
  }

  /**
   * Obtiene información de descuentos aplicados
   */
  getTotalDescuentos(venta: VentaCompleta): number {
    return venta.productos.reduce((total, producto) => {
      return total + parseFloat(producto.pivot.descuento || '0');
    }, 0);
  }

  /**
   * Formatea la fecha de manera más legible
   */
  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Método para usar parseFloat en el template
   */
  convertirANumero(valor: string): number {
    return parseFloat(valor || '0');
  }

  /**
   * Verifica si un descuento es mayor a 0
   */
  tieneDescuento(descuento: string): boolean {
    return parseFloat(descuento || '0') > 0;
  }

  /**
   * Cuenta las ventas con variantes
   */
  contarVentasConVariantes(): number {
    return this.data.data.filter(venta => this.esVentaConVariantes(venta)).length;
  }

  /**
   * Calcula el total vendido de todas las ventas
   */
  calcularTotalVendido(): number {
    return this.data.data.reduce((sum, venta) => {
      return sum + parseFloat(venta.precio_venta);
    }, 0);
  }

  /**
   * Obtiene el precio unitario formateado para mostrar
   */
  getPrecioUnitarioFormateado(item: ProductoVenta): number {
    if (this.tieneVariante(item)) {
      return parseFloat(item.pivot.precio_unitario_vendido || '0');
    } else {
      return parseFloat(item.precio_por_unidad || '0');
    }
  }

  // ✅ NUEVOS MÉTODOS PARA GESTIÓN DE CRÉDITOS

  /**
   * Verifica si una venta tiene crédito pendiente
   */
  tieneCredito(venta: VentaCompleta): boolean {
    return !!(venta.valor_credito && parseFloat(venta.valor_credito) > 0);
  }

  /**
   * Verifica si el crédito está pendiente de pago
   */
  creditoPendiente(venta: VentaCompleta): boolean {
    return this.tieneCredito(venta) && venta.credito_pagado === 0;
  }

  /**
   * Verifica si el crédito ya fue pagado
   */
  creditoPagado(venta: VentaCompleta): boolean {
    return this.tieneCredito(venta) && venta.credito_pagado === 1;
  }

  /**
   * Verifica si el crédito está vencido
   */
  creditoVencido(venta: VentaCompleta): boolean {
    if (!this.creditoPendiente(venta)) return false;
    
    const fechaPromesa = new Date(venta.fecha_promesa_pago || '');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaPromesa.setHours(0, 0, 0, 0);
    
    return fechaPromesa < hoy;
  }

  /**
   * Obtiene los días restantes para vencimiento del crédito
   */
  getDiasRestantesCredito(venta: VentaCompleta): number {
    if (!this.creditoPendiente(venta)) return 0;
    
    const fechaPromesa = new Date(venta.fecha_promesa_pago || '');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaPromesa.setHours(0, 0, 0, 0);
    
    const diffTime = fechaPromesa.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  /**
   * Obtiene la clase CSS para el estado del crédito
   */
  getClaseEstadoCredito(venta: VentaCompleta): string {
    if (!this.tieneCredito(venta)) return '';
    
    if (this.creditoPagado(venta)) return 'credito-pagado';
    if (this.creditoVencido(venta)) return 'credito-vencido';
    
    const diasRestantes = this.getDiasRestantesCredito(venta);
    if (diasRestantes <= 3) return 'credito-por-vencer';
    
    return 'credito-vigente';
  }

  /**
   * Ver información detallada de una venta usando fetch
   */
  verDetalleVenta(venta: VentaCompleta) {
    this.loader.setLoader(true);
    
    const UrlApi = `${this.baseUrl}/api/v1/ventas/${venta.id}/detalle-completo`;

    var myHeaders = new Headers();
    myHeaders.append("Authorization", this.token);

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: undefined
    };

    fetch(UrlApi, requestOptions)
      .then(response => response.json())
      .then(result => {
        this.loader.setLoader(false);
        
        if (result.success) {
          // Crear modal con información detallada
          const detalleModal = {
            viewModal: true,
            clickOutside: true,
            title: `Detalle de Venta - ${result.data.codigo_factura}`,
            colorIcon: 'blue',
            icon: 'fa-solid fa-receipt',
            message: this.generarMensajeDetalle(result.data),
            onMethod: () => {
              detalleModal.viewModal = false;
            },
            onMethodAction: () => {},
            loader: false,
            buttonText: 'Cerrar',
          };
          this.modalService.setArray(detalleModal);
        } else {
          this.mostrarErrorDetalle('No se pudo obtener la información de la venta');
        }
      })
      .catch(error => {
        this.loader.setLoader(false);
        console.error('Error al obtener detalle:', error);
        this.mostrarErrorDetalle('No se pudo obtener la información de la venta');
      });
  }

  /**
   * Marcar crédito como pagado
   */
  pagarCredito(venta: VentaCompleta) {
    if (!this.creditoPendiente(venta)) {
      return;
    }

    const confirmModal = {
      viewModal: true,
      clickOutside: true,
      title: 'Confirmar Pago de Crédito',
      colorIcon: 'orange',
      icon: 'fa-solid fa-question-circle',
      message: `¿Está seguro de marcar como pagado el crédito de $${parseFloat(venta.valor_credito || '0').toLocaleString()} de la venta ${venta.codigo_factura}?`,
      onMethod: () => {
        confirmModal.viewModal = false;
      },
      onMethodAction: () => {
        confirmModal.viewModal = false;
        this.ejecutarPagoCredito(venta);
      },
      loader: false,
      buttonText: 'Cancelar',
      isThereaButton2: true, // ✅ AGREGADO: Habilitar segundo botón
      buttonTextSecondary: 'Confirmar Pago', // ✅ CORREGIDO: Era buttonTextAction
    };
    this.modalService.setArray(confirmModal);
  }

  /**
   * Ejecutar el pago del crédito usando fetch (igual que activateSale)
   */
  private ejecutarPagoCredito(venta: VentaCompleta) {
    this.loader.setLoader(true);
    
    const UrlApi = `${this.baseUrl}/api/v1/ventas/${venta.id}/pagar-credito`;

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", this.token);

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({}), // Cuerpo vacío ya que solo necesitamos el ID de la URL
      redirect: undefined
    };

    fetch(UrlApi, requestOptions)
      .then(response => response.json())
      .then(result => {
        this.loader.setLoader(false);
        
        if (result.success) {
          // Actualizar la venta en la lista
          const ventaIndex = this.data.data.findIndex(v => v.id === venta.id);
          if (ventaIndex !== -1) {
            this.data.data[ventaIndex].credito_pagado = 1;
          }

          const successModal = {
            viewModal: true,
            clickOutside: true,
            title: 'Crédito Pagado',
            colorIcon: 'green',
            icon: 'fa-solid fa-check-circle',
            message: `El crédito de $${parseFloat(venta.valor_credito || '0').toLocaleString()} ha sido marcado como pagado exitosamente.`,
            onMethod: () => {
              successModal.viewModal = false;
              // Opcional: recargar la lista para mostrar cambios
              window.location.reload();
            },
            onMethodAction: () => {},
            loader: false,
            buttonText: 'Continuar',
          };
          this.modalService.setArray(successModal);
        } else {
          this.mostrarErrorPago(result.error || 'Error desconocido');
        }
      })
      .catch(error => {
        this.loader.setLoader(false);
        console.error('Error al pagar crédito:', error);
        this.mostrarErrorPago('Error de conexión. Verifique su conexión a internet.');
      });
  }

  /**
   * Mostrar modal de error en detalle
   */
  private mostrarErrorDetalle(mensaje: string) {
    const errorModal = {
      viewModal: true,
      clickOutside: true,
      title: 'Error',
      colorIcon: 'red',
      icon: 'fa-solid fa-triangle-exclamation',
      message: mensaje,
      onMethod: () => {
        errorModal.viewModal = false;
      },
      onMethodAction: () => {},
      loader: false,
      buttonText: 'Cerrar',
    };
    this.modalService.setArray(errorModal);
  }

  /**
   * Mostrar modal de error en pago
   */
  private mostrarErrorPago(mensaje: string) {
    const errorModal = {
      viewModal: true,
      clickOutside: true,
      title: 'Error al Pagar Crédito',
      colorIcon: 'red',
      icon: 'fa-solid fa-triangle-exclamation',
      message: mensaje,
      onMethod: () => {
        errorModal.viewModal = false;
      },
      onMethodAction: () => {},
      loader: false,
      buttonText: 'Cerrar',
    };
    this.modalService.setArray(errorModal);
  }

  /**
   * Generar mensaje detallado para el modal
   */
  private generarMensajeDetalle(venta: any): string {
    let mensaje = `INFORMACIÓN DE CLIENTE:\n`;
    mensaje += `• Nombre: ${venta.nombre_comprador}\n`;
    mensaje += `• Teléfono: ${venta.numero_comprador}\n`;
    mensaje += `• Fecha: ${this.formatearFecha(venta.created_at)}\n`;
    mensaje += `• Vendedor: ${venta.vendedor_info?.name || 'No especificado'}\n\n`;

    mensaje += `INFORMACIÓN DE PAGO:\n`;
    mensaje += `• Total Venta: $${parseFloat(venta.precio_venta).toLocaleString()}\n`;

    // Usar la nueva estructura pago_info
    if (venta.pago_info) {
      if (venta.pago_info.valor_efectivo > 0) {
        mensaje += `• Efectivo: $${parseFloat(venta.pago_info.valor_efectivo).toLocaleString()}\n`;
      }
      if (venta.pago_info.valor_transferencia > 0) {
        mensaje += `• Transferencia: $${parseFloat(venta.pago_info.valor_transferencia).toLocaleString()}\n`;
      }
      if (venta.pago_info.valor_devuelto > 0) {
        mensaje += `• Cambio: $${parseFloat(venta.pago_info.valor_devuelto).toLocaleString()}\n`;
      }
      mensaje += `• Tipo de Pago: ${venta.pago_info.tipo_pago}\n`;
    }

    // Usar la nueva estructura credito_info
    if (venta.credito_info && venta.credito_info.tiene_credito) {
      mensaje += `\nINFORMACIÓN DE CRÉDITO:\n`;
      mensaje += `• Valor Crédito: $${parseFloat(venta.credito_info.valor_credito).toLocaleString()}\n`;
      mensaje += `• Estado: ${venta.credito_info.credito_pagado ? 'Pagado' : 'Pendiente'}\n`;
      
      if (venta.credito_info.fecha_promesa_pago && !venta.credito_info.credito_pagado) {
        mensaje += `• Fecha Promesa: ${venta.credito_info.fecha_promesa_pago}\n`;
        
        if (venta.credito_info.credito_vencido) {
          mensaje += `• ⚠️ CRÉDITO VENCIDO\n`;
        } else {
          mensaje += `• Días restantes: ${venta.credito_info.dias_restantes}\n`;
        }
      }
    }

    // Usar la nueva estructura de productos
    mensaje += `\nPRODUCTOS:\n`;
    mensaje += `• Productos diferentes: ${venta.totales?.cantidad_productos_diferentes || 0}\n`;
    mensaje += `• Cantidad total: ${venta.totales?.total_productos_vendidos || 0} unidades\n`;

    if (venta.productos && venta.productos.length > 0) {
      mensaje += `\nDETALLE DE PRODUCTOS:\n`;
      venta.productos.forEach((item: any, index: number) => {
        mensaje += `${index + 1}. ${item.producto.denominacion}\n`;
        mensaje += `   • Código: ${item.producto.codigo}\n`;
        mensaje += `   • Cantidad: ${item.venta.cantidad}\n`;
        mensaje += `   • Precio unitario: $${parseFloat(item.venta.precio_unitario_vendido).toLocaleString()}\n`;
        mensaje += `   • Total: $${parseFloat(item.venta.total_producto).toLocaleString()}\n`;
        
        if (item.variante) {
          mensaje += `   • Variante: ${item.variante.sku}\n`;
          mensaje += `   • Color: ${item.variante.color.nombre}\n`;
          mensaje += `   • Talla: ${item.variante.talla.nombre}\n`;
        }
        
        if (item.venta.descuento && parseFloat(item.venta.descuento) > 0) {
          mensaje += `   • Descuento: $${parseFloat(item.venta.descuento).toLocaleString()}\n`;
        }
        mensaje += `\n`;
      });
    }

    const totalDescuentos = venta.totales?.total_descuentos || 0;
    if (totalDescuentos > 0) {
      mensaje += `• Total Descuentos: $${parseFloat(totalDescuentos).toLocaleString()}\n`;
    }

    // Información adicional de variantes si existe
    if (venta.variantes_info && venta.variantes_info.tiene_variantes) {
      mensaje += `\nINFORMACIÓN DE VARIANTES:\n`;
      mensaje += `• Tiene variantes: Sí\n`;
      if (venta.variantes_info.colores_vendidos.length > 0) {
        mensaje += `• Colores: ${venta.variantes_info.colores_vendidos.map((c: any) => c.nombre).join(', ')}\n`;
      }
      if (venta.variantes_info.tallas_vendidas.length > 0) {
        mensaje += `• Tallas: ${venta.variantes_info.tallas_vendidas.map((t: any) => t.nombre).join(', ')}\n`;
      }
    }

    return mensaje;
  }

  /**
   * Obtener texto del estado del crédito
   */
  getTextoEstadoCredito(venta: VentaCompleta): string {
    if (!this.tieneCredito(venta)) return '';
    
    if (this.creditoPagado(venta)) return 'Crédito Pagado';
    if (this.creditoVencido(venta)) return 'Crédito Vencido';
    
    const diasRestantes = this.getDiasRestantesCredito(venta);
    if (diasRestantes <= 3) return `Vence en ${diasRestantes} día(s)`;
    
    return `${diasRestantes} días restantes`;
  }

  // ✅ NUEVOS MÉTODOS AUXILIARES PARA EL TEMPLATE

  /**
   * Método parseFloat para usar en el template
   */
  parseFloat(value: string | number): number {
    return parseFloat(value?.toString() || '0');
  }

  /**
   * Verifica si hay alguna venta con crédito
   */
  tieneAlgunaVentaConCredito(): boolean {
    return this.data.data.some(venta => this.tieneCredito(venta));
  }

  /**
   * Cuenta las ventas con crédito
   */
  contarVentasConCredito(): number {
    return this.data.data.filter(venta => this.tieneCredito(venta)).length;
  }

  /**
   * Verifica si hay alguna venta con crédito pendiente
   */
  tieneAlgunaVentaConCreditoPendiente(): boolean {
    return this.data.data.some(venta => this.creditoPendiente(venta));
  }

  /**
   * Cuenta las ventas con crédito pendiente
   */
  contarVentasConCreditoPendiente(): number {
    return this.data.data.filter(venta => this.creditoPendiente(venta)).length;
  }

  /**
   * Verifica si el valor efectivo es mayor a 0
   */
  tieneValorEfectivo(venta: VentaCompleta): boolean {
    return !!(venta.valor_efectivo && parseFloat(venta.valor_efectivo) > 0);
  }

  /**
   * Verifica si el valor transferencia es mayor a 0
   */
  tieneValorTransferencia(venta: VentaCompleta): boolean {
    return !!(venta.valor_transferencia && parseFloat(venta.valor_transferencia) > 0);
  }

  /**
   * Verifica si tiene pago mixto (efectivo o transferencia + crédito)
   */
  tienePagoMixto(venta: VentaCompleta): boolean {
    return this.tieneCredito(venta) && (this.tieneValorEfectivo(venta) || this.tieneValorTransferencia(venta));
  }
}