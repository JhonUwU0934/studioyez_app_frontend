import { Component } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { PointsLoaderService } from '../../services/points-loader.service';


@Component({
  selector: 'app-points-loader',
  templateUrl: './points-loader.component.html',
  styleUrls: ['./points-loader.component.scss']
})
export class PointsLoaderComponent {

  public pointLoaderState: boolean = false;
  $subscription!: Subscription;


  constructor(private pLoaderService:PointsLoaderService){}

  ngOnInit(): void {

    this.$subscription = this.pLoaderService.getChangeObservable()
     .subscribe((buttonState) => {   
      this.pointLoaderState = buttonState;
    });
    
  }

}
