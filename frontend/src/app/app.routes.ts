import { Routes } from '@angular/router';
import { UserProfile } from './components/user-profile/user-profile';
import { Help } from './components/help/help';

export const routes: Routes = [
  { path: 'profile', component: UserProfile },
  { path: 'help', component: Help }
];
