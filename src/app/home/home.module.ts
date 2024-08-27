import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './pages/home/home.component';
import { HomeRoutingModule } from './home-routing.module';
import { LayoutComponent } from './pages/layout/layout.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { SalesComponent } from './pages/sales/sales.component';
import { ConfigurationComponent } from './pages/configuration/configuration.component';
import { SalesFormComponent } from './pages/sales-form/sales-form.component';
import { CardDetailsComponent } from './components/card-details/card-details.component';
import { ProductsComponent } from './pages/products/products.component';
import { BillsComponent } from './pages/bills/bills.component';
import { BillsFormComponent } from './pages/bills-form/bills-form.component';
import { ProductsFormComponent } from './pages/products-form/products-form.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { DevolucionesComponent } from './pages/devoluciones/devoluciones.component';
import { DevolucionesFormComponent } from './pages/devoluciones-form/devoluciones-form.component';
import { IngresoMercanciaFormComponent } from './pages/ingreso-mercancia-form/ingreso-mercancia-form.component';
import { IngresoMercanciaComponent } from './pages/ingreso-mercancia/ingreso-mercancia.component';


@NgModule({
  declarations: [
    HomeComponent,
    LayoutComponent,
    InvoicesComponent,
    SalesComponent,
    ConfigurationComponent,
    SalesFormComponent,
    CardDetailsComponent,
    ProductsComponent,
    BillsComponent,
    BillsFormComponent,
    ProductsFormComponent,
    DevolucionesComponent,
    DevolucionesFormComponent,
    IngresoMercanciaFormComponent,
    IngresoMercanciaComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule,
  ]
})
export class HomeModule { }
