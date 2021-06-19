import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';
import { Task } from './models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private webReqService: WebRequestService) { }

  getRooms() {
    return this.webReqService.get('rooms');
  }

  createRoom(title: string) {
    // We want to send a web request to create a room
    return this.webReqService.post('rooms', { title });
  }

  getTasks(roomId: string) {
    return this.webReqService.get(`rooms/${roomId}/tasks`);
  }

  createTask(title: string, roomId: string) {
    // We want to send a web request to create a task
    return this.webReqService.post(`rooms/${roomId}/tasks`, { title });
  }

  complete(task: Task) {
    return this.webReqService.patch(`rooms/${task._roomId}/tasks/${task._id}`, {
      completed: !task.completed
    });
  }
  
}
