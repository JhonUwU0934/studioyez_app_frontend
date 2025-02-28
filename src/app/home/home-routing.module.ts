import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './pages/layout/layout.component';
import { HomeComponent } from './pages/home/home.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { SalesComponent } from './pages/sales/sales.component';
import { ConfigurationComponent } from './pages/configuration/configuration.component';
import { SalesFormComponent } from './pages/sales-form/sales-form.component';
import { ProductsComponent } from './pages/products/products.component';
import { BillsComponent } from './pages/bills/bills.component';
import { BillsFormComponent } from './pages/bills-form/bills-form.component';
import { ProductsFormComponent } from './pages/products-form/products-form.component';
import { DevolucionesComponent } from './pages/devoluciones/devoluciones.component';
import { DevolucionesFormComponent } from './pages/devoluciones-form/devoluciones-form.component';
import { IngresoMercanciaFormComponent } from './pages/ingreso-mercancia-form/ingreso-mercancia-form.component';
import { IngresoMercanciaComponent } from './pages/ingreso-mercancia/ingreso-mercancia.component';


const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'home',
        component: HomeComponent,
      },
      {
        path: 'ventas',
        component: SalesComponent,
      },
      {
        path: 'ventas-form',
        component: SalesFormComponent,
      },
      {
        path: 'ventas-form/:id',
        component: SalesFormComponent,
      },
      {
        path: 'productos',
        component: ProductsComponent,
      },
      {
        path: 'productos-form',
        component: ProductsFormComponent,
      },
      {
        path: 'productos-form/:id',
        component: ProductsFormComponent,
      },
      {
        path: 'gastos',
        component: BillsComponent,
      },
      {
        path: 'gastos-form',
        component: BillsFormComponent,
      },
      {
        path: 'gastos-form/:id',
        component: BillsFormComponent,
      },
      {
        path: 'devolucion',
        component: DevolucionesComponent,
      },
      {
        path: 'devoluciones-form',
        component: DevolucionesFormComponent,
      },
      {
        path: 'ingreso-mercancia',
        component: IngresoMercanciaComponent,
      },
      {
        path: 'ingreso-mercancia-form',
        component: IngresoMercanciaFormComponent,
      },
      {
        path: '**',
        redirectTo: 'home',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
