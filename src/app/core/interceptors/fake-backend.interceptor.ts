import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { mergeMap, materialize, delay, dematerialize } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { TaskType, TaskStatus, Task } from '@app-models';

const users = [{ id: 1, username: 'test', password: 'test', access_token: "HereIsToken"}];

const types: TaskType[] = [{ id: 1, typeName:'Улучшение' }, { id: 2, typeName: 'Ошибка' }];
const statuses: TaskStatus[] = [{ id: 1, statusName: 'Новая задача' }, { id: 2, statusName: 'В реализации' }, { id: 3, statusName: 'Завершенные' }];
const tasks: Task[] = [];

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const { url, method, headers, body } = request;
    const authorizedUser = getAuthorizedUser();

    
    // wrap in delayed observable to simulate server api call
    return of(null)
        .pipe(
          mergeMap(handleRoute),
          materialize(), // call materialize and dematerialize to ensure delay even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648)
          delay(environment.fakeServerDelayMS),
          dematerialize()
        );
        
    
    function handleRoute() {
      switch (true) {
        case url.endsWith('/login') && method === 'POST':
          return authenticate();
        case url.endsWith('/logout') && method === 'POST':
          return unauthenticate();
        case url.endsWith('/types') && method === 'GET':
          return getTypes();
        case url.endsWith('/statuses') && method === 'GET':
          return getStatuses();
        case url.endsWith('/tasks') && method === 'GET':
          return getTasks();
        case url.endsWith('/tasks') && method === 'POST':
          return createTask();
        default:
            // pass through any requests not handled above
            return next.handle(request);
      }    
    }

    function authenticate() {
      const { username, password } = body as {username: string, password: string};
      const user = users.find(x => x.username === username && x.password === password);
      if (!user) {
        return unauthorized('Wrong username or password');
      }
      return ok({
        'username': user.username,
        'access_token': user.access_token
      })
    }

    function unauthenticate() {
      if (!authorizedUser) return unauthorized();
      return ok();
    }

    function getTypes() {
      if (!authorizedUser) return unauthorized();
      
      return ok(types).pipe(materialize(), delay(getRandomDelay()), dematerialize());
    }

    function getStatuses() {
      if (!authorizedUser) return unauthorized();

      return ok(statuses).pipe(materialize(), delay(getRandomDelay()), dematerialize());
    }

    function getTasks() {
      if (!authorizedUser) return unauthorized();

      return ok(tasks).pipe(materialize(), delay(getRandomDelay()), dematerialize());
    }

    function createTask() {
      if (!authorizedUser) return unauthorized();

      let task = body as Task;
      task.userId = authorizedUser.id;
      tasks.push(task);

      return created(task);
    }

    function getAuthorizedUser() {
      const token = headers.get('X-Auth-Token');
      if (!token) return undefined;

      const user = users.find(x => x.access_token === token);

      return !user ? undefined : user;
    }

    function getRandomDelay() {
      return Math.random() * 1000 % 500;
    }
    
    function unauthorized(message?: string) {
      return throwError(new HttpResponse({ status: 401, statusText: "UNATHORIZED", body:{ message } }));
    }

    function ok(body?) {
      return of(new HttpResponse({ status: 200, body }))
    }

    function created(body?) {
     return  of(new HttpResponse({ status: 201, statusText: 'CREATED', body }));
    }

    function error(status: number, statusText?:string) {
      return throwError(new HttpResponse({status, statusText}));
    }
  }
}
