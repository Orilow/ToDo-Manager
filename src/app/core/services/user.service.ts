import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { forkJoin } from 'rxjs';
import { TaskType, TaskStatus, UnhandledTask, Task } from '@app-models';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  private _taskTypes: TaskType[];
  private _taskStatuses: TaskStatus[];
  public tasks: Task[];

  get taskTypes() {
    return this._taskTypes;
  }
  get taskStatuses() {
    return this._taskStatuses;
  }

  constructor(private http: HttpClient) {
    this.getAllInfo().subscribe(result => {
      this._taskTypes = result[1];
      this._taskStatuses = result[2];
      this.tasks = this.handleTasks(result[0], this._taskTypes, this._taskStatuses); 
      console.log(this._taskTypes);
      console.log(this._taskStatuses);
    });
   }

  getAllInfo() {
    return forkJoin(
      this.getTasks(),
      this.getTaskTypes(),
      this.getTaskStatuses()
    );
  }

  handleTasks(unhandledTasks: UnhandledTask[], taskTypes:TaskType[], taskStatuses: TaskStatus[]): Task[] {
    if (unhandledTasks.length === 0) return [];
    let result: Task[] = [];
    for (let unTask of unhandledTasks) {
      const {id, title, description, manDay, dueDate} = unTask;
      let newTask = Object.assign({}, id, title, description, manDay, dueDate);
      for (let type of taskTypes) {
        if (type.id === unTask.type.id) {
          newTask.type = { id: type.id, typeName: type.typeName};
          break;
        }
      }

      for (let status of taskStatuses) {
        if (status.id === unTask.status.id) {
          newTask.type = { id: status.id, typeName: status.statusName};
          break;
        }
      }
      result.push(newTask);
    }

    return result;
  }

  getTasks() {
    return this.http.get<UnhandledTask[]>(`${environment.apiUrl}/tasks`);
  }

  getTaskTypes() {
    return this.http.get<TaskType[]>(`${environment.apiUrl}/types`);
  }

  getTaskStatuses() {
    return this.http.get<TaskStatus[]>(`${environment.apiUrl}/statuses`);
  }

  addTask(form){
    return this.http.post<UnhandledTask>(`${environment.apiUrl}/tasks`, 
      {...form, type: {id: form.type}, status: {id: form.status}}, 
      {headers: { 'Content-Type': 'application/json'}});
  }

  deleteTask(id: string) {
    return this.http.delete<any>(`${environment.apiUrl}/tasks/${id}`, {headers: { 'Content-Type': 'application/json'}});
  }
}
