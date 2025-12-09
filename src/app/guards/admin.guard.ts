import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../auth.service';
import { UserService } from '../services/user.service';
import { map, switchMap, take } from 'rxjs/operators';
import { from } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const userService = inject(UserService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    switchMap(user => {
      if (!user) {
        router.navigate(['/login']);
        return from(Promise.resolve(false));
      }
      
      return from(userService.getUser(user.uid)).pipe(
        map(userData => {
          if (userData?.role === 'admin') {
            return true;
          } else {
            router.navigate(['/home']);
            return false;
          }
        })
      );
    })
  );
};

