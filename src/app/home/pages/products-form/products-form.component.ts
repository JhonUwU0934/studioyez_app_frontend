import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ApiGetService } from 'src/app/shared/services/api-get.service';
import { ButtonService } from 'src/app/shared/services/button.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { environments } from 'src/environments/environments';

interface Color {
  id: number;
  nombre: string;
  codigo_hex: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

interface Talla {
  id: number;
  nombre: string;
  orden: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-products-form',
  templateUrl: './products-form.component.html',
  styleUrls: ['./products-form.component.scss']
})
export class ProductsFormComponent implements OnInit, OnDestroy {

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private http = inject(HttpClient);
  private apiGet = inject(ApiGetService);
  private modalService = inject(ModalService);
  private buttonService = inject(ButtonService);
  private router = inject(Router);
  private activateR = inject(ActivatedRoute);
  private loader = inject(LoaderService);

  private baseUrl: string = environments.baseUrl;
  private subscriptions$ = new Subscription();

  token!: string;
  productId: string = '';
  duplicateId: string = '';
  product: any;
  colores: Color[] = [];
  tallas: Talla[] = [];
  isLoading = false;
  isEditMode = false;
  isDuplicateMode = false;

  productForm: FormGroup = this.fb.group({
    codigo: ['', [Validators.required, Validators.minLength(2)]],
    denominacion: ['', [Validators.required, Validators.minLength(3)]],
    imagen: [''],
    existente_en_almacen: [''],
    precio_por_mayor: [''],
    precio_por_unidad: [''],
    galeria: this.fb.array([]),
    variantes: this.fb.array([])
  });

  ngOnInit(): void {
    this.subscriptions$.add(
      this.auth.getUsuario.subscribe((usuario) => {
        this.token = 'Bearer ' + usuario.token;
        this.loadInitialData();
      })
    );
    
    // Verificar parámetros de ruta
    this.productId = this.activateR.snapshot.paramMap.get('id') as string;
    this.duplicateId = this.activateR.snapshot.queryParamMap.get('duplicate') as string;
    
    this.isEditMode = !!this.productId;
    this.isDuplicateMode = !!this.duplicateId;
    
    if (this.productId) {
      this.loadProduct(this.productId);
    } else if (this.duplicateId) {
      this.loadProductForDuplication(this.duplicateId);
    } else {
      this.initializeNewProduct();
    }
  }

  private loadInitialData(): void {
    this.loadColores();
    this.loadTallas();
  }

  private loadColores(): void {
    const headers = { 'Authorization': this.token };
    const urlApi = `${this.baseUrl}/api/v1/colores`;
    
    this.subscriptions$.add(
      this.apiGet.getDebtInfo(urlApi, headers).subscribe({
        next: (resp: any) => {
          this.colores = resp.data.filter((color: Color) => color.activo);
          console.log('Colores cargados:', this.colores);
        },
        error: (error) => {
          console.error('Error loading colors:', error);
        }
      })
    );
  }

  private loadTallas(): void {
    const headers = { 'Authorization': this.token };
    const urlApi = `${this.baseUrl}/api/v1/tallas`;
    
    this.subscriptions$.add(
      this.apiGet.getDebtInfo(urlApi, headers).subscribe({
        next: (resp: any) => {
          this.tallas = resp.data
            .filter((talla: Talla) => talla.activo)
            .sort((a: Talla, b: Talla) => a.orden - b.orden);
          console.log('Tallas cargadas:', this.tallas);
        },
        error: (error) => {
          console.error('Error loading sizes:', error);
        }
      })
    );
  }

  public initializeNewProduct(): void {
    this.addGaleriaItem();
    this.addVarianteItem();
  }

  getGaleriaToDeleteCount(): number {
    try {
      return this.galeriaArray.controls.filter(control => {
        const eliminarControl = control.get('eliminar');
        return eliminarControl && eliminarControl.value === true;
      }).length;
    } catch (error) {
      console.error('Error counting galeria items to delete:', error);
      return 0;
    }
  }

  getVariantesToDeleteCount(): number {
    try {
      return this.variantesArray.controls.filter(control => {
        const eliminarControl = control.get('eliminar');
        return eliminarControl && eliminarControl.value === true;
      }).length;
    } catch (error) {
      console.error('Error counting variants to delete:', error);
      return 0;
    }
  }

  private loadProduct(id: string): void {
    this.isLoading = true;
    const urlApi = `${this.baseUrl}/api/v1/productos/${id}`;
    const headers = { 'Authorization': this.token };

    this.subscriptions$.add(
      this.apiGet.getDebtInfo(urlApi, headers).subscribe({
        next: (resp: any) => {
          this.product = resp.data;
          this.populateForm();
          this.isLoading = false;
          console.log('Producto cargado para edición:', this.product);
        },
        error: (error) => {
          console.error('Error loading product:', error);
          this.isLoading = false;
          this.modalService.showError('Error al cargar el producto');
        }
      })
    );
  }

  private loadProductForDuplication(id: string): void {
    this.isLoading = true;
    const urlApi = `${this.baseUrl}/api/v1/productos/${id}`;
    const headers = { 'Authorization': this.token };

    this.subscriptions$.add(
      this.apiGet.getDebtInfo(urlApi, headers).subscribe({
        next: (resp: any) => {
          this.product = resp.data;
          this.populateFormForDuplication();
          this.isLoading = false;
          console.log('Producto cargado para duplicación:', this.product);
        },
        error: (error) => {
          console.error('Error loading product for duplication:', error);
          this.isLoading = false;
          this.modalService.showError('Error al cargar el producto para duplicar');
        }
      })
    );
  }

  private populateForm(): void {
    // Limpiar arrays existentes
    this.clearFormArrays();

    // Llenar datos básicos
    this.productForm.patchValue({
      codigo: this.product.codigo,
      denominacion: this.product.denominacion,
      imagen: this.product.imagen || '',
      existente_en_almacen: this.product.existente_en_almacen || '',
      precio_por_mayor: this.product.precio_por_mayor || '',
      precio_por_unidad: this.product.precio_por_unidad || '',
    });

    // Llenar galería
    if (this.product.imagenes && this.product.imagenes.length > 0) {
      this.product.imagenes.forEach((imagen: any) => {
        this.galeriaArray.push(this.createGaleriaItem(imagen));
      });
    } else {
      this.addGaleriaItem();
    }

    // Llenar variantes
    if (this.product.variantes && this.product.variantes.length > 0) {
      this.product.variantes.forEach((variante: any) => {
        this.variantesArray.push(this.createVarianteItem(variante));
      });
    } else {
      this.addVarianteItem();
    }

    console.log('Formulario poblado con datos del producto');
  }

  private populateFormForDuplication(): void {
    // Limpiar arrays existentes
    this.clearFormArrays();

    // Llenar datos básicos (con código modificado)
    this.productForm.patchValue({
      codigo: `${this.product.codigo}_COPY`,
      denominacion: `${this.product.denominacion} (Copia)`,
      imagen: this.product.imagen || '',
      existente_en_almacen: 0, // Reset stock for copy
      precio_por_mayor: this.product.precio_por_mayor || '',
      precio_por_unidad: this.product.precio_por_unidad || '',
    });

    // Llenar galería (sin IDs para crear nuevas)
    if (this.product.imagenes && this.product.imagenes.length > 0) {
      this.product.imagenes.forEach((imagen: any) => {
        const imagenCopy = { ...imagen };
        delete imagenCopy.id; // Remove ID to create new
        this.galeriaArray.push(this.createGaleriaItem(imagenCopy));
      });
    } else {
      this.addGaleriaItem();
    }

    // Llenar variantes (sin IDs y SKUs únicos)
    if (this.product.variantes && this.product.variantes.length > 0) {
      this.product.variantes.forEach((variante: any, index: number) => {
        const varianteCopy = { ...variante };
        delete varianteCopy.id; // Remove ID to create new
        varianteCopy.sku = `${this.product.codigo}_COPY_${index + 1}`; // Generate unique SKU
        varianteCopy.existente_en_almacen = 0; // Reset stock
        this.variantesArray.push(this.createVarianteItem(varianteCopy));
      });
    } else {
      this.addVarianteItem();
    }

    console.log('Formulario poblado para duplicación');
  }

  private clearFormArrays(): void {
    while (this.galeriaArray.length !== 0) {
      this.galeriaArray.removeAt(0);
    }
    while (this.variantesArray.length !== 0) {
      this.variantesArray.removeAt(0);
    }
  }

  get galeriaArray(): FormArray {
    return this.productForm.get('galeria') as FormArray;
  }

  get variantesArray(): FormArray {
    return this.productForm.get('variantes') as FormArray;
  }

  createGaleriaItem(data?: any): FormGroup {
    return this.fb.group({
      id: [data?.id || null],
      imagen: [data?.imagen || '', [Validators.required]],
      alt_text: [data?.alt_text || ''],
      orden: [data?.orden !== undefined ? data.orden : this.galeriaArray.length],
      eliminar: [false]
    });
  }

  createVarianteItem(data?: any): FormGroup {
    return this.fb.group({
      id: [data?.id || null],
      color_id: [data?.color_id || data?.color?.id || null],
      talla_id: [data?.talla_id || data?.talla?.id || null],
      sku: [data?.sku || ''],
      existente_en_almacen: [data?.existente_en_almacen || 0, [Validators.min(0)]],
      precio_por_mayor: [data?.precio_por_mayor || ''],
      precio_por_unidad: [data?.precio_por_unidad || ''],
      imagen_variante: [data?.imagen_variante || ''],
      activo: [data?.activo !== undefined ? data.activo : true],
      eliminar: [false]
    });
  }

  addGaleriaItem(): void {
    this.galeriaArray.push(this.createGaleriaItem());
  }

  removeGaleriaItem(index: number): void {
    const item = this.galeriaArray.at(index);
    if (item.get('id')?.value && this.isEditMode) {
      // Mark for deletion if editing existing item
      item.get('eliminar')?.setValue(true);
    } else {
      // Remove immediately if new item or not in edit mode
      this.galeriaArray.removeAt(index);
    }
  }

  addVarianteItem(): void {
    this.variantesArray.push(this.createVarianteItem());
  }

  removeVarianteItem(index: number): void {
    const item = this.variantesArray.at(index);
    if (item.get('id')?.value && this.isEditMode) {
      // Mark for deletion if editing existing item
      item.get('eliminar')?.setValue(true);
    } else {
      // Remove immediately if new item or not in edit mode
      this.variantesArray.removeAt(index);
    }
  }

  generateSKU(variantIndex: number): void {
    const variant = this.variantesArray.at(variantIndex);
    const codigo = this.productForm.get('codigo')?.value;
    const colorId = variant.get('color_id')?.value;
    const tallaId = variant.get('talla_id')?.value;

    if (codigo && (colorId || tallaId)) {
      let sku = codigo.toUpperCase();
      
      if (colorId) {
        const color = this.colores.find(c => c.id === parseInt(colorId));
        if (color) {
          sku += '-' + color.nombre.substring(0, 3).toUpperCase();
        }
      }
      
      if (tallaId) {
        const talla = this.tallas.find(t => t.id === parseInt(tallaId));
        if (talla) {
          sku += '-' + talla.nombre;
        }
      }
      
      // Add timestamp to ensure uniqueness
      if (this.isDuplicateMode) {
        sku += '-' + Date.now().toString().slice(-4);
      }
      
      variant.get('sku')?.setValue(sku);
    }
  }

  // Auto-generate SKUs for all variants
  generateAllSKUs(): void {
    for (let i = 0; i < this.variantesArray.length; i++) {
      this.generateSKU(i);
    }
  }

  getColorName(colorId: number): string {
    const color = this.colores.find(c => c.id === colorId);
    return color ? color.nombre : '';
  }

  getColorHex(colorId: number): string {
    const color = this.colores.find(c => c.id === colorId);
    return color ? color.codigo_hex : '#000000';
  }

  getTallaName(tallaId: number): string {
    const talla = this.tallas.find(t => t.id === tallaId);
    return talla ? talla.nombre : '';
  }

  isImageValid(url: string | boolean | null | undefined): boolean {
    if (!url || typeof url !== 'string') {
      return false;
    }
    return url.startsWith('http') || url.startsWith('data:');
  }

  getImageValue(control: any): string {
    const value = control?.value;
    return typeof value === 'string' ? value : '';
  }

  isValidImageUrl(formControl: any): boolean {
    const value = formControl?.value;
    return this.isImageValid(value);
  }

  private formatDataForAPI(formData: any): any {
    // Filtrar galería
    const galeriaLimpia = formData.galeria
      .filter((item: any) => {
        if (item.id && item.eliminar) return true; // Para eliminar
        if (!item.id && item.eliminar) return false; // Ignorar nuevos marcados para eliminar
        return item.imagen && item.imagen.trim() !== '';
      })
      .map((item: any) => {
        const galeriaItem: any = {
          imagen: String(item.imagen || '').trim(),
          alt_text: String(item.alt_text || '').trim(),
          orden: parseInt(item.orden) || 0
        };
        
        if (item.id && this.isEditMode) {
          galeriaItem.id = parseInt(item.id);
        }
        
        if (item.eliminar && this.isEditMode) {
          galeriaItem.eliminar = true;
        }
        
        return galeriaItem;
      });

    // Filtrar variantes
    const variantesLimpias = formData.variantes
      .filter((item: any) => {
        if (item.id && item.eliminar) return true; // Para eliminar
        if (!item.id && item.eliminar) return false; // Ignorar nuevos marcados para eliminar
        return item.color_id || item.talla_id || (item.sku && item.sku.trim() !== '');
      })
      .map((item: any) => {
        const varianteItem: any = {
          existente_en_almacen: parseInt(item.existente_en_almacen) || 0,
          precio_por_mayor: String(item.precio_por_mayor || '').trim(),
          precio_por_unidad: String(item.precio_por_unidad || '').trim(),
          imagen_variante: String(item.imagen_variante || '').trim(),
          activo: Boolean(item.activo)
        };

        if (item.id && this.isEditMode) {
          varianteItem.id = parseInt(item.id);
        }
        
        if (item.color_id) {
          varianteItem.color_id = parseInt(item.color_id);
        }
        
        if (item.talla_id) {
          varianteItem.talla_id = parseInt(item.talla_id);
        }
        
        if (item.sku && item.sku.trim() !== '') {
          varianteItem.sku = String(item.sku).trim();
        }
        
        if (item.eliminar && this.isEditMode) {
          varianteItem.eliminar = true;
        }
        
        return varianteItem;
      });

    // Datos principales
    const dataToSend: any = {
      codigo: String(formData.codigo || '').trim(),
      denominacion: String(formData.denominacion || '').trim(),
      imagen: String(formData.imagen || '').trim(),
      existente_en_almacen: String(formData.existente_en_almacen || '').trim(),
      precio_por_mayor: String(formData.precio_por_mayor || '').trim(),
      precio_por_unidad: String(formData.precio_por_unidad || '').trim()
    };

    if (galeriaLimpia.length > 0) {
      dataToSend.galeria = galeriaLimpia;
    }

    if (variantesLimpias.length > 0) {
      dataToSend.variantes = variantesLimpias;
    }

    return dataToSend;
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.isLoading = true;
      const formData = this.productForm.getRawValue();
      const paramsBody = this.formatDataForAPI(formData);

      console.log('Datos formateados para enviar:', JSON.stringify(paramsBody, null, 2));

      const headers = new HttpHeaders({
        'Authorization': this.token,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      });
      
      const urlApi = this.isEditMode
        ? `${this.baseUrl}/api/v1/productos/${this.productId}`
        : `${this.baseUrl}/api/v1/productos`;

      const httpRequest = this.isEditMode
        ? this.http.put(urlApi, paramsBody, { headers })
        : this.http.post(urlApi, paramsBody, { headers });

      this.subscriptions$.add(
        httpRequest.subscribe({
          next: (resp) => {
            console.log('Producto guardado exitosamente:', resp);
            this.isLoading = false;
            this.buttonService.setCHange(false);
            
            // Show success message
            if (this.isDuplicateMode) {
              this.modalService.showSuccess('Producto duplicado exitosamente');
            } else if (this.isEditMode) {
              this.modalService.showSuccess('Producto actualizado exitosamente');
            } else {
              this.modalService.showSuccess('Producto creado exitosamente');
            }
            
            setTimeout(() => {
              this.router.navigate(['/home/productos']);
            }, 1500);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error completo:', error);
            
            if (error.error && error.error.errors) {
              console.error('Errores de validación detallados:', error.error.errors);
              
              // Show specific validation errors
              const firstError = Object.values(error.error.errors)[0];
              this.modalService.showError(`Error de validación: ${firstError}`);
            } else {
              this.modalService.showError('Error al guardar el producto');
            }
          }
        })
      );
    } else {
      console.log('Formulario inválido');
      this.markFormGroupTouched(this.productForm);
      this.modalService.showError('Por favor completa todos los campos requeridos');
    }
  }

  getItemsToDeleteCount(): number {
    const galeriaToDelete = this.galeriaArray.controls.filter(c => c.get('eliminar')?.value === true).length || 0;
    const variantesToDelete = this.variantesArray.controls.filter(c => c.get('eliminar')?.value === true).length || 0;
    return galeriaToDelete + variantesToDelete;
  }

  hasControlValue(control: any, fieldName: string, expectedValue: any = true): boolean {
    if (!control) return false;
    const field = control.get(fieldName);
    return field ? field.value === expectedValue : false;
  }


  // 3. Agregar método para exponer Math al template
  get mathHelper() {
    return Math;
  }

  private getFormValidationErrors(): any {
    const formErrors: any = {};
    Object.keys(this.productForm.controls).forEach(key => {
      const controlErrors = this.productForm.get(key)?.errors;
      if (controlErrors) {
        formErrors[key] = controlErrors;
      }
    });
    return formErrors;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          }
        });
      }
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['minlength']) return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['min']) return `${fieldName} debe ser mayor a ${field.errors['min'].min}`;
      if (field.errors['pattern']) return `${fieldName} tiene un formato inválido`;
    }
    return '';
  }

  goBack(): void {
    this.router.navigate(['/home/productos']);
  }

  ngOnDestroy(): void {
    if (this.subscriptions$) this.subscriptions$.unsubscribe();
    this.loader.setLoader(false);
  }
}