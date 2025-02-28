import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ButtonService } from '../../services/button.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements OnInit {

  $subscription!: Subscription;
  load_spinner!: boolean;
  @Input() label!: string;
  @Input() myForm!: FormGroup;

  constructor(
    public buttonService: ButtonService
  ){}

  ngOnInit(): void {
    this.$subscription = this.buttonService.getChangeObservable()
     .subscribe((buttonState) => {
      this.load_spinner = buttonState;
    });
  }

  ngOnDestroy(): void {
    if (this.$subscription) {
      this.$subscription.unsubscribe();
    }
  }



  changeStateButton() {
    this.buttonService.setCHange(true)
  }

}
