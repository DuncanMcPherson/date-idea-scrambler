import { Injectable } from '@angular/core';
import {environment} from "../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
	public get firebaseConfig() {
		return environment.firebaseConfig;
	}

	public get recaptchaKey() {
		return environment.recaptchaKey;
	}
}
