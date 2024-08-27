
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanMatch, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class publicGuard implements CanActivate, CanMatch {

  constructor(
    private authService:AuthService,
    private router: Router
    ){}
 

    private checkAuthStatus(): boolean | Observable<boolean> {

      return this.authService.validationToken()
        .pipe(
          tap( ),
          tap( isAuthenticated => {
            if ( isAuthenticated ) {
              this.router.navigate(['./home'])
            }
          }),
         map( isAuthenticated => !isAuthenticated )
        )
  
    }

  canActivate(): Observable<boolean> |  boolean {
    return this.checkAuthStatus(); 
  }

  canMatch(): Observable<boolean> |  boolean {
    return this.checkAuthStatus(); 
  }
  
  
}





