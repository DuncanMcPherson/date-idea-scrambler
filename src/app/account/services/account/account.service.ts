import {Injectable} from '@angular/core';
import {User, onAuthStateChanged, beforeAuthStateChanged, Auth, getAuth} from "firebase/auth";
import {BehaviorSubject, distinctUntilChanged, Observable} from "rxjs";
import {AppService} from "../../../core/services/app/app.service";
import { Users } from "../../actions/user.actions";
import {Store} from "@ngxs/store";

@Injectable({
	providedIn: 'root'
})
export class AccountService {
	private initComplete$$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	public initComplete$: Observable<boolean> = this.initComplete$$.pipe(
		distinctUntilChanged()
	);
	private _auth: Auth;
	public get auth(): Auth {
		return this._auth;
	}

	private set auth(auth: Auth) {
		this._auth = auth;
	}

	constructor(
		appService: AppService,
		private readonly store: Store
	) {
		this.auth = getAuth(appService.App);
		onAuthStateChanged(this.auth, (user) => {
			this.store.dispatch(new Users.SignIn(user!))
			this.initComplete$$.next(true)
		})
	}
}
