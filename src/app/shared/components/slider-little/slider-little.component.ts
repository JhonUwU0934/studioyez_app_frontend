import { Component, Input } from '@angular/core';
import { ICarouselLittleItem } from '../../models/carousel-little-item.model';

@Component({
  selector: 'app-slider-little',
  templateUrl: './slider-little.component.html',
  styleUrls: ['./slider-little.component.scss']
})
export class SliderLittleComponent {

  @Input() items: ICarouselLittleItem[] = [];
  @Input() indicators: boolean = true;
  @Input() controls: boolean = true;
  @Input() autoSlide: boolean = false;
  @Input() slideInterval: number = 10000;

  interval!: any;
  selectedIndex: number = 0;

  ngOnInit(): void {
    if (this.autoSlide) {
      this.autoSlideImages();
    }
  }

  autoSlideImages(): void {
    this.interval = setInterval(() => {
      this.onNextClick();
    }, this.slideInterval);
  }

  selectImage(i: number) {
    this.selectedIndex = i;
  }

  onPrevClick(): void {
    if (this.selectedIndex === 0) {
      this.selectedIndex = this.items.length - 1;
    } else {
      this.selectedIndex--;
    }
    clearInterval(this.interval);
    this.autoSlideImages();
  }

  onNextClick(): void {
    if (this.selectedIndex === this.items.length - 1) {
      this.selectedIndex = 0;
    } else {
      this.selectedIndex++;
    }
    clearInterval(this.interval);
    this.autoSlideImages();
  }

}
