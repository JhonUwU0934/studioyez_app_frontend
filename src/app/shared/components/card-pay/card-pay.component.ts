import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-pay',
  templateUrl: './card-pay.component.html',
  styleUrls: ['./card-pay.component.scss']
})
export class CardPayComponent {
  
  @Input() card: any;

}
