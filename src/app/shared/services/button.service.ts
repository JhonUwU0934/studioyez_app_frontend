import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ButtonService {

  constructor() { }

  
  private buttonState: boolean = false;
  
  private mybuttonSubject = new BehaviorSubject<any>(this.buttonState);

  public getChange(): any {
    return this.buttonState;
  }

  public setCHange(buttonState: any) {
    this.buttonState = buttonState;
    this.mybuttonSubject.next(this.buttonState);
  }

  public getChangeObservable() {
    return this.mybuttonSubject.asObservable();
  }

}
