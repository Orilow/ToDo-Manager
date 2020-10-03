import { Component } from '@angular/core';
import { AuthenticationService } from '@app-services';
import { User } from '@app-models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  user: User;

  constructor(private authenticationService: AuthenticationService,
              private router: Router) {
    this.authenticationService.userObservable.subscribe(x => this.user = x);
  }

  logout() {
    this.authenticationService.logout().subscribe(x => this.router.navigate(['/login']));
  }
}
