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

// INTERFACES PARA INGRESO DE MERCANCÍA CON VARIANTES
interface Color {
  id: number;
  nombre: string;
  codigo_hex: string;
}

interface Talla {
  id: number;
  nombre: string;
}

interface ProductoVariante {
  id: number;
  sku: string;
  existente_en_almacen: number;
  precio_por_mayor: string;
  precio_por_unidad: string;
  color: Color | null;
  talla: Talla | null;
  nombre_display: string;
}

interface Producto {
  id: number;
  codigo: string;
  denominacion: string;
  imagen?: string;
  existente_en_almacen: number;
  precio_por_mayor: string;
  precio_por_unidad: string;
  tiene_variantes?: boolean;
  variantes_count?: number;
  created_at: string;
  updated_at: string;
}

interface IngresoMercancia {
  id: number;
  codigo: number;
  producto_id: number | null;
  producto_variante_id: number | null;
  fecha: string;
  cantidad_de_ingreso: number;
  created_at: string;
  updated_at: string;
  // Relaciones
  producto?: Producto;
  producto_variante?: ProductoVariante;
}

interface RespuestaIngresoMercancia {
  success: boolean;
  data: IngresoMercancia[];
  message?: string;
}

@Component({
  selector: 'app-ingreso-mercancia',
  templateUrl: './ingreso-mercancia.component.html',
  styleUrls: ['./ingreso-mercancia.component.scss']
})
export class IngresoMercanciaComponent {

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private apiPost = inject(ApiPostService);
  private modalService = inject(ModalService);
  private buttonService = inject(ButtonService);
  public encryptation = inject(EncryptationService);
  private loader = inject(LoaderService);
  private utilities = inject(UtilitiesService);
  private apiGet = inject(ApiGetService);

  private baseUrl: string = environments.baseUrl;
  public page: number = 0;
  p: number = 1;
  token!: string;

  constructor(private router: Router) {}

  public data: RespuestaIngresoMercancia = { success: false, data: [] };
  search: string = '';

  private subscriptions$ = new Subscription();

  ngOnInit(): void {
    this.loader.setLoader(true);

    this.subscriptions$.add(
      this.auth.getUsuario.subscribe(usuario => {
        this.token = 'Bearer ' + usuario.token;
        this.cargarIngresos();
      })
    );
  }

  ngOnDestroy(): void {
    if (this.subscriptions$) this.subscriptions$.unsubscribe();
    this.loader.setLoader(false);
  }

  cargarIngresos(): void {
    const UrlApi = `${this.baseUrl}/api/v1/ingresodemercancia`;
    const headers = { 'Authorization': this.token };

    this.subscriptions$.add(
      this.apiGet.getDebtInfo(UrlApi, headers)
        .subscribe((resp: RespuestaIngresoMercancia) => {
          console.log('Ingresos de mercancía:', resp);
          this.loader.setLoader(false);
          this.data = resp;
        })
    );
  }

  // MÉTODOS PARA MANEJAR VARIANTES Y PRODUCTOS

  /**
   * Verifica si un ingreso es de una variante específica
   */
  esIngresoVariante(ingreso: IngresoMercancia): boolean {
    return !!(ingreso.producto_variante_id);
  }

  /**
   * Verifica si un ingreso es de un producto base
   */
  esIngresoProductoBase(ingreso: IngresoMercancia): boolean {
    return !!(ingreso.producto_id && !ingreso.producto_variante_id);
  }

  /**
   * Obtiene el nombre completo del item (producto o variante)
   */
  getNombreCompleto(ingreso: IngresoMercancia): string {
    if (this.esIngresoVariante(ingreso)) {
      // Priorizar nombre de variante si existe
      if (ingreso.producto_variante?.nombre_display) {
        return ingreso.producto_variante.nombre_display;
      }
      
      // Si no hay nombre de variante, construir desde producto + variante
      if (ingreso.producto?.denominacion) {
        let nombre = ingreso.producto.denominacion;
        
        if (ingreso.producto_variante) {
          const detalles = [];
          if (ingreso.producto_variante.color?.nombre) {
            detalles.push(ingreso.producto_variante.color.nombre);
          }
          if (ingreso.producto_variante.talla?.nombre) {
            detalles.push(ingreso.producto_variante.talla.nombre);
          }
          
          if (detalles.length > 0) {
            nombre += ` (${detalles.join(' - ')})`;
          }
        }
        
        return nombre;
      }
      
      return `Variante ID: ${ingreso.producto_variante_id}`;
    } 
    
    if (this.esIngresoProductoBase(ingreso)) {
      return ingreso.producto?.denominacion || `Producto ID: ${ingreso.producto_id}`;
    }
    
    return 'Producto no identificado';
  }

  /**
   * Obtiene el código del item
   */
  getCodigoItem(ingreso: IngresoMercancia): string {
    if (this.esIngresoVariante(ingreso)) {
      // Priorizar SKU de variante
      if (ingreso.producto_variante?.sku) {
        return ingreso.producto_variante.sku;
      }
      // Fallback a código de producto
      if (ingreso.producto?.codigo) {
        return ingreso.producto.codigo;
      }
      return `VAR-${ingreso.producto_variante_id}`;
    }
    
    if (this.esIngresoProductoBase(ingreso)) {
      return ingreso.producto?.codigo || `PRD-${ingreso.producto_id}`;
    }
    
    return 'N/A';
  }

  /**
   * Obtiene el tipo de ingreso para mostrar
   */
  getTipoIngreso(ingreso: IngresoMercancia): string {
    if (this.esIngresoVariante(ingreso)) {
      return 'Variante Específica';
    }
    
    if (this.esIngresoProductoBase(ingreso)) {
      return 'Producto Base';
    }
    
    return 'No identificado';
  }

  /**
   * Obtiene el stock actual del item (0 si no hay relación cargada)
   */
  getStockActual(ingreso: IngresoMercancia): number {
    if (this.esIngresoVariante(ingreso)) {
      return ingreso.producto_variante?.existente_en_almacen || 0;
    }
    
    if (this.esIngresoProductoBase(ingreso)) {
      return ingreso.producto?.existente_en_almacen || 0;
    }
    
    return 0;
  }

  /**
   * Calcula el stock antes del ingreso
   */
  getStockAnterior(ingreso: IngresoMercancia): number {
    return Math.max(0, this.getStockActual(ingreso) - ingreso.cantidad_de_ingreso);
  }

  /**
   * Obtiene información de la variante para mostrar
   */
  getInfoVariante(ingreso: IngresoMercancia): string {
    if (!this.esIngresoVariante(ingreso)) return '';
    
    const variante = ingreso.producto_variante!;
    const detalles = [];
    
    if (variante.color) {
      detalles.push(`Color: ${variante.color.nombre}`);
    }
    
    if (variante.talla) {
      detalles.push(`Talla: ${variante.talla.nombre}`);
    }
    
    return detalles.join(' | ');
  }

  /**
   * Formatea la fecha de manera legible
   */
  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Formatea la fecha con hora
   */
  formatearFechaHora(fecha: string): string {
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
   * Ver detalle completo de un ingreso
   */
  verDetalleIngreso(ingreso: IngresoMercancia): void {
    this.loader.setLoader(true);
    
    const UrlApi = `${this.baseUrl}/api/v1/ingresodemercancia/${ingreso.id}`;
    const headers = { 'Authorization': this.token };

    this.subscriptions$.add(
      this.apiGet.getDebtInfo(UrlApi, headers)
        .subscribe({
          next: (resp: any) => {
            this.loader.setLoader(false);
            
            if (resp.success) {
              this.mostrarModalDetalle(resp.data);
            } else {
              this.mostrarError('No se pudo obtener la información del ingreso');
            }
          },
          error: (error) => {
            this.loader.setLoader(false);
            console.error('Error al obtener detalle:', error);
            this.mostrarError('Error al cargar el detalle del ingreso');
          }
        })
    );
  }

  /**
   * Muestra modal con detalle del ingreso
   */
  private mostrarModalDetalle(ingreso: IngresoMercancia): void {
    const mensaje = this.generarMensajeDetalle(ingreso);

    const detalleModal = {
      viewModal: true,
      clickOutside: true,
      title: `Detalle de Ingreso #${ingreso.codigo}`,
      colorIcon: 'blue',
      icon: 'fa-solid fa-box',
      message: mensaje,
      onMethod: () => {
        detalleModal.viewModal = false;
      },
      onMethodAction: () => {},
      loader: false,
      buttonText: 'Cerrar',
    };
    this.modalService.setArray(detalleModal);
  }

  /**
   * Genera mensaje detallado para el modal
   */
  private generarMensajeDetalle(ingreso: IngresoMercancia): string {
    let mensaje = `INFORMACIÓN DEL INGRESO:\n`;
    mensaje += `• Código de Ingreso: #${ingreso.codigo}\n`;
    mensaje += `• Fecha de Ingreso: ${this.formatearFechaHora(ingreso.fecha)}\n`;
    mensaje += `• Tipo: ${this.getTipoIngreso(ingreso)}\n`;
    mensaje += `• Cantidad Ingresada: ${ingreso.cantidad_de_ingreso} unidades\n\n`;

    mensaje += `INFORMACIÓN DEL PRODUCTO:\n`;
    mensaje += `• Nombre: ${this.getNombreCompleto(ingreso)}\n`;
    mensaje += `• Código/SKU: ${this.getCodigoItem(ingreso)}\n`;

    if (this.esIngresoVariante(ingreso)) {
      mensaje += `• ${this.getInfoVariante(ingreso)}\n`;
      
      if (ingreso.producto_variante!.sku) {
        mensaje += `• SKU Variante: ${ingreso.producto_variante!.sku}\n`;
      }
    }

    mensaje += `\nINFORMACIÓN DE STOCK:\n`;
    mensaje += `• Stock Antes del Ingreso: ${this.getStockAnterior(ingreso)} unidades\n`;
    mensaje += `• Cantidad Ingresada: +${ingreso.cantidad_de_ingreso} unidades\n`;
    mensaje += `• Stock Actual: ${this.getStockActual(ingreso)} unidades\n\n`;

    mensaje += `INFORMACIÓN DE REGISTRO:\n`;
    mensaje += `• Creado: ${this.formatearFechaHora(ingreso.created_at)}\n`;
    mensaje += `• Actualizado: ${this.formatearFechaHora(ingreso.updated_at)}\n`;

    return mensaje;
  }

  /**
   * Muestra modal de error
   */
  private mostrarError(mensaje: string): void {
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

  // MÉTODOS DE NAVEGACIÓN Y UTILIDADES

  nextPage(): void {
    this.page += 5;
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page -= 5;
    }
  }

  doSomething(): void {
    this.router.navigate(['/home/ingreso-mercancia-form']);
  }

  /**
   * Calcula estadísticas de los ingresos
   */
  getTotalIngresos(): number {
    return this.data.data.length;
  }

  /**
   * Calcula total de ingresos con variantes
   */
  getTotalIngresosVariantes(): number {
    return this.data.data.filter(ingreso => this.esIngresoVariante(ingreso)).length;
  }

  /**
   * Calcula total de unidades ingresadas
   */
  getTotalUnidadesIngresadas(): number {
    return this.data.data.reduce((total, ingreso) => total + ingreso.cantidad_de_ingreso, 0);
  }

  /**
   * Obtiene ingresos de hoy
   */
  getIngresosHoy(): number {
    const hoy = new Date().toISOString().split('T')[0];
    return this.data.data.filter(ingreso => {
      const fechaIngreso = new Date(ingreso.fecha).toISOString().split('T')[0];
      return fechaIngreso === hoy;
    }).length;
  }

  /**
   * Verifica si hay ingresos
   */
  hayIngresos(): boolean {
    return this.data.data && this.data.data.length > 0;
  }
}