import { Component, ElementRef } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  template: `
    <ng-container *ngIf="type === 'single'">
      <div class="rectangle" [style.width]="widthRect1" [style.height]="heightRect1"></div>
    </ng-container>
    <ng-container *ngIf="type === 'multiple'"> 

    </ng-container>
    <ng-container *ngIf="type === 'label-input'">
      <div class="rect-input">
        <div class="label-rectangle" [style.width]="widthLabel" [style.height]="heightLabel"></div>
        <div class="input-rectangle" [style.width]="widthInput" [style.height]="heightInput"></div>
      </div>
    </ng-container>
  `,
  styles: [
    `
      :host {
        width: var(--skeleton-rect-width);
        height: var(--skeleton-rect-height);
        animation: pulse 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        animation-delay: 0.5s;
      }

      .rectangle{
        background: #c9cbcf no-repeat;
        border-radius: 5px;
      }

      .rect-input {
        display: flex;
        flex-direction: column;
        gap: 5px;

        .label-rectangle {
          background: #c9cbcf no-repeat;
          border-radius: 5px;
        }
        .input-rectangle {
          background: #c9cbcf no-repeat;
          border-radius: 5px;
        }
      }

      @keyframes pulse {
        0% {
          opacity: 1;
        }
        50% {
          opacity: 0.2;
        }
        100% {
          opacity: 1;
        }
      }

      @media (max-width: 768px) {
        :host {
          width: 100%;
        }
      }
    `,
  ],
})
export class SkeletonComponent {
  width!: string;
  height!: string;
  type: any = 'single';


  // Propiedades para el primer tipo de esqueleto
  widthRect1!: string;
  heightRect1!: string ;

  // Propiedades para el segundo tipo de esqueleto
  widthRect2!: string;
  heightRect2!: string;

  // Propiedades para el tercer tipo de esqueleto
  widthLabel: string = '100%';
  heightLabel: string = '20px';
  widthInput: string = '100%';
  heightInput: string = '20px';

  className!: string;

  constructor(private host: ElementRef<HTMLElement>) {}

  ngOnInit() {
    const host = this.host.nativeElement;

    if (this.className) {
      host.classList.add(this.className);
    }

    host.style.setProperty('--skeleton-rect-width', this.width ?? '100%');
    // host.style.setProperty('--skeleton-rect-height', this.height ?? '100%');
  }
}
