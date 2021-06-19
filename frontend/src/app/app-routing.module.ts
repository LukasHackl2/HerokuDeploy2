import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TaskViewComponent } from './pages/task-view/task-view.component';
import { NewRoomComponent } from './pages/new-room/new-room.component';
import { NewTaskComponent } from './pages/new-task/new-task.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';

const routes: Routes = [
  { path: '', redirectTo: 'rooms', pathMatch: 'full' },
  { path: 'new-room', component: NewRoomComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'rooms', component: TaskViewComponent },
  { path: 'rooms/:roomId', component: TaskViewComponent },
  { path: 'rooms/:roomId/new-task', component: NewTaskComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
