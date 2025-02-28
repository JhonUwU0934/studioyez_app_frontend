import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ButtonService } from '../../services/button.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-button-click',
  templateUrl: './button-click.component.html',
  styleUrls: ['./button-click.component.scss']
})
export class ButtonClickComponent {

  @Input() label!: string;
  @Input() buttonMethod!: () => void;


  constructor(
    public buttonService: ButtonService,
    private router: Router
  ){}

  ngOnInit(): void {
  
  }

  ngOnDestroy(): void {
  
  }

}
