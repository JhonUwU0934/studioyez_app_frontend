export interface selectModel {
  icon: string;
  labelExists: boolean;
  name: string;
  placeholder: string;
  controlName: string;
  selects: selectItems[];

}

export interface selectItems {
  value: number;
  name: string;
}

