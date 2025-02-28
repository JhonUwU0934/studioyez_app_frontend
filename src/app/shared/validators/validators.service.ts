import { Injectable } from '@angular/core';
import { FormControl, ValidationErrors, FormGroup, AbstractControl, ValidatorFn } from '@angular/forms';

@Injectable({ providedIn: 'root' })

export class ValidatorsService {

  public firstNameAndLastnamePattern: string = '([a-zA-Z]+) ([a-zA-Z]+)';
  public emailPattern: string = "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$";

  /**
   * creamos un servicio para centralizar todas nuestras validaciones
   * volver a usar la de cantBeStrider de la que ya conocemos un funcionamiento
   *
   */

  public cantBeStrider = ( control: FormControl ): ValidationErrors | null => {

    const value: string = control.value.trim().toLowerCase();

    if (value === 'strider') {
      return {
        noStrider: true,
      }
    }

    return null;
  }

  /**
   * ahora centralizaremos el metodo isValidField que ya utilizamos en forms anterioes 
   * y ahora solo le añadiremos el form que estamos utilozando en cada formulario para que el sepa
   * de cual form se trata y asi mismo devuelva el boleano conrrespondiente
   */

  public isValidField( form: FormGroup, field: string ) {
    return form.controls[field].errors && form.controls[field].touched;
  }


  public isFieldOneEqualFieldTwo( field1: string, field2: string ) {

    /**el metodo solo recibe dos strings que son los controls contraseña que vamos a comparar
     * pero no recibimos ningun formulario para especificar, por eso el return devuelve una funcion 
     * que devuelve un ValidationErrors | null, como esto lo metemos en el ts dentro de las validaciones 
     * de un form, este return que devuelve una funcion automaticamente me lo amarra al form donde se esta declarando
     * la funcion, entonces al tener ya los controls y el formulario amarrado, peudo sacar sus valores
    */

    return ( formGroup: AbstractControl ): ValidationErrors | null => {
        
      const fieldValue1 = formGroup.get(field1)?.value;
      const fieldValue2 = formGroup.get(field2)?.value;

      /** hacemos la comparacion de las contraseñas */
      if ( fieldValue1 !== fieldValue2 ) {
        /**si son diferentes me manda el error, primero le envio el error al input password2
         * para que el   isValidField funcione y me lance el error en caso de haberlo
         * <span *ngIf="isValidField('password2')"  class="form-text text-danger">
                         Las contraseñas deben de ser iguales
            </span>
         */
        formGroup.get(field2)?.setErrors({ notEqual: true });
        /**
         * despues enviamos el error directamente a la deteccion de errores del validador,
         * necesito de ambas para que me funcione como quiero
         * O SEA QUE EL DE ARRIBA ME MUESTRA EL ERROR EN EL TEMPLATE Y ESTE NO DEJA QUE SE LE DE CLICK AL BOTON
         */
        return { notEqual: true }
      }

      /*esto enviar dos veces el null o el true, se hace porque porque el return es obligatorio
      pero el error va a el metodo malidador, pero no va al input como tal, entonces para que vaya al input hay que 
      especificar*/
      formGroup.get(field2)?.setErrors(null);
      return null;
    }

  }








  /* VALIDACIONES PERSONALIZADAS ANDRES */

  public patternValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        if (!control.value) {
          // si el control está vacío, no devuelve ningún error
          return null;
        }
      
        // prueba el valor del control con la expresión regular proporcionada
        const valid = regex.test(control.value);
      
        // si es verdadero, no devuelve ningún error (sin error), de lo contrario, devuelve el error pasado como segundo parámetro
        return valid ? null : error;
      };
      
  }

  public ageLimitValidator(minAge: number, maxAge: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null  => {
      // if control value is not null and is a number

      if (control.value !== null) {
        // devuelve nulo si está entre minAge y maxAge y es un número válido
        return isNaN(control.value) || // comprueba si es un número válido
          control.value < minAge || // comprueba si está por debajo de la edad mínima
          control.value > maxAge // comprueba si está por encima de la edad máxima
          ? { ageLimit: true } // devuelve esto en caso de error
          : null; // no hubo errores
      }
      return null;
    };
  }

  public controlValuesAreEqual(controlNameA: string, controlNameB: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const formGroup = control as FormGroup
      const valueOfControlA = formGroup.get(controlNameA)?.value
      const valueOfControlB = formGroup.get(controlNameB)?.value

      if (valueOfControlA === valueOfControlB) {
        return null
      } else {
        return { valuesDoNotMatch: true }
      }

    }
  }

  public mustBeChecked(control: FormControl): ValidationErrors | null {
    if (!control.value) {
      return {mustBeCheckedError: 'Must be checked'};
    } else {
      return null;
    }
  }

  public passwordMatchValidator(control: AbstractControl) {
    const password: string = control.get('password_one')?.value; // obtener la contraseña de nuestro control de formulario de contraseña
    const confirmPassword: string = control.get('password_two')?.value; // obtener la contraseña de nuestro control de formulario de confirmación de contraseña
    // comparar si las contraseñas coinciden
    if (password !== confirmPassword) {
    // si no coinciden, establecer un error en nuestro control de formulario de confirmación de contraseña
    control.get('password_two')?.setErrors({ NoPassswordMatch: true });
    }
  }

  /* al parecer se puede usar { [key: string]: any } o ValidationErrors a la hora de devolver en el return

  aqui la explicacion:

  La razón por la que se usa { [key: string]: any } en lugar de ValidationErrors en el tipo de retorno de 
  la función es para proporcionar una mayor flexibilidad y permitir la definición de un mensaje de error 
  personalizado para cada validador.

  El tipo ValidationErrors es un tipo de objeto predefinido en Angular que se utiliza para almacenar 
  mensajes de error de validación. Este tipo de objeto es útil cuando se desea utilizar un conjunto 
  predefinido de mensajes de error y no se requiere un mensaje personalizado para cada validador.

  Por otro lado, { [key: string]: any } es un tipo de objeto que se utiliza para representar cualquier 
  objeto que tenga propiedades de tipo string y valores de cualquier tipo. Al utilizar este tipo de objeto 
  como tipo de retorno, se permite la definición de mensajes de error personalizados para cada validador y 
  se pueden agregar propiedades adicionales al objeto de errores.

  En resumen, aunque ValidationErrors es un tipo de objeto predefinido en Angular que se utiliza 
  comúnmente para mensajes de error de validación, { [key: string]: any } proporciona una mayor 
  flexibilidad y permite la definición de mensajes de error personalizados para cada validador.

 */


}