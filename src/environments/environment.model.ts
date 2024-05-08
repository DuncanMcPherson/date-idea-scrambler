export interface IEnvironment {
	readonly recaptchaKey: string;
	readonly firebaseConfig: IFirebaseConfig;
	readonly production: boolean;
}

interface IFirebaseConfig {
	apiKey: string;
	authDomain: string;
	databaseURL: string;
	projectId: string;
	storageBucket: string;
	messagingSenderId: string;
	appId: string;
	measurementId: string;
}
