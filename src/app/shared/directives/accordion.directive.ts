import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[accordion]'
})
export class AccordionDirective {

  constructor(private el: ElementRef) {
  }

  @HostListener('click', ['$event']) onClick($event:any) {

    this.el.nativeElement.classList.toggle('is-open');

    var content = this.el.nativeElement.nextElementSibling;
    if (content.style.maxHeight) {
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  }

}
