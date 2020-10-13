import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { map, first } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '@app-models';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private userSubject: BehaviorSubject<User> = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('user')));
  public userObservable: Observable<User>;

  constructor(
    private router: Router,
    private http: HttpClient
  ) { 
    this.userObservable = this.userSubject.asObservable();
  }
  
  public get userValue(): User {
    return this.userSubject.value;
  }

  login(username: string, password: string) {
    return this.http.post<any>(`${environment.apiUrl}/login`, { username, password } /*, {headers: {"Content-Type": "application/json"}}*/)
              .pipe(
                map(user => {
                localStorage.setItem('user', JSON.stringify(user));
                this.userSubject.next(user);

                return user;
              }))
  }

  logout() {
    return this.http.post<any>(`${environment.apiUrl}/logout`, null)
              .pipe(
                map(() => {
                  localStorage.removeItem('user');
                  this.userSubject.next(null);
              }))
  }
}
