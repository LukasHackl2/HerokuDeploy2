import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../task.service';
import { ActivatedRoute, Params } from '@angular/router';
import { Task } from '../../models/task.model';
import { Room } from '../../models/room.model';

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.scss']
})
export class TaskViewComponent implements OnInit {

  rooms: Room[];
  tasks: Task[];

  constructor(private taskService: TaskService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe(
      (params: Params) => {
        if (params.roomId) {
          this.taskService.getTasks(params.roomId).subscribe((tasks: any[]) => {
            this.tasks = tasks;
          })
        } else {
          this.tasks = undefined;
        }
      }
    )

    this.taskService.getRooms().subscribe((rooms: any[]) => {
      this.rooms = rooms;
    })
  }

  onTaskClick(task: Task) {
    // set task completed
    this.taskService.complete(task).subscribe(() => {
      // the task has been set to completed successfully
      console.log("completed successfully!");
      task.completed = !task.completed;
    })
  }
 
}
