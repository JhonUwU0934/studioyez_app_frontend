import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { modalModel } from '../models/modal.model';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  constructor() {}

  private myArray: modalModel = {
    delay:false,
    viewModal:false,
    clickOutside:false,
    title:'',
    icon:'',
    message:'',
    onMethod:() =>{
     
    },
    isThereaButton2:false,
    onMethodAction:() => {

    },
    loader: false,
    buttonText:'',
    buttonTextSecondary: ''
  };
  
  private myArraySubject = new BehaviorSubject<modalModel>(this.myArray);

  public getArray(): modalModel {
    return {...this.myArray};
  }

  showError(message: string): void {
    alert(`❌ ${message}`);
  }

  showConfirm(message: string): Promise<boolean> {
    return Promise.resolve(confirm(message));
  }

  showSuccess(message: string): void {
    // Implementar con tu librería de modales preferida
    // Por ejemplo: SweetAlert2, Angular Material Dialog, etc.
    alert(`✅ ${message}`);
  }

  public setArray(newArray: modalModel) {
    this.myArray = newArray;
    this.myArraySubject.next(this.myArray);
  }

  public getArrayObservable() {
    return this.myArraySubject.asObservable();
  }
}
