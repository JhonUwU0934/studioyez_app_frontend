import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ApiGetService } from 'src/app/shared/services/api-get.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { environments } from 'src/environments/environments';

interface Cierre {
  fecha_inicio: string;
  fecha_fin: string;
  cantidad_ventas: number;
  total_ventas: number;
  total_efectivo: number;
  total_transferencia: number;
  total_credito: number;
  cantidad_gastos: number;
  total_gastos: number;
  balance: number;
}

@Component({
  selector: 'app-cierres',
  templateUrl: './cierres.component.html',
  styleUrls: ['./cierres.component.scss']
})
export class CierresComponent implements OnInit, OnDestroy {

  private auth = inject(AuthService);
  private apiGet = inject(ApiGetService);
  private loader = inject(LoaderService);
  private baseUrl: string = environments.baseUrl;
  private subscriptions$ = new Subscription();
  token!: string;

  periodo: 'dia' | 'semana' | 'mes' = 'dia';
  cierres: Cierre[] = [];
  cargando = false;
  p = 1;

  // Totales
  totalVentas = 0;
  totalEfectivo = 0;
  totalTransferencia = 0;
  totalCredito = 0;
  totalGastos = 0;
  totalBalance = 0;

  ngOnInit(): void {
    this.subscriptions$.add(
      this.auth.getUsuario.subscribe((usuario) => {
        this.token = 'Bearer ' + usuario.token;
        this.cargarCierres();
      })
    );
  }

  cambiarPeriodo(periodo: 'dia' | 'semana' | 'mes'): void {
    this.periodo = periodo;
    this.p = 1;
    this.cargarCierres();
  }

  cargarCierres(): void {
    this.cargando = true;
    const url = `${this.baseUrl}/api/v1/cierres?periodo=${this.periodo}&limite=90`;
    const headers = { 'Authorization': this.token };

    this.subscriptions$.add(
      this.apiGet.getDebtInfo(url, headers).subscribe({
        next: (resp: any) => {
          this.cierres = resp.data || [];
          this.calcularTotales();
          this.cargando = false;
        },
        error: () => {
          this.cierres = [];
          this.cargando = false;
        }
      })
    );
  }

  calcularTotales(): void {
    this.totalVentas = this.cierres.reduce((s, c) => s + c.total_ventas, 0);
    this.totalEfectivo = this.cierres.reduce((s, c) => s + c.total_efectivo, 0);
    this.totalTransferencia = this.cierres.reduce((s, c) => s + c.total_transferencia, 0);
    this.totalCredito = this.cierres.reduce((s, c) => s + c.total_credito, 0);
    this.totalGastos = this.cierres.reduce((s, c) => s + c.total_gastos, 0);
    this.totalBalance = this.cierres.reduce((s, c) => s + c.balance, 0);
  }

  formatDate(fecha: string): string {
    if (!fecha) return '';
    const d = new Date(fecha + 'T00:00:00');
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatRango(c: Cierre): string {
    if (this.periodo === 'dia') return this.formatDate(c.fecha_inicio);
    return `${this.formatDate(c.fecha_inicio)} - ${this.formatDate(c.fecha_fin)}`;
  }

  formatMoney(valor: number): string {
    return '$' + (valor || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 });
  }

  ngOnDestroy(): void {
    this.subscriptions$.unsubscribe();
  }
}
