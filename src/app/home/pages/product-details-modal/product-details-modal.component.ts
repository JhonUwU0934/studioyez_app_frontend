// product-details-modal.component.ts
import { Component, inject, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-product-details-modal',
  template: `
    <div class="modal-overlay" *ngIf="isVisible" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        
        <!-- Header del Modal -->
        <div class="modal-header">
          <h2 class="modal-title">
            <i class="fas fa-box"></i>
            Detalles del Producto
          </h2>
          <button class="btn-close" (click)="closeModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Contenido del Modal -->
        <div class="modal-body" *ngIf="product">
          
          <!-- Información Básica -->
          <div class="info-section">
            <h3 class="section-title">
              <i class="fas fa-info-circle"></i>
              Información Básica
            </h3>
            
            <div class="info-grid">
              <div class="info-item">
                <label>Código:</label>
                <span class="product-code">{{product.codigo}}</span>
              </div>
              
              <div class="info-item">
                <label>Nombre:</label>
                <span class="product-name">{{product.denominacion}}</span>
              </div>
              
              <div class="info-item">
                <label>Fecha de Creación:</label>
                <span>{{formatDate(product.created_at)}}</span>
              </div>
              
              <div class="info-item">
                <label>Estado:</label>
                <span class="status-badge" 
                      [class.status-active]="isProductActive(product)"
                      [class.status-inactive]="!isProductActive(product)">
                  <i class="fas fa-circle"></i>
                  {{isProductActive(product) ? 'Activo' : 'Inactivo'}}
                </span>
              </div>
            </div>
          </div>

          <!-- Imagen Principal -->
          <div class="info-section" *ngIf="product.imagen">
            <h3 class="section-title">
              <i class="fas fa-image"></i>
              Imagen Principal
            </h3>
            <div class="main-image-container">
              <img [src]="product.imagen" 
                   [alt]="product.denominacion" 
                   class="main-product-image"
                   onerror="this.style.display='none'">
            </div>
          </div>

          <!-- Galería de Imágenes -->
          <div class="info-section" *ngIf="product.galeria && product.galeria.length > 0">
            <h3 class="section-title">
              <i class="fas fa-images"></i>
              Galería ({{product.galeria.length}} imágenes)
            </h3>
            <div class="gallery-grid">
              <div class="gallery-item" *ngFor="let imagen of product.galeria">
                <img [src]="imagen.imagen" 
                     [alt]="imagen.alt_text || 'Imagen de galería'" 
                     class="gallery-image"
                     (click)="openImageModal(imagen.imagen)"
                     onerror="this.style.display='none'">
                <small class="image-alt" *ngIf="imagen.alt_text">{{imagen.alt_text}}</small>
              </div>
            </div>
          </div>

          <!-- Información de Stock y Precios -->
          <div class="info-section">
            <h3 class="section-title">
              <i class="fas fa-dollar-sign"></i>
              Precios y Stock
            </h3>
            
            <div class="price-stock-grid">
              <div class="price-card">
                <div class="price-label">Precio por Mayor</div>
                <div class="price-value">\${{formatPrice(product.precio_por_mayor)}}</div>
              </div>
              
              <div class="price-card">
                <div class="price-label">Precio por Unidad</div>
                <div class="price-value">\${{formatPrice(product.precio_por_unidad)}}</div>
              </div>
              
              <div class="stock-card" [class.stock-empty]="getStockTotal(product) === 0">
                <div class="stock-label">Stock Total</div>
                <div class="stock-value">{{getStockTotal(product)}} unidades</div>
              </div>
            </div>
          </div>

          <!-- Información de Variantes -->
          <div class="info-section" *ngIf="product.tiene_variantes">
            <h3 class="section-title">
              <i class="fas fa-layer-group"></i>
              Variantes ({{product.variantes_count || 0}})
            </h3>

            <!-- Resumen de Variantes -->
            <div class="variants-summary" *ngIf="product.stock_info">
              <div class="summary-item">
                <span class="summary-label">Con Stock:</span>
                <span class="summary-value active">{{product.stock_info.variantes_con_stock || 0}}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Agotadas:</span>
                <span class="summary-value inactive">{{product.stock_info.variantes_sin_stock || 0}}</span>
              </div>
            </div>

            <!-- Colores Disponibles -->
            <div class="variant-info" *ngIf="product.colores_disponibles && product.colores_disponibles.length > 0">
              <h4>Colores Disponibles</h4>
              <div class="colors-display">
                <div class="color-item" *ngFor="let color of product.colores_disponibles">
                  <div class="color-swatch" [style.background-color]="color.codigo_hex"></div>
                  <span class="color-name">{{color.nombre}}</span>
                </div>
              </div>
            </div>

            <!-- Tallas Disponibles -->
            <div class="variant-info" *ngIf="product.tallas_disponibles && product.tallas_disponibles.length > 0">
              <h4>Tallas Disponibles</h4>
              <div class="sizes-display">
                <span class="size-badge" *ngFor="let talla of product.tallas_disponibles">
                  {{talla.nombre}}
                </span>
              </div>
            </div>

            <!-- Stock por Color -->
            <div class="variant-info" *ngIf="product.stock_por_color && product.stock_por_color.length > 0">
              <h4>Stock por Color</h4>
              <div class="stock-breakdown">
                <div class="stock-item" *ngFor="let stock of product.stock_por_color">
                  <div class="stock-item-color">
                    <div class="color-swatch-small" [style.background-color]="getColorHex(stock.color_id)"></div>
                    <span>{{stock.color_nombre}}</span>
                  </div>
                  <span class="stock-quantity" [class.stock-empty]="stock.stock_total === 0">
                    {{stock.stock_total}} unidades
                  </span>
                </div>
              </div>
            </div>

            <!-- Stock por Talla -->
            <div class="variant-info" *ngIf="product.stock_por_talla && product.stock_por_talla.length > 0">
              <h4>Stock por Talla</h4>
              <div class="stock-breakdown">
                <div class="stock-item" *ngFor="let stock of product.stock_por_talla">
                  <span class="size-badge-small">{{stock.talla_nombre}}</span>
                  <span class="stock-quantity" [class.stock-empty]="stock.stock_total === 0">
                    {{stock.stock_total}} unidades
                  </span>
                </div>
              </div>
            </div>

            <!-- Variantes Detalladas -->
            <div class="variant-info" *ngIf="product.variantes && product.variantes.length > 0">
              <h4>Detalle de Variantes</h4>
              <div class="variants-table">
                <div class="variant-row variant-header">
                  <span>SKU</span>
                  <span>Color</span>
                  <span>Talla</span>
                  <span>Stock</span>
                  <span>P. Mayor</span>
                  <span>P. Unidad</span>
                  <span>Estado</span>
                </div>
                
                <div class="variant-row" *ngFor="let variante of product.variantes">
                  <span class="variant-sku">{{variante.sku || 'Sin SKU'}}</span>
                  <span class="variant-color">
                    <div class="color-swatch-tiny" 
                         *ngIf="variante.color"
                         [style.background-color]="variante.color.codigo_hex"></div>
                    {{variante.color?.nombre || 'Sin color'}}
                  </span>
                  <span class="variant-size">{{variante.talla?.nombre || 'Sin talla'}}</span>
                  <span class="variant-stock" 
                        [class.stock-empty]="variante.existente_en_almacen === 0">
                    {{variante.existente_en_almacen || 0}}
                  </span>
                  <span class="variant-price">\${{formatPrice(variante.precio_por_mayor)}}</span>
                  <span class="variant-price">\${{formatPrice(variante.precio_por_unidad)}}</span>
                  <span class="variant-status" 
                        [class.status-active]="variante.activo"
                        [class.status-inactive]="!variante.activo">
                    <i class="fas fa-circle"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Producto Simple (Sin Variantes) -->
          <div class="info-section" *ngIf="!product.tiene_variantes">
            <h3 class="section-title">
              <i class="fas fa-box"></i>
              Producto Simple
            </h3>
            <div class="simple-product-info">
              <p><i class="fas fa-info-circle"></i> Este producto no tiene variantes configuradas.</p>
              <div class="simple-stock">
                <span class="stock-label">Stock disponible:</span>
                <span class="stock-value" [class.stock-empty]="(product.existente_en_almacen || 0) === 0">
                  {{product.existente_en_almacen || 0}} unidades
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer del Modal -->
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="closeModal()">
            <i class="fas fa-times"></i>
            Cerrar
          </button>
          <button class="btn btn-primary" (click)="editProduct()">
            <i class="fas fa-edit"></i>
            Editar Producto
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Imagen Ampliada -->
    <div class="image-modal-overlay" *ngIf="selectedImage" (click)="closeImageModal()">
      <div class="image-modal-content" (click)="$event.stopPropagation()">
        <button class="image-modal-close" (click)="closeImageModal()">
          <i class="fas fa-times"></i>
        </button>
        <img [src]="selectedImage" alt="Imagen ampliada" class="enlarged-image">
      </div>
    </div>
  `,
  styleUrls: ['./product-details-modal.component.scss']
})
export class ProductDetailsModalComponent {
  @Input() isVisible: boolean = false;
  @Input() product: any = null;
  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() editProductEvent = new EventEmitter<any>();

  selectedImage: string = '';

  closeModal(): void {
    this.closeModalEvent.emit();
  }

  editProduct(): void {
    this.editProductEvent.emit(this.product);
  }

  openImageModal(imageUrl: string): void {
    this.selectedImage = imageUrl;
  }

  closeImageModal(): void {
    this.selectedImage = '';
  }

  // Métodos de utilidad (reutilizar del componente principal)
  formatPrice(price: string | number): string {
    if (!price) return '0';
    const numPrice = typeof price === 'string' ? parseInt(price) : price;
    return numPrice.toLocaleString('es-CO');
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getStockTotal(product: any): number {
    if (product.stock_info && product.stock_info.stock_total) {
      return product.stock_info.stock_total;
    }
    return product.existente_en_almacen || 0;
  }

  isProductActive(product: any): boolean {
    if (product.tiene_variantes && product.stock_info) {
      return product.stock_info.tiene_stock;
    }
    return (product.existente_en_almacen || 0) > 0;
  }

  getColorHex(colorId: number): string {
    // Este método necesitaría acceso a la lista de colores
    // Por simplicidad, retornamos un color por defecto
    return '#cccccc';
  }
}