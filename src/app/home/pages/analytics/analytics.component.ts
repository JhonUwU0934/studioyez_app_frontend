import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ApiGetService } from 'src/app/shared/services/api-get.service';
import { environments } from 'src/environments/environments';
import {
  ChartComponent,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexFill,
  ApexTooltip,
  ApexPlotOptions,
  ApexNonAxisChartSeries,
  ApexAxisChartSeries,
  ApexLegend,
} from 'ng-apexcharts';

export type LineChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  yaxis: ApexYAxis;
  title: ApexTitleSubtitle;
  fill: ApexFill;
  tooltip: ApexTooltip;
  colors: string[];
  legend: ApexLegend;
};

export type BarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  colors: string[];
  title: ApexTitleSubtitle;
  tooltip: ApexTooltip;
  yaxis: ApexYAxis;
};

interface TopProducto {
  id: number;
  denominacion: string;
  codigo: string;
  total_cantidad: number;
  total_vendido: number;
  variantes: any[];
}

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit, OnDestroy {

  private auth = inject(AuthService);
  private apiGet = inject(ApiGetService);
  private baseUrl: string = environments.baseUrl;
  private subscriptions$ = new Subscription();
  token!: string;

  cargando = false;
  topProductos: TopProducto[] = [];
  comparativo: any = null;

  // Chart options
  lineChartOptions!: Partial<LineChartOptions>;
  barChartOptions!: Partial<BarChartOptions>;

  ngOnInit(): void {
    this.subscriptions$.add(
      this.auth.getUsuario.subscribe((usuario) => {
        this.token = 'Bearer ' + usuario.token;
        this.cargarAnalytics();
      })
    );
  }

  cargarAnalytics(): void {
    this.cargando = true;
    const url = `${this.baseUrl}/api/v1/analytics`;
    const headers = { 'Authorization': this.token };

    this.subscriptions$.add(
      this.apiGet.getDebtInfo(url, headers).subscribe({
        next: (resp: any) => {
          this.topProductos = resp.top_productos || [];
          this.comparativo = resp.comparativo || null;
          this.buildBarChart();
          this.buildLineChart();
          this.cargando = false;
        },
        error: () => {
          this.cargando = false;
        }
      })
    );
  }

  buildBarChart(): void {
    const nombres = this.topProductos.map(p => p.denominacion.length > 18 ? p.denominacion.substring(0, 18) + '...' : p.denominacion);
    const cantidades = this.topProductos.map(p => p.total_cantidad);

    this.barChartOptions = {
      series: [{ name: 'Unidades vendidas', data: cantidades }],
      chart: { type: 'bar', height: 350 },
      plotOptions: {
        bar: { horizontal: true, borderRadius: 4, barHeight: '60%' }
      },
      dataLabels: { enabled: true },
      xaxis: { categories: nombres },
      yaxis: { title: { text: '' } },
      colors: ['#007bff'],
      title: { text: 'Top 10 productos mas vendidos', align: 'left', style: { fontSize: '16px' } },
      tooltip: {
        y: { formatter: (val: number) => val + ' unidades' }
      }
    };
  }

  buildLineChart(): void {
    if (!this.comparativo) return;

    const diasMes = 31;
    const labels = Array.from({ length: diasMes }, (_, i) => (i + 1).toString());

    const dataMesActual = [];
    const dataMesAnterior = [];

    for (let d = 1; d <= diasMes; d++) {
      dataMesActual.push(this.comparativo.mes_actual.por_dia[d] ? parseFloat(this.comparativo.mes_actual.por_dia[d]) : 0);
      dataMesAnterior.push(this.comparativo.mes_anterior.por_dia[d] ? parseFloat(this.comparativo.mes_anterior.por_dia[d]) : 0);
    }

    this.lineChartOptions = {
      series: [
        { name: this.comparativo.mes_actual.nombre, data: dataMesActual },
        { name: this.comparativo.mes_anterior.nombre, data: dataMesAnterior },
      ],
      chart: { type: 'area', height: 350 },
      stroke: { curve: 'smooth', width: 2 },
      dataLabels: { enabled: false },
      xaxis: { categories: labels, title: { text: 'Dia del mes' } },
      yaxis: { title: { text: 'Ventas ($)' } },
      fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1 } },
      colors: ['#007bff', '#adb5bd'],
      title: { text: 'Comparativo de ventas mensual', align: 'left', style: { fontSize: '16px' } },
      tooltip: {
        y: { formatter: (val: number) => '$' + val.toLocaleString('es-CO') }
      },
      legend: { position: 'top' }
    };
  }

  formatMoney(valor: number): string {
    return '$' + (valor || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 });
  }

  ngOnDestroy(): void {
    this.subscriptions$.unsubscribe();
  }
}
