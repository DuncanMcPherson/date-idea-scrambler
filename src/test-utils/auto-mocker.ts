import isEmpty from 'lodash-es/isEmpty';
import uniq from 'lodash-es/uniq';
import {Accessor, Constructor} from "../@types";

interface IMemberData<T> {
	readonly methodNames: readonly (keyof T)[];
	readonly definedPropertiesData: readonly IDefinedPropertyData<T>[];
}

interface IDefinedPropertyData<T> {
	readonly propertyName: keyof T;
	readonly hasGet: boolean;
	readonly hasSet: boolean;
}

export interface IMockClassOptions<T> {
	readonly additionalMethodsToMock: readonly (keyof T)[];
	readonly ignoredProperties: readonly (keyof T)[];
	readonly ignoreAllProperties: boolean;
}

const mockClassOptionsDefaults: IMockClassOptions<any> = {
	additionalMethodsToMock: [],
	ignoreAllProperties: false,
	ignoredProperties: []
}

/* istanbul ignore next*/
export class AutoMocker {
	constructor(private readonly maxDepth: number = 1) {
	}

	public mockClass<T>(
		ctor: Constructor<T>,
		opts: Partial<IMockClassOptions<T>>
	): T {
		const appliedOptions: IMockClassOptions<T> = {
			...mockClassOptionsDefaults as IMockClassOptions<T>,
			...opts
		}

		const memberData = this.getMemberData(ctor);
		const allMethodsToMock: readonly (keyof T)[] = uniq([
			...memberData.methodNames,
			...appliedOptions.additionalMethodsToMock
		]);

		const mock = isEmpty(allMethodsToMock)
			? ({} as T)
			: jasmine.createSpyObj<T>(
				ctor.prototype.constructor.name,
				allMethodsToMock as jasmine.SpyObjMethodNames<T>
			);

		if (!appliedOptions.ignoreAllProperties) {
			memberData.definedPropertiesData.filter(
				(propertyData) => !appliedOptions.ignoredProperties.includes(propertyData.propertyName)
			)
				.forEach((propertyData) => {
					this.addMockDefinedProperty<T>(mock, propertyData)
				});
		}

		return mock;
	}

	public mock<T extends {}>(objectName: string, objectToMock: T, maxDepth?: number): void {
		if (!!objectToMock && this.isObject(objectToMock) || this.isFunction(objectToMock)) {
			this.mockObject(objectName, objectToMock, 0, maxDepth || this.maxDepth);
		}
	}

	public withCallFake<TFunction extends (...args: any[]) => any>(
		spy: TFunction,
		fakeFunction: (...params: Parameters<TFunction>) => ReturnType<TFunction>,
		spyName?: string
	): void {
		if (this.isSpyLike(spy)) {
			spy.and.callFake(fakeFunction);
			return;
		}
		this.throwNotASpyError(spyName);
	}

	public withFirstArgMappedReturn<T>(
		spy: (arg1: string | number, ...args: any[]) => T,
		returnMap: Record<string | number, T>,
		defaultReturn: T = undefined!,
		spyName?: string
	): void {
		if (this.isSpyLike(spy)) {
			spy.and.callFake((key) =>
				Object.prototype.hasOwnProperty.call(returnMap, key)
					? returnMap[key]
					: defaultReturn
			)
			return;
		}
		this.throwNotASpyError(spyName);
	}

	public withCallThrough(spy: Function, spyName?: string): void {
		if (this.isSpyLike(spy)) {
			spy.and.callThrough();
			return;
		}
		this.throwNotASpyError(spyName);
	}

	public withReturnValue<T>(spy: (...args: any[]) => T, returnValue: T, spyName?: string): void {
		if (this.isSpyLike(spy)) {
			spy.and.returnValue(returnValue);
			return;
		}
		this.throwNotASpyError(spyName);
	}

	public withReturnForArguments<TFunction extends (...args: any[]) => any>(
		spy: TFunction,
		args: [...Parameters<TFunction>],
		returnValue: ReturnType<TFunction>,
		spyName?: string
	): void {
		if (!this.isSpyLike(spy)) {
			this.throwNotASpyError(spyName);
		}
		spy.withArgs(...args).and.returnValue(returnValue);
	}

	public withReturnValues<T>(
		spy: (...args: any[]) => T,
		returnValues: T[],
		spyName?: string
	): void {
		this.isSpyLike(spy) ? spy.and.returnValues(...returnValues) : this.throwNotASpyError(spyName);
	}

	public withThrows(spy: Function, message?: string, spyName?: string): void {
		this.isSpyLike(spy) ? spy.and.throwError(message!) : this.throwNotASpyError(spyName)
	}

	public resetSpy(spy: Function, spyName?: string): void {
		this.isSpyLike(spy) ? spy.calls.reset() : this.throwNotASpyError(spyName)
	}

	public withCallAccessorFake<T>(
		obj: T,
		key: keyof T,
		fake: (params: any) => any,
		accessor?: Accessor,
		spyName?: string
	): void {
		this.withCallFake(
			this.getPropertyAccessorSpy(obj, key, accessor),
			fake,
			spyName
		)
	}

	public withCallAccessorThrough<T>(
		obj: T,
		key: keyof T,
		accessor?: Accessor,
		spyName?: string
	): void {
		this.withCallThrough(this.getPropertyAccessorSpy(obj, key, accessor), spyName);
	}

	public withReturnGetterValue<T, K extends keyof T>(
		obj: T,
		key: K,
		returnValue: T[K],
		spyName?: string
	): void {
		this.withReturnValue(this.getPropertyAccessorSpy(obj, key), returnValue, spyName)
	}

	public withReturnGetterValues<T, K extends keyof T>(
		obj: T,
		key: K,
		returnValues: T[K][],
		spyName?: string
	): void {
		this.withReturnValues(this.getPropertyAccessorSpy(obj, key), returnValues, spyName)
	}

	public withAccessorThrows<T, K extends keyof T>(
		obj: T,
		key: K,
		accessor?: Accessor,
		message?: string,
		spyName?: string
	): void {
		this.withThrows(this.getPropertyAccessorSpy(obj, key, accessor), message, spyName);
	}

	public resetAccessorSpy<T, K extends keyof T>(
		obj: T,
		key: K,
		accessor?: Accessor,
		spyName?: string
	): void {
		this.resetSpy(this.getPropertyAccessorSpy(obj, key, accessor), spyName);
	}

	public getCallArgs<TFunction extends (...args: any[]) => any>(
		spy: TFunction,
		callIndex: number = 0,
		spyName?: string
	): Parameters<TFunction> {
		if (this.isSpyLike(spy)) {
			return spy.calls.argsFor(callIndex) as Parameters<TFunction>;
		}
		this.throwNotASpyError(spyName);
	}

	public getCallCount<TFunction extends (...args: any[]) => any>(
		spy: TFunction,
		spyName?: string
	): number {
		if (this.isSpyLike(spy)) {
			return spy.calls.all().length;
		}
		this.throwNotASpyError(spyName);
	}

	private getMemberData<T>(ctor: Constructor<T>): IMemberData<T> {
		const methodNames: (keyof T)[] = [];
		const definedPropertiesData: IDefinedPropertyData<T>[] = [];

		let currentPrototype = ctor.prototype;
		do {
			if (currentPrototype.name === 'Object') {
				break;
			}

			(Object.getOwnPropertyNames(currentPrototype) as (keyof T)[]).forEach(key => {
				if (key === "constructor") {
					return;
				}

				const propertyData = this.getDefinedPropertyData(currentPrototype, key);
				if (propertyData && (propertyData.hasGet || propertyData.hasSet)) {
					definedPropertiesData.push(propertyData);
					return;
				}

				if (this.isFunction(currentPrototype[key])) {
					methodNames.push(key);
					return;
				}
			})
		} while ((currentPrototype = Object.getPrototypeOf(currentPrototype)))

		return {
			methodNames,
			definedPropertiesData
		}
	}

	private getDefinedPropertyData<T>(obj: T, propertyName: keyof T): IDefinedPropertyData<T> | null {
		try {
			const descriptor = Object.getOwnPropertyDescriptor(obj, propertyName);
			return {
				propertyName,
				hasGet: (descriptor && this.isFunction(descriptor.get)) ?? false,
				hasSet: (descriptor && this.isFunction(descriptor.set)) ?? false
			};
		} catch {
			return null;
		}
	}

	private addMockDefinedProperty<T>(mock: T, propertyData: IDefinedPropertyData<T>): void {
		const attributes = {
			get: propertyData.hasGet ? () => {
			} : undefined,
			set: propertyData.hasSet ? () => {
			} : undefined,
			configurable: true
		}

		Object.defineProperty(mock, propertyData.propertyName, attributes);
		this.mockAsProperty(mock, propertyData.propertyName);
	}

	private mockObject<T extends {}>(
		objectName: string,
		objectToMock: T,
		depth: number,
		maxDepth: number
	): void {
		// noinspection JSDeprecatedSymbols
		if (objectToMock.constructor === HTMLDocument) {
			return;
		}

		const objectKeys = this.getInstancePropertyNames(objectToMock);
		// @ts-ignore
		objectKeys.forEach((key: keyof T & string) => {
			try {
				if (!this.mockAsProperty(objectToMock, key)) {
					objectToMock[key] = this.mockValue(
						objectName,
						objectToMock,
						key,
						depth++,
						maxDepth
					)
				}
			} catch (e) {
				console.error(`Unable to mock object: ${objectName}, key: ${key} with preexisting value of ${objectToMock[key]}`);
			}
		})
	}

	private getInstancePropertyNames<T>(objectToMock: T): string[] {
		let names: Set<string> = new Set<string>();
		let proto = objectToMock
		while (proto && proto !== Object.prototype) {
			Object.getOwnPropertyNames(proto).forEach((name) => {
				if (name !== "constructor") {
					names.add(name);
				}
				proto = Object.getPrototypeOf(proto);
			})
		}
		return Array.from(names);
	}

	private mockAsProperty<T, K extends keyof T>(objectToMock: T, key: K): boolean {
		let descriptor: PropertyDescriptor;
		do {
			descriptor = Object.getOwnPropertyDescriptor(objectToMock, key)!;
		} while (!descriptor && (objectToMock = Object.getPrototypeOf(objectToMock)))

		if (descriptor && (descriptor.get || descriptor.set)) {
			if (descriptor.get && !this.isSpyLike(descriptor.get)) {
				spyOnProperty(objectToMock, key, "get").and.callThrough();
			}

			if (descriptor.set && !this.isSpyLike(descriptor.set)) {
				spyOnProperty(objectToMock, key, "set").and.callThrough();
			}
			return true;
		}
		return false;
	}

	private mockValue<T, K extends keyof T>(
		objectName: string,
		objectToMock: T,
		key: K,
		depth: number,
		maxDepth: number
	): any {
		const value = objectToMock[key];

		if (this.isUndefined(value) || value === null) {
			return value;
		}
		if (Array.isArray(value)) {
			return depth < maxDepth
				? value.map((item, i) =>
					this.mockValue(`${objectName}[${i}]`, value, i as any, depth++, maxDepth),
				)
				: value;
		}
		if (this.isFunction(value)) {
			return this.isSpyLike(value)
				? value
				: spyOn(objectToMock, key as unknown as T[keyof T] extends Function ? keyof T : never);
		}
		if (this.isObject(value)) {
			return depth < maxDepth
				// @ts-ignore
				? this.mockObject(`${objectName}.${String(key)}`, value, depth++, maxDepth)
				: value;
		}
		if (this.isString(value)) {
			return `${objectName}.${String(key)}` + this.generateNumber().toString();
		}
		if (this.isDate(value)) {
			return new Date(2000, 1, 1, 1, 1, 1, 1);
		}
		if (this.isNumber(value)) {
			return this.generateNumber();
		}
		return value;
	}

	private getPropertyAccessorSpy<T, K extends keyof T>(
		obj: T,
		key: K,
		accessor: Accessor = "get"
	): jasmine.Spy {
		let descriptor: PropertyDescriptor;
		do {
			descriptor = Object.getOwnPropertyDescriptor(obj, key)!;
		} while (!descriptor && (obj = Object.getPrototypeOf(descriptor)));

		if (!descriptor) {
			return null!;
		}

		return descriptor[accessor] as jasmine.Spy;
	}

	private generateNumber(): number {
		return Math.floor(Math.random() * 1000);
	}

	private isFunction(value: any): value is Function {
		return typeof value === "function";
	}

	private isObject(value: any): value is Object {
		return value !== null && typeof value === "object";
	}

	private isDate(value: any): value is Date {
		return toString.call(value) === "[object Date]";
	}

	private isNumber(value: any): value is number {
		return typeof value === "number";
	}

	private isString(value: any): value is string {
		return typeof value === "string";
	}

	private isUndefined(value: any): boolean {
		return typeof value === "undefined";
	}

	protected throwNotASpyError(spyName: string = '[spyName not provided]'): never {
		throw new Error(`${this.throwNotASpyError.caller.name}: Provided spy ${spyName} is not an actual spy`);
	}

	protected isSpyLike(value: any): value is jasmine.Spy {
		return value && !!value.calls;
	}
}
