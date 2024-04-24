import {Observable} from "rxjs";

export type ObservablePropertyNames<T, O> = {
	[K in keyof T]: T[K] extends Observable<O> ? K : never
}[keyof T];
