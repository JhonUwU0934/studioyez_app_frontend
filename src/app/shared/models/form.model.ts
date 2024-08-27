export interface formModel {
  title: string;
  text?: string;
  selects?: selectItems[];
  inputs?: inputItems[];
  checks?: checksItems[];
  buttonText: string;
  twoPassword?: boolean;
  forgotPassword?: boolean;
  onRecovery:() => void;
}

export interface selectItems {
  icon: string;
   labelExists: boolean;
   name: string;
   placeholder: string;
   controlName: string;
   selects: optionItems[];
 }

export interface inputItems {
  label?: string;
  placeholder: string;
  formcontrolName: string;
  type: string;
  id: string;
  name: string;
  validations?: validItems[];
  icon?:string;
  isEyeChange?:boolean;
}

export interface checksItems {
   label: string;
   formcontrolName: string;
}


export interface optionItems {
  value: number;
  name: string;
}


export interface validItems {
  validErrors: string;
  descriptErrors: string;
}
