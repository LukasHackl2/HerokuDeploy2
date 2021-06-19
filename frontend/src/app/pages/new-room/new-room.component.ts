import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../task.service';
import { Router } from '@angular/router';
import { Room } from '../../models/room.model';

@Component({
  selector: 'app-new-room',
  templateUrl: './new-room.component.html',
  styleUrls: ['./new-room.component.scss']
})
export class NewRoomComponent implements OnInit {

  constructor(private taskService: TaskService, private router: Router) { }

  ngOnInit(): void {
  }

  createRoom(title: string) {
    this.taskService.createRoom(title).subscribe((room: Room ) => {
      console.log(room); 
      // Navigate to /rooms/room._id
      this.router.navigate([ '/rooms', room._id ]);
    });
  }

}
