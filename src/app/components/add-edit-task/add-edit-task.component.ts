import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { UserService } from '@app-services';
import { TaskType, TaskStatus, UnhandledTask, Task } from '@app-models';

@Component({
  selector: 'app-add-edit-task',
  templateUrl: './add-edit-task.component.html',
  styleUrls: ['./add-edit-task.component.sass']
})
export class AddEditTaskComponent implements OnInit {
  private id: number;
  isAddMode: boolean;
  taskForm: FormGroup;
  submitted = false;
  loading = false; 
  taskTypes: TaskType[];
  taskStatuses: TaskStatus[];

  get f() { return this.taskForm.controls; }

  constructor(private route: ActivatedRoute,
              private router: Router,
              private formBuilder: FormBuilder,
              private userService: UserService) 
  {
    this.taskTypes = userService.taskTypes;
    this.taskStatuses = userService.taskStatuses;

    this.id = Number(this.route.snapshot.params['id']);
    this.isAddMode = !this.id;

    this.taskForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      type: ['', Validators.required],
      dueDate: [''],
      status: [''],
      manDay: ['']
    }, {validators: this.additionalValidation.bind(this)});

    if (!this.isAddMode) {
      if (this.userService.taskList.length === 0) {
        this.userService.tasksObservable.subscribe(tasks => {
          this.patchForm(this.taskForm, this.id);
        });
      } else {
        this.patchForm(this.taskForm, this.id);
      }
    }
  }

  patchForm(form: FormGroup, id: number) {
    const taskToEdit = this.userService.taskList.find(x => x.id === id);
    if (!taskToEdit) {
      this.router.navigate(['/404']);
    }
    form.patchValue(taskToEdit);
  }

  ngOnInit(): void {}

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
    toSend.status = 1;
    if (toSend.manDay === '') {
      toSend.manDay = 0;
    } 
    if (!toSend.dueDate) {
      toSend.dueDate = "1970-01-01T00:00";
    }

    this.loading = true;
    this.userService.addTask(toSend).subscribe((x: Task) => {
      this.loading = false;
      this.userService.taskList.push(x);
      this.router.navigate(['/']);
    });
  }

  updateTask() {
    let toSend = this.taskForm.value;
    if (!toSend.dueDate) {
      toSend.dueDate = "1970-01-01T00:00";
    }

    this.userService.updateTask(toSend, this.id).subscribe((x: Task) => {
      this.loading = false;
      const unchangedTask = this.userService.taskList.find(x => x.id === this.id);
      const unchangedTaskId = this.userService.taskList.indexOf(unchangedTask);
      this.userService.taskList[unchangedTaskId] = x;
      this.router.navigate(['/']);
    }) 
  }
}
