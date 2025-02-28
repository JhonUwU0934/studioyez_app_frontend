import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalChangeService {

  private modalArray: any = {
    viewModal:false,
    newAmount: 0,
    onMethod:() =>{
     
    },
  };

  constructor() { }

  private myArraySubject = new BehaviorSubject<any>(this.modalArray);

  public getArray(): any {
    return {...this.modalArray};
  }

  public setArray(newArray: any) {
    this.modalArray = newArray;
    this.myArraySubject.next(this.modalArray);
  }

  public getArrayObservable() {
    return this.myArraySubject.asObservable();
  }

}
