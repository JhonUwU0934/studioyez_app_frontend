import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, Subject, BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, startWith, map, shareReplay } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/services/auth.service';
import { inputModel } from 'src/app/shared/models/input.model';
import { ApiGetService } from 'src/app/shared/services/api-get.service';
import { ApiPostService } from 'src/app/shared/services/api-post.service';
import { ButtonService } from 'src/app/shared/services/button.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { environments } from 'src/environments/environments';

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
  existente_en_almacen: number;
  variantes_count?: number;
  tiene_variantes?: boolean;
}

@Component({
  selector: 'app-ingreso-mercancia-form',
  templateUrl: './ingreso-mercancia-form.component.html',
  styleUrls: ['./ingreso-mercancia-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IngresoMercanciaFormComponent implements OnInit, OnDestroy {

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private apiPost = inject(ApiPostService);
  private apiGet = inject(ApiGetService);
  private modalService = inject(ModalService);
  private buttonService = inject(ButtonService);
  private router = inject(Router);
  private activateR = inject(ActivatedRoute);
  private loader = inject(LoaderService);
  private cdr = inject(ChangeDetectorRef);

  private baseUrl: string = environments.baseUrl;
  private subscriptions$ = new Subscription();
  private destroy$ = new Subject<void>();

  // Observables y Subjects para manejo de estado
  private productosSubject$ = new BehaviorSubject<Producto[]>([]);
  private variantesSubject$ = new BehaviorSubject<ProductoVariante[]>([]);
  private filtroProductoSubject$ = new Subject<string>();
  private filtroVarianteSubject$ = new Subject<string>();
  private dropdownProductosSubject$ = new BehaviorSubject<boolean>(false);
  private dropdownVariantesSubject$ = new BehaviorSubject<boolean>(false);

  // Streams observables
  productos$ = this.productosSubject$.asObservable();
  variantes$ = this.variantesSubject$.asObservable();
  mostrarDropdownProductos$ = this.dropdownProductosSubject$.asObservable();
  mostrarDropdownVariantes$ = this.dropdownVariantesSubject$.asObservable();

  // Filtros con debounce optimizados
  productosFiltrados$!: Observable<Producto[]>;
  variantesFiltradas$!: Observable<ProductoVariante[]>;

  token!: string;
  productoSeleccionado: Producto | null = null;
  varianteSeleccionada: ProductoVariante | null = null;
  cargandoVariantes = false;
  isLoading = false;
  tipoIngreso: 'producto' | 'variante' = 'producto';

  // Estados de UI
  filtroProducto = '';
  filtroVariante = '';

  productForm: FormGroup = this.fb.group({
    producto_id: [''],
    producto_variante_id: [''],
    fecha: ['', [Validators.required]],
    cantidad: ['', [Validators.required, Validators.min(1)]],
  });

  arrayInput3: inputModel = {
    labelExists: true,
    iconExists: false,
    decimal: false,
    name: 'Fecha ingreso',
    placeholder: 'Fecha ingreso',
    icon: 'fa-solid fa-calendar',
    controlName: 'fecha',
    type: 'date',
  };

  arrayInput4: inputModel = {
    labelExists: true,
    iconExists: false,
    decimal: false,
    name: 'Cantidad ingreso',
    placeholder: 'Cantidad ingreso',
    icon: 'fa-solid fa-boxes',
    controlName: 'cantidad',
    type: 'number',
  };

  ngOnInit(): void {
    this.initializeComponent();
    this.setupStreams();
    this.setupDynamicValidations();
    this.loadInitialData();
  }

  private initializeComponent(): void {
    // Establecer fecha actual por defecto
    const today = new Date().toISOString().split('T')[0];
    this.productForm.patchValue({ fecha: today });
    
    // Inicializar los filtros para asegurar que los observables funcionen desde el inicio
    this.filtroProductoSubject$.next('');
    this.filtroVarianteSubject$.next('');
  }

  private setupStreams(): void {
    // Stream para productos filtrados SIN debounce para filtrado en tiempo real
    this.productosFiltrados$ = combineLatest([
      this.productos$,
      this.filtroProductoSubject$.pipe(
        startWith(''),
        distinctUntilChanged()
      )
    ]).pipe(
      map(([productos, filtro]) => this.filtrarProductosOptimizado(productos, filtro)),
      shareReplay(1)
    );

    // Stream para variantes filtradas SIN debounce para filtrado en tiempo real
    this.variantesFiltradas$ = combineLatest([
      this.variantes$,
      this.filtroVarianteSubject$.pipe(
        startWith(''),
        distinctUntilChanged()
      )
    ]).pipe(
      map(([variantes, filtro]) => this.filtrarVariantesOptimizado(variantes, filtro)),
      shareReplay(1)
    );
  }

  private setupDynamicValidations(): void {
    this.productForm.addValidators((control) => {
      const productoId = control.get('producto_id')?.value;
      const productoVarianteId = control.get('producto_variante_id')?.value;
      
      if (!productoId && !productoVarianteId) {
        return { requiredProductoOVariante: true };
      }
      return null;
    });
  }

  private loadInitialData(): void {
    this.subscriptions$.add(
      this.auth.getUsuario.subscribe((usuario) => {
        this.token = 'Bearer ' + usuario.token;
        this.getProducts();
      })
    );
  }

  // Métodos de filtrado optimizados
  private filtrarProductosOptimizado(productos: Producto[], filtro: string): Producto[] {
    if (!filtro.trim()) {
      return productos;
    }

    const filtroLower = filtro.toLowerCase().trim();
    return productos.filter(producto => {
      const denominacion = producto.denominacion?.toLowerCase() || '';
      const codigo = producto.codigo?.toLowerCase() || '';
      return denominacion.includes(filtroLower) || codigo.includes(filtroLower);
    });
  }

  private filtrarVariantesOptimizado(variantes: ProductoVariante[], filtro: string): ProductoVariante[] {
    if (!filtro.trim()) {
      return variantes;
    }

    const filtroLower = filtro.toLowerCase().trim();
    return variantes.filter(variante => {
      const sku = variante.sku?.toLowerCase() || '';
      const colorNombre = variante.color?.nombre?.toLowerCase() || '';
      const tallaNombre = variante.talla?.nombre?.toLowerCase() || '';
      const nombreDisplay = variante.nombre_display?.toLowerCase() || '';
      
      return sku.includes(filtroLower) || 
             colorNombre.includes(filtroLower) || 
             tallaNombre.includes(filtroLower) || 
             nombreDisplay.includes(filtroLower);
    });
  }

  // TrackBy functions para optimizar *ngFor
  trackByProductoId = (index: number, producto: Producto): number => producto.id;
  trackByVarianteId = (index: number, variante: ProductoVariante): number => variante.id;

  getProducts(): void {
    this.loader.setLoader(true);
    const UrlApi = `${this.baseUrl}/api/v1/productos`;
    const headers = { 'Authorization': this.token };

    this.subscriptions$.add(
      this.apiGet.getDebtInfo(UrlApi, headers).subscribe({
        next: (resp) => {
          const productos = (resp.data || []).map((producto: Producto) => ({
            ...producto,
            tiene_variantes: (producto.variantes_count || 0) > 0
          }));
          
          this.productosSubject$.next(productos);
          this.loader.setLoader(false);
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error al cargar productos:', error);
          this.modalService.showError('Error al cargar productos');
          this.loader.setLoader(false);
          this.cdr.markForCheck();
        }
      })
    );
  }

  // Métodos de filtrado con respuesta inmediata
  onFiltroProductoChange(filtro: string): void {
    this.filtroProducto = filtro;
    this.filtroProductoSubject$.next(filtro);
    
    // Abrir dropdown automáticamente al escribir
    if (filtro.length > 0) {
      this.toggleDropdownProductos(true);
    } else {
      this.toggleDropdownProductos(false);
    }
    
    // Forzar detección de cambios para respuesta inmediata
    this.cdr.markForCheck();
  }

  onFiltroVarianteChange(filtro: string): void {
    this.filtroVariante = filtro;
    this.filtroVarianteSubject$.next(filtro);
    
    // Abrir dropdown automáticamente al escribir
    if (filtro.length > 0) {
      this.toggleDropdownVariantes(true);
    } else {
      this.toggleDropdownVariantes(false);
    }
    
    // Forzar detección de cambios para respuesta inmediata
    this.cdr.markForCheck();
  }

  seleccionarProductoFiltrado(producto: Producto): void {
    this.productoSeleccionado = producto;
    this.filtroProducto = `${producto.denominacion} - ${producto.codigo}`;
    this.toggleDropdownProductos(false);
    
    // Limpiar selección de variante
    this.limpiarSeleccionVariante();
    this.tipoIngreso = 'producto';
    
    if (producto.tiene_variantes) {
      this.cargarVariantes(producto.id);
      // No establecer producto_id aún, esperar a que el usuario elija el tipo
      this.productForm.patchValue({ 
        producto_id: null,
        producto_variante_id: null
      });
    } else {
      // Si no tiene variantes, establecer directamente el producto_id
      this.productForm.patchValue({ 
        producto_id: producto.id,
        producto_variante_id: null
      });
    }
    
    this.cdr.markForCheck();
  }

  seleccionarVarianteFiltrada(variante: ProductoVariante): void {
    this.varianteSeleccionada = variante;
    this.filtroVariante = variante.nombre_display;
    this.toggleDropdownVariantes(false);
    this.tipoIngreso = 'variante';
    
    this.productForm.patchValue({ 
      producto_id: null,
      producto_variante_id: variante.id
    });
    
    this.cdr.markForCheck();
  }

  seleccionarTipoIngreso(tipo: 'producto' | 'variante'): void {
    this.tipoIngreso = tipo;
    this.varianteSeleccionada = null;
    
    if (tipo === 'producto') {
      // Ingreso al producto base
      this.productForm.patchValue({ 
        producto_id: this.productoSeleccionado?.id || null,
        producto_variante_id: null
      });
    } else {
      // Preparar para selección de variante - limpiar ambos campos
      this.productForm.patchValue({ 
        producto_id: null,
        producto_variante_id: null
      });
      // Limpiar el filtro de variante para nueva búsqueda
      this.filtroVariante = '';
      this.filtroVarianteSubject$.next('');
    }
    
    console.log('Tipo seleccionado:', tipo);
    console.log('Valores del formulario después de selección:', this.productForm.value);
    
    this.cdr.markForCheck();
  }

  cargarVariantes(productoId: number): void {
    this.cargandoVariantes = true;
    this.cdr.markForCheck();
    
    const UrlApi = `${this.baseUrl}/api/v1/productos/${productoId}/variantes`;
    const headers = { 'Authorization': this.token };

    this.subscriptions$.add(
      this.apiGet.getDebtInfo(UrlApi, headers).subscribe({
        next: (resp) => {
          this.variantesSubject$.next(resp.data || []);
          this.cargandoVariantes = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error al cargar variantes:', error);
          this.modalService.showError('Error al cargar variantes del producto');
          this.cargandoVariantes = false;
          this.cdr.markForCheck();
        }
      })
    );
  }

  // Métodos de limpieza optimizados
  limpiarFiltroProducto(): void {
    this.filtroProducto = '';
    this.filtroProductoSubject$.next('');
    this.productoSeleccionado = null;
    this.toggleDropdownProductos(false);
    this.resetFormulario();
    this.cdr.markForCheck();
  }

  limpiarFiltroVariante(): void {
    this.filtroVariante = '';
    this.filtroVarianteSubject$.next('');
    this.limpiarSeleccionVariante();
    this.cdr.markForCheck();
  }

  private limpiarSeleccionVariante(): void {
    this.varianteSeleccionada = null;
    this.toggleDropdownVariantes(false);
    this.tipoIngreso = 'producto';
    
    if (this.productoSeleccionado) {
      this.productForm.patchValue({ 
        producto_id: this.productoSeleccionado.id,
        producto_variante_id: null
      });
    } else {
      this.productForm.patchValue({ 
        producto_id: null,
        producto_variante_id: null
      });
    }
  }

  // Métodos de toggle optimizados
  toggleDropdownProductos(show?: boolean): void {
    const newState = show !== undefined ? show : !this.dropdownProductosSubject$.value;
    this.dropdownProductosSubject$.next(newState);
    
    if (newState) {
      this.dropdownVariantesSubject$.next(false);
    }
  }

  toggleDropdownVariantes(show?: boolean): void {
    const newState = show !== undefined ? show : !this.dropdownVariantesSubject$.value;
    this.dropdownVariantesSubject$.next(newState);
    
    if (newState) {
      this.dropdownProductosSubject$.next(false);
    }
  }

  closeDropdowns(): void {
    this.dropdownProductosSubject$.next(false);
    this.dropdownVariantesSubject$.next(false);
  }

  resetFormulario(): void {
    this.productoSeleccionado = null;
    this.varianteSeleccionada = null;
    this.variantesSubject$.next([]);
    this.tipoIngreso = 'producto';
    this.filtroProducto = '';
    this.filtroVariante = '';
    this.filtroProductoSubject$.next('');
    this.filtroVarianteSubject$.next('');
    this.closeDropdowns();
    
    this.productForm.patchValue({ 
      producto_id: null,
      producto_variante_id: null
    });
    
    this.cdr.markForCheck();
  }

  // Métodos de utilidad
  getStockActual(): number {
    if (this.tipoIngreso === 'variante' && this.varianteSeleccionada) {
      return this.varianteSeleccionada.existente_en_almacen;
    } else if (this.tipoIngreso === 'producto' && this.productoSeleccionado) {
      return this.productoSeleccionado?.existente_en_almacen || 0;
    }
    return 0;
  }

  getNombreCompleto(): string {
    if (!this.productoSeleccionado) return '';
    
    let nombre = this.productoSeleccionado?.denominacion || '';
    
    if (this.tipoIngreso === 'variante' && this.varianteSeleccionada) {
      const detalles = [];
      if (this.varianteSeleccionada.color) {
        detalles.push(this.varianteSeleccionada.color.nombre);
      }
      if (this.varianteSeleccionada.talla) {
        detalles.push(this.varianteSeleccionada.talla.nombre);
      }
      if (detalles.length > 0) {
        nombre += ` (${detalles.join(' - ')})`;
      }
    }
    
    return nombre;
  }

  getSkuMostrar(): string {
    if (this.tipoIngreso === 'variante' && this.varianteSeleccionada && this.varianteSeleccionada.sku) {
      return this.varianteSeleccionada.sku;
    } else if (this.productoSeleccionado) {
      return this.productoSeleccionado?.codigo || '';
    }
    return '';
  }

  tieneSeleccionValida(): boolean {
    return (this.tipoIngreso === 'producto' && !!this.productoSeleccionado) ||
           (this.tipoIngreso === 'variante' && !!this.varianteSeleccionada);
  }

  getSubmit(): void {
    console.log('=== INICIO SUBMIT ===');
    console.log('Tipo ingreso:', this.tipoIngreso);
    console.log('Producto seleccionado:', this.productoSeleccionado);
    console.log('Variante seleccionada:', this.varianteSeleccionada);
    console.log('Formulario valores:', this.productForm.value);
    console.log('Formulario válido:', this.productForm.valid);
    console.log('Tiene selección válida:', this.tieneSeleccionValida());

    // Validación mejorada antes del envío
    if (!this.tieneSeleccionValida()) {
      this.modalService.showError('Debe seleccionar un producto o una variante');
      return;
    }

    if (this.productForm.invalid) {
      this.markFormGroupTouched(this.productForm);
      this.modalService.showError('Por favor completa todos los campos requeridos');
      return;
    }

    // Preparar datos con validación adicional
    const formData = this.productForm.getRawValue();
    
    const paramsBody: any = {
      fecha: formData.fecha,
      cantidad_de_ingreso: parseInt(formData.cantidad)
    };

    // Solo agregar los campos que realmente necesitamos
    if (this.tipoIngreso === 'producto' && this.productoSeleccionado) {
      paramsBody.producto_id = this.productoSeleccionado.id;
      // NO incluir producto_variante_id
    } else if (this.tipoIngreso === 'variante' && this.varianteSeleccionada) {
      paramsBody.producto_variante_id = this.varianteSeleccionada.id;
      // NO incluir producto_id - el backend lo asignará automáticamente
    } else {
      this.modalService.showError('Error: No se pudo determinar el producto o variante a ingresar');
      return;
    }

    console.log('Datos a enviar:', paramsBody);

    // Validar cantidad
    if (isNaN(paramsBody.cantidad_de_ingreso) || paramsBody.cantidad_de_ingreso <= 0) {
      this.modalService.showError('La cantidad debe ser un número mayor a 0');
      return;
    }

    this.isLoading = true;
    this.buttonService.setCHange(true);
    this.cdr.markForCheck();

    const headers = { Authorization: this.token };
    const UrlApi = `${this.baseUrl}/api/v1/ingresodemercancia`;

    this.subscriptions$.add(
      this.apiPost.getDebtInfo(UrlApi, paramsBody, headers).subscribe({
        next: (resp) => {
          console.log('Respuesta exitosa:', resp);
          this.isLoading = false;
          this.buttonService.setCHange(false);
          this.cdr.markForCheck();
          
          this.modalService.showSuccess('Ingreso de mercancía registrado exitosamente');
          
          setTimeout(() => {
            this.router.navigate(['/home/ingreso-mercancia']);
          }, 1500);
        },
        error: (error) => {
          console.error('Error completo:', error);
          console.error('Error response:', error.error);
          console.error('Error status:', error.status);
          console.error('Error statusText:', error.statusText);
          
          // Log detallado de errores de validación
          if (error.error && error.error.errors) {
            console.error('Errores de validación específicos:', error.error.errors);
            Object.keys(error.error.errors).forEach(key => {
              console.error(`Campo ${key}:`, error.error.errors[key]);
            });
          }
          
          this.isLoading = false;
          this.buttonService.setCHange(false);
          this.cdr.markForCheck();
          
          if (error.error && error.error.errors) {
            // Mostrar todos los errores de validación
            const allErrors = Object.entries(error.error.errors)
              .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
              .join('\n');
            this.modalService.showError(`Errores de validación:\n${allErrors}`);
          } else if (error.error && error.error.error) {
            this.modalService.showError(error.error.error);
          } else {
            this.modalService.showError('Error al registrar el ingreso de mercancía');
          }
        }
      })
    );
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['min']) return `${fieldName} debe ser mayor a ${field.errors['min'].min}`;
    }
    return '';
  }

  doSomething(): void {
    this.router.navigate(['/home/ingreso-mercancia']);
  }

  ngOnDestroy(): void {
    this.subscriptions$.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
    this.loader.setLoader(false);
  }

  debug(): void {
    console.log('=== DEBUG INFO ===');
    console.log('Productos:', this.productosSubject$.value.length);
    console.log('Variantes:', this.variantesSubject$.value.length);
    console.log('Filtro producto:', this.filtroProducto);
    console.log('Filtro variante:', this.filtroVariante);
    console.log('Producto seleccionado:', this.productoSeleccionado);
    console.log('Variante seleccionada:', this.varianteSeleccionada);
    console.log('Tipo ingreso:', this.tipoIngreso);
    console.log('Formulario válido:', this.productForm.valid);
    console.log('Formulario valores:', this.productForm.value);
    console.log('==================');
  }
}