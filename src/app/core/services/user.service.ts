import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { forkJoin, Subject } from 'rxjs';
import { TaskType, TaskStatus, UnhandledTask, Task } from '@app-models';
import { toArray } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  private tasksSubject = new Subject<Task[]>();
  public tasksObservable = this.tasksSubject.asObservable();
  public taskList: Task[] = [];

  private taskTypesSubject = new Subject<TaskType[]>();
  public taskTypesObservable = this.taskTypesSubject.asObservable();
  public taskTypes: TaskType[] = [];

  private taskStatusesSubject = new Subject<TaskStatus[]>();
  public taskStatusesObservable = this.taskStatusesSubject.asObservable();
  public taskStatuses: TaskStatus[] = [];


  constructor(private http: HttpClient) {
    this.tasksObservable.subscribe(x => this.taskList.push(...x));
    this.taskTypesObservable.subscribe(x => this.taskTypes.push(...x));
    this.taskStatusesObservable.subscribe(x => this.taskStatuses.push(...x));

    this.getAllInfo().subscribe(result => {
      this.tasksSubject.next(result[0]);
      this.taskTypesSubject.next(result[1]);
      this.taskStatusesSubject.next(result[2]);

      console.log(this.taskList);
      console.log(this.taskTypes);
      console.log(this.taskStatuses);
    });
   }

  getAllInfo() {
    return forkJoin(
      this.getTasks(),
      this.getTaskTypes(),
      this.getTaskStatuses()
    );
  }

  handleTasks(unhandledTasks: UnhandledTask[]): Task[] {
    if (unhandledTasks.length === 0) return [];
    let result: Task[] = [];
    for (let unTask of unhandledTasks) {
      let newTask:any =  { ...unTask };
      newTask.type = unTask.type.id + '';
      newTask.dueDate = unTask.dueDate.substring(0, unTask.dueDate.length - 4);
      newTask.status = unTask.status.id + '';
      result.push(newTask as Task);
    }

    return result;
  }

  getTasks() {
    return this.http.get<Task[]>(`${environment.apiUrl}/tasks`);
  }

  getTaskTypes() {
    return this.http.get<TaskType[]>(`${environment.apiUrl}/types`);
  }

  getTaskStatuses() {
    return this.http.get<TaskStatus[]>(`${environment.apiUrl}/statuses`);
  }

  addTask(form) {
    return this.http.post<Task>(`${environment.apiUrl}/tasks`, 
      {...form, type: {id: Number(form.type) }, status: { id: Number(form.status) }}, 
      {headers: { 'Content-Type': 'application/json'}});
  }

  updateTask(form, id) {
    console.log(form);
    return this.http.put<Task>(`${environment.apiUrl}/tasks/${id}`,
    { ...form, type: { id: Number(form.type) }, status: { id: Number(form.status) }},
    {headers: { 'Content-Type': 'application/json'}})
  }

  deleteTask(id: string) {
    return this.http.delete<any>(`${environment.apiUrl}/tasks/${id}`, {headers: { 'Content-Type': 'application/json'}});
  }
}
