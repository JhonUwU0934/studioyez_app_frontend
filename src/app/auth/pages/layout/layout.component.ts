import { Component } from '@angular/core';
import { ICarouselLittleItem } from 'src/app/shared/models/carousel-little-item.model';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {

  carouselData: ICarouselLittleItem[] = [
    {      
      imgFondo: 'https://i.ibb.co/Ss7xkhC/man-2425121-1280.jpg'
    },
    {      
      imgFondo: 'https://i.ibb.co/wsrQZ3V/hangers-1850082-1280.jpg'
    }
  ];

}
