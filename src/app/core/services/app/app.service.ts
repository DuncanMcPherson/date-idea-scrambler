import { Injectable } from '@angular/core';
import { FirebaseApp, initializeApp } from "firebase/app"
import {EnvironmentService} from "../environment/environment.service";

@Injectable({
  providedIn: 'root'
})
export class AppService {
	private _firebaseApp: FirebaseApp;

	private set App(value: FirebaseApp) {
		this._firebaseApp = value;
	// 	TODO: init app check
	}

	public get App(): FirebaseApp {
		return this._firebaseApp;
	}

	constructor(
		private readonly environmentService: EnvironmentService
	) {
	}

	public initialize(): void {
		if (!!this.App) {
			return;
		}

		this.App = initializeApp(this.environmentService.firebaseConfig);
	}
}
