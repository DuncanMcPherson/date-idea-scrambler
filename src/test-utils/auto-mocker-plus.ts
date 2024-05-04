import { HttpErrorResponse } from "@angular/common/http";
import {NEVER, Observable, of, ReplaySubject, Subject, throwError} from "rxjs";
import { startWith } from "rxjs";
import { AutoMocker } from "./auto-mocker";
import { TestSubscriptionCounter } from "./test-subscription-counter";
import { ObservablePropertyNames } from "./observable-property-names.type";

type ObservableType<T> = T extends Observable<infer U> ? U : T;
type ObservableFunction<T> = (...args: any[]) => Observable<T>;

export class AutoMockerPlus extends AutoMocker {
	public withReturnObservable<T>(
		spy: ObservableFunction<T>,
		resolveWith?: T,
		spyName?: string
	): Observable<T> {
		if (this.isSpyLike(spy)) {
			let observable: Observable<T> = of(resolveWith!);
			spy.and.returnValue(observable);
			return observable;
		}
		this.throwNotASpyError(spyName);
	}

	public withReturnNonEmittingObservable<T>(
		spy: ObservableFunction<T>,
		spyName?: string
	): Observable<T> {
		if (this.isSpyLike(spy)) {
            let observable: Observable<T> = NEVER;
            spy.and.returnValue(observable);
            return observable;
        }
        this.throwNotASpyError(spyName);
	}

	public withReturnCompletingCountedObservable<T>(
		spy: ObservableFunction<T>,
		nextValue?: T,
		spyName?: string
	): TestSubscriptionCounter<T> {
		if (this.isSpyLike(spy)) {
			const observable$: Observable<T> = of(nextValue!);
			const counter = new TestSubscriptionCounter(observable$);
			spy.and.returnValue(counter.countedObservable$);
			return counter;
		}
		this.throwNotASpyError(spyName);
	}

	public withReturnNonCompletingCountedObservable<T>(
		spy: ObservableFunction<T>,
		nextValue?: T,
		spyName?: string
	): TestSubscriptionCounter<T> {
		if (this.isSpyLike(spy)) {
            const observable$: Observable<T> = NEVER.pipe(startWith(nextValue!));
            const counter = new TestSubscriptionCounter(observable$);
            spy.and.returnValue(counter.countedObservable$);
            return counter;
        }
        this.throwNotASpyError(spyName);
	}

	public withReturnObservables<T>(
		spy: ObservableFunction<T>,
		resolveWith?: T[],
		spyName?: string
	): Observable<T>[] {
		if (this.isSpyLike(spy)) {
			const observables: Observable<T>[] = resolveWith?.map((val) => {
				if (val instanceof Observable) {
					return val;
				}
				return of(val);
			}) ?? []
			spy.and.returnValues(observables);
			return observables;
		}

		this.throwNotASpyError(spyName);
	}

	public withReturnThrowObservable<T>(
		spy: ObservableFunction<T>,
		error?: any,
		spyName?: string
	): Observable<T> {
		if (this.isSpyLike(spy)) {
			let observable: Observable<T> = throwError(() => error);
            spy.and.returnValue(observable);
            return observable;
		}

		this.throwNotASpyError(spyName);
	}

	public withFirstArgMappedReturnObservable<T>(
		spy: (arg1: string | number, ...args: any[]) => Observable<T>,
		returnMap: Record<string | number, T>,
		defaultReturn: T = undefined!,
		spyName?: string
	): void {
		if (this.isSpyLike(spy)) {
			spy.and.callFake((key: string | number) =>
				Object.prototype.hasOwnProperty.call(returnMap, key)
					? of(returnMap[key])
					: of(defaultReturn)
			);
		}
		this.throwNotASpyError(spyName);
	}

	public withReturnSubjectForObservableProperty<
		T,
		K extends ObservablePropertyNames<T, any>,
		U extends ObservableType<T[K]>>(
			objectToMock: T,
			observablePropertyName: K,
			initialValue?: U,
			replayBuffer: number = 1
	): ReplaySubject<U> {
		const subject = new ReplaySubject<U>(replayBuffer);
		(objectToMock[observablePropertyName] as any) = subject.asObservable();
		if (initialValue !== undefined) {
			subject.next(initialValue);
		}
		return subject;
	}

	public withReturnSubjectWithCompletingCountedObservableForObservableProperty<
		T,
		K extends ObservablePropertyNames<T, any>,
		U extends ObservableType<T[K]>>(
			objectMock: T,
			propertyName: K,
			initialValue?: U,
			replayBuffer: number = 1
	): {
		subject: ReplaySubject<U>;
		counter: TestSubscriptionCounter<U>
	} {
		const subject = new ReplaySubject<U>(replayBuffer);
		const counter = new TestSubscriptionCounter(subject.asObservable());
		(objectMock[propertyName] as any) = counter.countedObservable$;
		if (initialValue !== undefined) {
			subject.next(initialValue);
		}

		return {
			subject,
			counter
		}
	}

	public withReturnSubjectAsObservable<T>(
		spy: ObservableFunction<T>,
		resolveWith?: T,
		spyName?: string
	): Subject<T> {
		if (this.isSpyLike(spy)) {
			const subject = new Subject<T>();
			if (resolveWith !== undefined) {
				subject.next(resolveWith);
			}
			const observable = subject.asObservable();
			spy.and.returnValue(observable);
			return subject;
		}

		this.throwNotASpyError(spyName);
	}

	public withReturnReplaySubjectAsObservable<T>(
		spy: ObservableFunction<T>,
		resolveWith?: T,
		bufferSize: number = 1,
		spyName?: string
	): ReplaySubject<T> {
		if (this.isSpyLike(spy)) {
            const subject: ReplaySubject<T> = new ReplaySubject<T>(bufferSize);
            if (resolveWith !== undefined) {
                subject.next(resolveWith);
            }
            spy.and.returnValue(subject);
            return subject;
        }
        this.throwNotASpyError(spyName);
	}

	public withReturnSubjectWithErrorAsObservable<T>(
		spy: ObservableFunction<T>,
		resolveWithError?: string,
		spyName?: string
	): Subject<T> {
		if (this.isSpyLike(spy)) {
			let subject = new Subject<T>();
			if (resolveWithError) {
				subject.error(resolveWithError);
			} else {
				subject.error(new Error("error"))
			}
			let observable = subject.asObservable();
			spy.and.returnValue(observable);
			return subject;
		}
		this.throwNotASpyError(spyName);
	}

	public withReturnSubjectWithHttpErrorAsObservable<T>(
		spy: ObservableFunction<T>,
		resolveWithHttpError?: HttpErrorResponse,
		spyName?: string
	): Subject<T> {
		if (this.isSpyLike(spy)) {
            const subject: Subject<T> = new Subject<T>();
            if (resolveWithHttpError) {
                subject.error(resolveWithHttpError);
            } else {
				subject.error(new HttpErrorResponse({}))
            }
			let observable = subject.asObservable();
            spy.and.returnValue(observable);
            return subject;
        }
        this.throwNotASpyError(spyName);
	}

	// Maybe include withReturnPromise and withReturnRejectedPromise
}
