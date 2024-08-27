import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  viewloader: boolean = false;

  constructor() { }

  private myArraySubject = new BehaviorSubject<boolean>(this.viewloader);

  public getaloader():boolean {
    return this.viewloader;
  }

  public setLoader(newArray:boolean) {
    this.viewloader = newArray;
    this.myArraySubject.next(this.viewloader);
  }

  public getLoaderObservable() {
    return this.myArraySubject.asObservable();
  }
}
