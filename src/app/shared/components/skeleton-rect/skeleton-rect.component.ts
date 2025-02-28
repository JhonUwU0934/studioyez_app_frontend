import { Component, ElementRef } from '@angular/core';

@Component({
  selector: 'app-skeleton-rect',
  template: ``,
  styles: [
    `
      :host {
        display: block;
        width: var(--skeleton-rect-width);
        height: var(--skeleton-rect-height);
        background: #c9cbcf  no-repeat;
        animation: pulse 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        animation-delay: 0.5s;
        border-radius: 5px;
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
        :host{
          width:100%;
        }
      }

    `,
  ],
})
export class SkeletonRectComponent {
  width!: string;
  height!: string;
  className!: string;

  // private host = inject(ElementRef<HTMLElement>)

  constructor(private host: ElementRef<HTMLElement>) {}

  ngOnInit() {
    const host = this.host.nativeElement;

    if (this.className) {
      host.classList.add(this.className);
    }

    host.style.setProperty('--skeleton-rect-width', this.width ?? '100%');
    host.style.setProperty('--skeleton-rect-height', this.height ?? '20px');
  }
}
