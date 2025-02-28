import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { selectModel } from '../../models/select.model';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent {

  @Input() form!: FormGroup;
  @Input() arraySelect!: selectModel;
  @Input() inputControlName!: string;
 



}
