import { Component, OnInit } from '@angular/core';
import { UserService } from '@app-services';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit {

  todo = [];

  done = [];

  inProgress = [];

  constructor(private userService: UserService,
              public dialog: MatDialog) {}

  ngOnInit(): void {
    if (!this.userService.tasks) {
      this.userService.getAllInfo().subscribe(x => {
        const tasks = x[0];
        for (let task of tasks) {
          if (task.status.id === 1) {
            this.todo.push(task);
          } else if (task.status.id === 2) {
            this.inProgress.push(task);
          } else {
            this.done.push(task);
          }
        }
      });
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
    }
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
