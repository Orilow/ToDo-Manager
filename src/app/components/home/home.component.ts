import { Component, OnInit } from '@angular/core';
import { UserService } from '@app-services';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit {

  newTaskForm: FormGroup;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    if (!this.userService.tasks) {
      this.userService.getAllTasks();
    }
  }
}
