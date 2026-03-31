import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ApiGetService } from 'src/app/shared/services/api-get.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { environments } from 'src/environments/environments';

interface RegistroIngreso {
  id: number;
  fecha: string;
  cantidad_de_ingreso: number;
  nombre_completo: string;
  sku_mostrar: string;
  es_ingreso_de_variante: boolean;
  producto_base: any;
  producto_variante: any;
}

interface RegistroVenta {
  id: number;
  fecha: string;
  codigo_factura: string;
  nombre_comprador: string;
  precio_venta: number;
  productos: any[];
}

@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.scss']
})
export class HistorialComponent implements OnInit, OnDestroy {

  private auth = inject(AuthService);
  private apiGet = inject(ApiGetService);
  private loader = inject(LoaderService);
  private router = inject(Router);

  private baseUrl: string = environments.baseUrl;
  private subscriptions$ = new Subscription();
  token!: string;

  // Tab activa
  tabActiva: 'ingresos' | 'ventas' = 'ingresos';

  // Data
  ingresos: RegistroIngreso[] = [];
  ventas: RegistroVenta[] = [];
  ventasDetalle: any[] = []; // ventas aplanadas por producto

  // Filtro
  search = '';

  // Paginación
  pIngresos = 1;
  pVentas = 1;

  // Loading
  cargandoIngresos = false;
  cargandoVentas = false;

  ngOnInit(): void {
    this.subscriptions$.add(
      this.auth.getUsuario.subscribe((usuario) => {
        this.token = 'Bearer ' + usuario.token;
        this.cargarIngresos();
        this.cargarVentas();
      })
    );
  }

  cambiarTab(tab: 'ingresos' | 'ventas'): void {
    this.tabActiva = tab;
    this.search = '';
    this.pIngresos = 1;
    this.pVentas = 1;
  }

  cargarIngresos(): void {
    this.cargandoIngresos = true;
    const url = `${this.baseUrl}/api/v1/ingresodemercancia`;
    const headers = { 'Authorization': this.token };

    this.subscriptions$.add(
      this.apiGet.getDebtInfo(url, headers).subscribe({
        next: (resp: any) => {
          this.ingresos = (resp.data || []).map((i: any) => ({
            id: i.id,
            fecha: i.fecha,
            cantidad_de_ingreso: i.cantidad_de_ingreso,
            nombre_completo: i.nombre_completo || i.producto_base?.denominacion || 'Sin nombre',
            sku_mostrar: i.sku_mostrar || i.producto_base?.codigo || '',
            es_ingreso_de_variante: i.es_ingreso_de_variante || false,
            producto_base: i.producto_base,
            producto_variante: i.producto_variante,
          }));
          this.cargandoIngresos = false;
        },
        error: () => {
          this.cargandoIngresos = false;
        }
      })
    );
  }

  cargarVentas(): void {
    this.cargandoVentas = true;
    const url = `${this.baseUrl}/api/v1/ventas`;
    const headers = { 'Authorization': this.token };

    this.subscriptions$.add(
      this.apiGet.getDebtInfo(url, headers).subscribe({
        next: (resp: any) => {
          this.ventas = resp.data || [];

          // Aplanar ventas: una fila por producto vendido
          this.ventasDetalle = [];
          for (const venta of this.ventas) {
            if (venta.productos && venta.productos.length > 0) {
              for (const prod of venta.productos) {
                this.ventasDetalle.push({
                  venta_id: venta.id,
                  fecha: venta.fecha,
                  codigo_factura: venta.codigo_factura,
                  nombre_comprador: venta.nombre_comprador,
                  producto_nombre: prod.denominacion || prod.nombre || 'Sin nombre',
                  producto_codigo: prod.codigo || '',
                  cantidad: prod.cantidad || 1,
                  precio_unitario: prod.precio_unitario_vendido || prod.precio_unidad || 0,
                  total_producto: prod.total_producto || 0,
                  sku: prod.variante_sku || prod.sku_vendido || '',
                  color: prod.color_nombre || '',
                  talla: prod.talla_nombre || '',
                });
              }
            }
          }

          this.cargandoVentas = false;
        },
        error: () => {
          this.cargandoVentas = false;
        }
      })
    );
  }

  // Filtros
  get ingresosFiltrados(): RegistroIngreso[] {
    if (!this.search.trim()) return this.ingresos;
    const s = this.search.toLowerCase();
    return this.ingresos.filter(i =>
      i.nombre_completo?.toLowerCase().includes(s) ||
      i.sku_mostrar?.toLowerCase().includes(s)
    );
  }

  get ventasDetalleFiltradas(): any[] {
    if (!this.search.trim()) return this.ventasDetalle;
    const s = this.search.toLowerCase();
    return this.ventasDetalle.filter((v: any) =>
      v.producto_nombre?.toLowerCase().includes(s) ||
      v.producto_codigo?.toLowerCase().includes(s) ||
      v.nombre_comprador?.toLowerCase().includes(s) ||
      v.sku?.toLowerCase().includes(s)
    );
  }

  formatDate(fecha: string): string {
    if (!fecha) return '';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  formatMoney(valor: number): string {
    return '$' + (valor || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 });
  }

  ngOnDestroy(): void {
    this.subscriptions$.unsubscribe();
    this.loader.setLoader(false);
  }
}
