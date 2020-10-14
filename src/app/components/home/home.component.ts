import { Component, OnInit } from '@angular/core';
import { UserService } from '@app-services';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { Task, TaskStatus } from '@app-models';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit {
  todo = [];
  done = [];
  inProgress = [];
  todoStatus: TaskStatus;
  inProgressStatus: TaskStatus;
  doneStatus: TaskStatus;

  constructor(private userService: UserService,
              public dialog: MatDialog) {}

  ngOnInit(): void {

    if (this.userService.taskList.length === 0 || this.userService.taskStatuses.length === 0 ) {
      this.userService.taskStatusesObservable.subscribe(() => {
        this.distributeTasks(this.userService.taskList);
      }) 
    } else {
      this.distributeTasks(this.userService.taskList);
    }
  }

  distributeTasks(tasks: Task[]) {
    this.todoStatus = this.userService.taskStatuses.find(stat => stat.statusName === 'Новая задача');
    this.inProgressStatus = this.userService.taskStatuses.find(x => x.statusName === 'В работе');
    this.doneStatus = this.userService.taskStatuses.find(x => x.statusName === 'Реализовано');

    for (let task of tasks) {
      if (task.status.id === this.todoStatus.id) {
        this.todo.push(task);
      } else if (task.status.id === this.inProgressStatus.id) {
        this.inProgress.push(task);
      } else {
        this.done.push(task);
      }
    }
  }


  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
      this.changeTaskStatus(event.previousContainer.element.nativeElement.children.item(0).getAttribute('taskId'),
        event.container.id);
    }
  }

  changeTaskStatus(taskId: string, containerNameWithId: string) {
    const containerId = containerNameWithId.substring(containerNameWithId.length - 1, containerNameWithId.length);
    let newStatus;
    if (containerId === '0') {
      newStatus = this.todoStatus.id;
    } else if (containerId === '1') {
      newStatus = this.inProgressStatus.id;
    } else {
      newStatus = this.doneStatus;
    }

    let changingTask:any = this.userService.taskList.find(x => x.id + '' === taskId);
    changingTask.dueDate = changingTask.dueDate + ':00Z';
    
    this.userService.updateTask(changingTask, taskId).subscribe(x => console.log('success'));
  }

  openDialog(id: string, listName: string) {
    const dialogRef = this.dialog.open(DialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteTask(id, listName);
      }
    })
  }

  deleteTask(id: string, listName: string) {
    this.userService.deleteTask(id).subscribe((x) => {
      this[listName].forEach((element, index) => {
        if (element.id === id ) this[listName].splice(index, 1);
      });
    })
  }
}
