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
  private apiPost = inject(ApiPostService);
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

  // NUEVOS MÉTODOS PARA MANEJAR VARIANTES

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

  // ✅ NUEVOS MÉTODOS PARA CORREGIR ERRORES DE TEMPLATE

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
}