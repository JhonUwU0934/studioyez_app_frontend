import { Component, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {

  loader!: boolean;
  $subscription!: Subscription;

  private loaderService = inject(LoaderService)

  ngOnInit() {
    this.$subscription =  this.loaderService.getLoaderObservable()
    .subscribe((newState) => {
      this.loader = newState;
    });
  }

  ngOnDestroy(): void {
    if (this.$subscription) {
      this.$subscription.unsubscribe();
    }
  }

}
