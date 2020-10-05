import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { UserService } from '@app-services';
import { TaskType, TaskStatus, UnhandledTask } from '@app-models';
import { of, Observable } from 'rxjs';

@Component({
  selector: 'app-add-edit-task',
  templateUrl: './add-edit-task.component.html',
  styleUrls: ['./add-edit-task.component.sass']
})
export class AddEditTaskComponent implements OnInit {
  private id: string;
  isAddMode: boolean;
  taskForm: FormGroup;
  submitted = false;
  loading = false; 
  taskTypes: TaskType[];
  taskStatuses: TaskStatus[];

  constructor(private route: ActivatedRoute,
              private router: Router,
              private formBuilder: FormBuilder,
              private userService: UserService) 
  {
    this.taskTypes = userService.taskTypes;
    this.taskStatuses = userService.taskStatuses;
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.isAddMode = !this.id;

    this.taskForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      type: ['', Validators.required],
      dueDate: [''],
      status: [''],
      manDay: ['']
    }, {validators: this.additionalValidation.bind(this)});
  }

  additionalValidation(control: AbstractControl): {[key:string]: any} | null {
    if (control.get('type').value === '1') {
      if (!control.get('manDay').value) {
        control.get('manDay').setErrors({ required: true });
        return { required: true };
      }
    }

    if (!this.isAddMode) {
      if (!control.get('status').value) {
        return {required: true};
      }
    }

    return null;
  }

  get f() {
    return this.taskForm.controls;
  }

  onSubmit() {

    this.submitted = true;

    if (!this.taskForm.valid) {
      console.log('invalid form');

      return;
    }

    if (this.isAddMode) {
      this.addTask();
    } else {
      this.updateTask();
    }
  }

  addTask() {
    let toSend = this.taskForm.value;
    toSend.status = "1";
    if (toSend.manDay === '') {
      toSend.manDay = 0;
    } 
    if (toSend.dueDate) {
      toSend.dueDate += ":00Z";
    } else {
      toSend.dueDate = "1970-01-01T00:00:00Z";
    }

    this.loading = true;
    this.userService.addTask(toSend).subscribe((x: UnhandledTask) => {
      this.loading = false;
      this.userService.tasks.push(...this.userService.handleTasks([x], this.userService.taskTypes, this.taskStatuses));
      this.router.navigate(['/']);
    });
  }

  updateTask() {
    console.log('TO DO updateTask');
  }
}
