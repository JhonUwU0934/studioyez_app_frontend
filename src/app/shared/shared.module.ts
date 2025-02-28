import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Error404Component } from './pages/error404/error404.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { CarouselLittleComponent } from './components/carousel-little/carousel-little.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormComponent } from './components/form/form.component';
import { ButtonComponent } from './components/button/button.component';
import { ModalComponent } from './components/modal/modal.component';
import { InputComponent } from './components/input/input.component';
import { SelectComponent } from './components/select/select.component';
import { SliderLittleComponent } from './components/slider-little/slider-little.component';
import { CardInfoComponent } from './components/card-info/card-info.component';
import { AccordionDirective } from './directives/accordion.directive';
import { LoaderComponent } from './components/loader/loader.component';
import { CardOptionComponent } from './components/card-option/card-option.component';
import { RouterModule } from '@angular/router';
import { CardPayComponent } from './components/card-pay/card-pay.component';
import { ModalChangeComponent } from './components/modal-change/modal-change.component';
import { ButtonClickComponent } from './components/button-click/button-click.component';
import { CustomNumberPipe } from './pipes/custom-number.pipe';
import { FiltroPipe } from './pipes/filtro.pipe';
import { FormatoNumericoDirective } from './directives/formato-numerico.directive';
import { PointsLoaderComponent } from './components/points-loader/points-loader.component';
import { TextFilterPipe } from './pipes/text-filter.pipe';
import { SkeletonComponent } from './components/skeleton/skeleton.component';
import { SkeletonRectComponent } from './components/skeleton-rect/skeleton-rect.component';
import { SkeletonDirective } from './directives/skeleton.directive';
import { SkeletonRectangleDirective } from './directives/skeleton-rectangle.directive';
import { SearchSalePipe } from './pipes/search-sale.pipe';





@NgModule({
  declarations: [
    Error404Component,
    ResetPasswordComponent,
    CarouselLittleComponent,
    FormComponent,
    ButtonComponent,
    ModalComponent,
    InputComponent,
    SelectComponent,
    SliderLittleComponent,
    CardInfoComponent,
    AccordionDirective,
    LoaderComponent,
    CardOptionComponent,
    CardPayComponent,
    ModalChangeComponent,
    ButtonClickComponent,
    CustomNumberPipe,
    FiltroPipe,
    FormatoNumericoDirective,
    PointsLoaderComponent,
    TextFilterPipe, 
    SkeletonComponent,
    SkeletonRectComponent,
    SkeletonDirective,
    SkeletonRectangleDirective,
    SearchSalePipe

  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports:[
    CarouselLittleComponent,
    FormComponent,
    ButtonComponent,
    ModalComponent,
    InputComponent,
    SelectComponent,
    SliderLittleComponent,
    CardInfoComponent,
    AccordionDirective,
    LoaderComponent,
    CardOptionComponent,
    CardPayComponent,
    ModalChangeComponent,
    ButtonClickComponent,
    CustomNumberPipe,
    FiltroPipe,
    FormatoNumericoDirective,
    PointsLoaderComponent,
    TextFilterPipe, 
    SkeletonComponent,
    SkeletonRectComponent,
    SkeletonDirective,
    SkeletonRectangleDirective,
    SearchSalePipe

  ]
})
export class SharedModule { }
