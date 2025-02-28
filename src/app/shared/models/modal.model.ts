export interface modalModel {
    delay?: boolean;
    viewModal: boolean;
    clickOutside?:boolean;
    title: string;
    colorIcon?: string;
    icon:string;
    message: string; 
    onMethod:() => void;
    loader?: boolean;
    buttonText: string; 
    isThereaButton2?: boolean;
    onMethodAction:() => void;
    buttonTextSecondary?: string; 
  }