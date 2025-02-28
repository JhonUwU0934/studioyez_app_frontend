import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PointsLoaderService {

  constructor() { }

  private pointLoaderState: boolean = true;
  
  private myLoaderSubject = new BehaviorSubject<any>(this.pointLoaderState);

  public getChange(): any {
    return this.pointLoaderState;
  }

  public setCHange(LoaderState: any) {
    this.pointLoaderState = LoaderState;
    this.myLoaderSubject.next(this.pointLoaderState);
  }

  public getChangeObservable() {
    return this.myLoaderSubject.asObservable();
  }
  
}
