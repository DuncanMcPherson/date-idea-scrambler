import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {AccountService} from "../../account/services/account/account.service";
import {Store} from "@ngxs/store";
import {filter, map, switchMap} from "rxjs";
import {User} from "firebase/auth";



export const authGuard: CanActivateFn = () => {
	const authService = inject(AccountService);
	const router = inject(Router);
	const store = inject(Store)
	return authService.initComplete$
		.pipe(
			filter(init => init),
			switchMap(() => {
				return store.select<User>(state => state.user);
			}),
			map((user) => {
				console.log(user)
				return !!user ? true : router.createUrlTree(["account", "sign-in"])
			})
		)
};
