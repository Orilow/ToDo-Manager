import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { mergeMap, materialize, delay, dematerialize } from 'rxjs/operators';

const users = [{ id: 1, username: 'test', password: 'test', access_token: "HereIsToken"}];

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const { url, method, headers, body } = request;
    
    // wrap in delayed observable to simulate server api call
    return of(null)
        .pipe(
          mergeMap(handleRoute),
          materialize(), // call materialize and dematerialize to ensure delay even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648)
          delay(500),
          dematerialize()
        );
        
    
    function handleRoute() {
      switch (true) {
        case url.endsWith('/login') && method === 'POST':
            return authenticate();
        // case url.endsWith('/users') && method === 'GET':
        //     return getUsers();
        default:
            // pass through any requests not handled above
            return next.handle(request);
      }    
    }

    function authenticate() {
      const { username, password } = body as {username: string, password: string};
      const user = users.find(x => x.username === username && x.password === password);
      console.log(user);
      if (!user) {
        return unauthorized('Wrong username or password');
      }
      return ok({
        'username': user.username,
        'access_token': user.access_token
      })
    }

    function ok(body?) {
      return of(new HttpResponse({ status: 200, body }))
    }

    function unauthorized(message: string = 'Unauthorized') {
      return of (new HttpResponse({ status: 401, body: { error: message}}));
    }
  }
}
