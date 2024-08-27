import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Subscription, delay, delayWhen, of, tap, timer } from 'rxjs';
import { modalModel } from '../../models/modal.model';
import { ModalService } from '../../services/modal.service';


@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {

  modalArray: modalModel = {
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

  $subscription!: Subscription;
  @ViewChild('container',{static: false})  container!: ElementRef;


  constructor(private modalService: ModalService)
  {}

  ngOnInit() {
    this.$subscription =  this.modalService.getArrayObservable()
    .pipe(   
      // tap((resp)=>{console.log(resp)}),
      // delayWhen((resp) => resp.delay ? timer(1000) : of(null))
      )
    .subscribe((newArray) => {
      this.modalArray = newArray;
    });
  }

  ngOnDestroy(): void {
    if (this.$subscription) {
      this.$subscription.unsubscribe();
    }
  }

  @HostListener('click', ['$event.target'])
  clickOutside(event: EventListener) {
  
    const validat = this.container?.nativeElement.contains(event);

    if (!validat) {
      if (this.modalArray.clickOutside) {

        this.modalArray.viewModal = false; 
        
      }
    }
  
  }


}
