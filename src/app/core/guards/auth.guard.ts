import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthenticationService } from '@app-services';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor (
    private router: Router,
    private authenticationService: AuthenticationService
    ) { }

  canActivate (
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {
      const currentUser = this.authenticationService.userValue;
      if (currentUser) {
        return true;
      }

      this.router.navigate(['/login']);
      return false;
  }
  
}
