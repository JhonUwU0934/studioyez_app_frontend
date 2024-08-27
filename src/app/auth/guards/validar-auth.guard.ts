
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, CanMatch, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ButtonService } from 'src/app/shared/services/button.service';
import { modalModel } from 'src/app/shared/models/modal.model';
import { ModalService } from 'src/app/shared/services/modal.service';

@Injectable({
  providedIn: 'root'
})
export class authGuard implements CanMatch, CanActivate{

  constructor(
    private authService:AuthService,
    private router: Router,
    public buttonService: ButtonService,
    private modalService: ModalService
    ){}
 
    private checkAuthStatus(): boolean | Observable<boolean> {

      return this.authService.validationToken() 
  
    }

  canMatch(): Observable<boolean> | boolean {

    return this.checkAuthStatus();
  }

  canActivate(): Observable<boolean> | boolean  {

    return this.checkAuthStatus();
  }

}