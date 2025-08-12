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

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent {

  private fb = inject(FormBuilder); 
  private auth = inject(AuthService); 
  private apiPost = inject(ApiPostService);
  private modalService = inject(ModalService);
  private buttonService = inject(ButtonService);
  public  encryptation = inject(EncryptationService);
  private loader = inject(LoaderService);
  private utilities = inject(UtilitiesService)
  private apiGet = inject(ApiGetService);

  private baseUrl: string = environments.baseUrl;
  public page: number = 0;
  p: number = 1;

  public data: any = {};
  search: string = '';
  
  // Variables para el modal de detalles
  isModalVisible: boolean = false;
  selectedProduct: any = null;
  
  private subscriptions$ = new Subscription();

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loader.setLoader(true);
    this.loadProducts();
  }

  ngOnDestroy(): void{
    if (this.subscriptions$) this.subscriptions$.unsubscribe();
    this.loader.setLoader(false);
  }
  
  get Math() {
    return Math;
  }

  private loadProducts(): void {
    let token;
    this.subscriptions$.add(
      this.auth.getUsuario.subscribe(usuario => { 
        token = 'Bearer '+ usuario.token; 
      })
    );
    
    const UrlApi = `${this.baseUrl}/api/v1/productos`;
    const headers = {'Authorization': token};

    this.subscriptions$.add(
      this.apiGet.getDebtInfo(UrlApi, headers)
      .subscribe({
        next: (resp) => {
          console.log('Productos con variantes:', resp);
          this.loader.setLoader(false);
          this.data = resp;
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.loader.setLoader(false);
        }
      })
    );
  }

  nextPage(){
    this.page += 5;
  }

  prevPage(){
    if (this.page > 0) {
      this.page -= 5;
    }
  }

  doSomething(){
    this.router.navigate(['/home/productos-form']);
  }

  // =====================================
  // FUNCIONES PARA MODAL DE DETALLES
  // =====================================

  /**
   * Muestra el modal de detalles del producto
   */
  viewProductDetails(product: any): void {
    console.log('Ver detalles del producto:', product);
    this.selectedProduct = product;
    this.isModalVisible = true;
  }

  /**
   * Cierra el modal de detalles
   */
  closeModal(): void {
    this.isModalVisible = false;
    this.selectedProduct = null;
  }

  /**
   * Edita el producto desde el modal
   */
  editProductFromModal(product: any): void {
    this.closeModal();
    this.editProduct(product);
  }

  /**
   * Navega al formulario de edición
   */
  editProduct(product: any): void {
    console.log('Editar producto:', product);
    this.router.navigate(['/home/productos-form', product.id]);
  }

  /**
   * Elimina un producto (implementar según necesidades)
   */
  deleteProduct(product: any): void {
    // Implementar lógica de eliminación
    console.log('Eliminar producto:', product);
    
    // Ejemplo de confirmación
    if (confirm(`¿Estás seguro de que deseas eliminar el producto "${product.denominacion}"?`)) {
      // Implementar llamada a API de eliminación
      this.performDeleteProduct(product.id);
    }
  }

  private performDeleteProduct(productId: number): void {
    let token;
    this.subscriptions$.add(
      this.auth.getUsuario.subscribe(usuario => { 
        token = 'Bearer '+ usuario.token; 
      })
    );
    
    const UrlApi = `${this.baseUrl}/api/v1/productos/${productId}`;
    const headers = {'Authorization': token};

    this.loader.setLoader(true);

    // Aquí usarías tu servicio de DELETE
    // this.apiDelete.deleteDebtInfo(UrlApi, headers)
    //   .subscribe({
    //     next: (resp) => {
    //       console.log('Producto eliminado:', resp);
    //       this.loadProducts(); // Recargar lista
    //       this.loader.setLoader(false);
    //     },
    //     error: (error) => {
    //       console.error('Error deleting product:', error);
    //       this.loader.setLoader(false);
    //     }
    //   });
  }

  // =====================================
  // FUNCIONES DE UTILIDAD PARA VARIANTES
  // =====================================

  /**
   * Obtiene el stock total del producto
   */
 getStockTotal(product: any): number {
    if (!product) return 0;

    try {
      if (product.stock_info && typeof product.stock_info.stock_total === 'number') {
        return product.stock_info.stock_total;
      }
      
      // Fallback al stock básico si no hay variantes
      return typeof product.existente_en_almacen === 'number' ? product.existente_en_almacen : 0;
    } catch (error) {
      console.error('Error getting stock total:', error);
      return 0;
    }
  }
  /**
   * Formatea los nombres de colores para mostrar
   */
 getColorNames(colores: any[]): string {
    if (!colores || !Array.isArray(colores) || colores.length === 0) {
      return 'Sin colores';
    }
    
    try {
      if (colores.length <= 3) {
        return colores
          .filter(c => c && c.nombre)
          .map(c => c.nombre)
          .join(', ');
      } else {
        const primerosTres = colores.slice(0, 3)
          .filter(c => c && c.nombre)
          .map(c => c.nombre)
          .join(', ');
        return `${primerosTres} +${colores.length - 3} más`;
      }
    } catch (error) {
      console.error('Error getting color names:', error);
      return 'Error al cargar colores';
    }
  }

  /**
   * Verifica si el producto tiene precios variables por variante
   */
  hasVariantPrices(product: any): boolean {
    if (!product.variantes || product.variantes.length === 0) return false;
    
    const basePriceMayor = product.precio_por_mayor;
    const basePriceUnidad = product.precio_por_unidad;
    
    return product.variantes.some((variante: any) => 
      variante.precio_por_mayor !== basePriceMayor || 
      variante.precio_por_unidad !== basePriceUnidad
    );
  }

  getEndRange(currentPage: number, totalItems: number): number {
  const itemsPerPage = 5;
  return Math.min(currentPage * itemsPerPage, totalItems);
}
getStartRange(currentPage: number): number {
  const itemsPerPage = 5;
  return ((currentPage - 1) * itemsPerPage) + 1;
}
hasValidData(): boolean {
  return this.data && this.data.data && Array.isArray(this.data.data) && this.data.data.length > 0;
}

// Método para obtener la lista filtrada de productos de manera segura
getFilteredProducts(): any[] {
  if (!this.hasValidData()) {
    return [];
  }
  return this.searchProducts(this.data.data, this.search || '');
}

// Método para verificar si se debe mostrar la paginación
shouldShowPagination(): boolean {
  return this.hasValidData() && this.getFilteredProducts().length > 5;
}

  /**
   * Verifica si el producto está activo
   */
  isProductActive(product: any): boolean {
    if (!product) return false;

    try {
      if (product.tiene_variantes && product.stock_info) {
        return Boolean(product.stock_info.tiene_stock);
      }
      return (product.existente_en_almacen || 0) > 0;
    } catch (error) {
      console.error('Error checking if product is active:', error);
      return false;
    }
  }
  /**
   * Formatea precios para mostrar
   */
  formatPrice(price: string | number | null | undefined): string {
    if (price === null || price === undefined || price === '') {
      return '0';
    }
    
    try {
      const numPrice = typeof price === 'string' ? parseFloat(price) : price;
      return isNaN(numPrice) ? '0' : numPrice.toLocaleString('es-CO');
    } catch (error) {
      console.error('Error formatting price:', error);
      return '0';
    }
  }
  /**
   * Formatea fechas
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Obtiene el indicador de estado del stock
   */
  getStockIndicatorClass(product: any): string {
    const stock = this.getStockTotal(product);
    
    if (stock === 0) return 'stock-empty';
    if (stock <= 5) return 'stock-low';
    if (stock <= 20) return 'stock-medium';
    return 'stock-high';
  }

  /**
   * Obtiene información resumida del producto para tooltips
   */
  getProductSummary(product: any): string {
    let summary = `${product.denominacion}\n`;
    summary += `Código: ${product.codigo}\n`;
    
    if (product.tiene_variantes) {
      summary += `Variantes: ${product.variantes_count}\n`;
      summary += `Stock total: ${this.getStockTotal(product)} unidades\n`;
      
      if (product.colores_disponibles?.length) {
        summary += `Colores: ${product.colores_disponibles.length}\n`;
      }
      
      if (product.tallas_disponibles?.length) {
        summary += `Tallas: ${product.tallas_disponibles.length}\n`;
      }
    } else {
      summary += `Stock: ${product.existente_en_almacen || 0} unidades\n`;
    }
    
    return summary;
  }

  /**
   * Filtra productos por término de búsqueda
   */
searchProducts(products: any[], term: string): any[] {
    if (!products || !Array.isArray(products)) {
      console.warn('Products array is invalid:', products);
      return [];
    }

    if (!term || term.trim() === '') {
      return products;
    }

    try {
      const searchTerm = term.toLowerCase().trim();
      
      return products.filter(product => {
        if (!product) return false;

        // Búsqueda segura en campos básicos
        const basicMatch = 
          (product.codigo && product.codigo.toLowerCase().includes(searchTerm)) ||
          (product.denominacion && product.denominacion.toLowerCase().includes(searchTerm));

        // Búsqueda segura en colores
        const colorMatch = product.colores_disponibles && Array.isArray(product.colores_disponibles) 
          ? product.colores_disponibles.some((color: any) => 
              color && color.nombre && color.nombre.toLowerCase().includes(searchTerm)
            )
          : false;

        // Búsqueda segura en tallas
        const tallaMatch = product.tallas_disponibles && Array.isArray(product.tallas_disponibles)
          ? product.tallas_disponibles.some((talla: any) => 
              talla && talla.nombre && talla.nombre.toLowerCase().includes(searchTerm)
            )
          : false;

        // Búsqueda segura en variantes
        const variantMatch = product.variantes && Array.isArray(product.variantes)
          ? product.variantes.some((variante: any) => 
              variante && variante.sku && variante.sku.toLowerCase().includes(searchTerm)
            )
          : false;

        return basicMatch || colorMatch || tallaMatch || variantMatch;
      });
    } catch (error) {
      console.error('Error in searchProducts:', error);
      return products; // Retornar todos los productos si hay error
    }
  }

  /**
   * Refresca la lista de productos
   */
  refreshProducts(): void {
    this.loader.setLoader(true);
    this.loadProducts();
  }

  /**
   * Duplica un producto (crear copia)
   */
  duplicateProduct(product: any): void {
    // Implementar lógica de duplicación
    console.log('Duplicar producto:', product);
    
    if (confirm(`¿Deseas crear una copia del producto "${product.denominacion}"?`)) {
      // Navegar al formulario con datos pre-llenados
      this.router.navigate(['/home/productos-form'], {
        queryParams: { 
          duplicate: product.id 
        }
      });
    }
  }

  /**
   * Exporta la lista de productos
   */
  exportProducts(): void {
    // Implementar lógica de exportación
    console.log('Exportar productos:', this.data.data);
    
    // Ejemplo básico de exportación a CSV
    this.exportToCSV();
  }

  private exportToCSV(): void {
    if (!this.data.data || this.data.data.length === 0) {
      alert('No hay productos para exportar');
      return;
    }

    const headers = ['Código', 'Denominación', 'Stock Total', 'Precio Mayor', 'Precio Unidad', 'Variantes', 'Estado'];
    const csvData = this.data.data.map((product: any) => [
      product.codigo,
      product.denominacion,
      this.getStockTotal(product),
      product.precio_por_mayor,
      product.precio_por_unidad,
      product.variantes_count || 0,
      this.isProductActive(product) ? 'Activo' : 'Inactivo'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map((field: any) => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `productos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }
}