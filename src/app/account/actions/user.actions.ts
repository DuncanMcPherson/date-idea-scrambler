import { User } from 'firebase/auth';

export namespace Users {
	export class SignIn {
		static readonly type = '[Account] SignIn User';
		constructor(public payload: User) {
		}
	}
}
