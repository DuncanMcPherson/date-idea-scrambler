import {HeaderComponent} from "./header.component";
import {readObservableSynchronously} from "../../../../test-utils/read-observable-synchronously";
import {head} from "lodash-es";

describe('Header Component', () => {
	let headerComponent: HeaderComponent;

	beforeEach(() => {
		headerComponent = new HeaderComponent();
	})

	it("should create the component", () => {
		expect(headerComponent).toBeTruthy();
	});

	describe("ngOnInit", () => {
		it("should initialize the vm$", () => {
			headerComponent.ngOnInit();
			headerComponent["prefersDarkTheme$$"].next(false);
            expect(headerComponent.vm$).toBeDefined();
			const vmValue = readObservableSynchronously(headerComponent.vm$);
			expect(vmValue).toEqual({
				darkTheme: false,
				menuOpen: false,
				menuAlwaysOpen: false
			});
		});
	});

	describe("toggleMenu", () => {
		beforeEach(() => {
			headerComponent.ngOnInit();
		});

		it("should toggle the menu", () => {
			let state: boolean;

			headerComponent.vm$.subscribe((vm) => {
				state = vm.menuOpen;
			});

			expect(state!).toEqual(false);
			headerComponent.toggleMenu();
			expect(state!).toEqual(true);
		});
	});

	describe("toggleTheme", () => {
		beforeEach(() => {
			headerComponent.ngOnInit();
			headerComponent["prefersDarkTheme$$"].next(true);
		});

		it("should toggle the theme", (done) => {
			let state: boolean;
			headerComponent.vm$.subscribe((vm) => {
				state = vm.darkTheme;
			});

			headerComponent.themeChange.subscribe((res) => {
				expect(res).not.toBe(undefined!);
				done();
			})

			expect(state!).toEqual(true);
			headerComponent.toggleTheme();
			expect(state!).toEqual(false);
		});
	});

	describe("onResize", () => {
		beforeEach(() => {
			headerComponent.ngOnInit();
			headerComponent["menuAlwaysOpen$$"].next(false);
		});

		it("should adjust always open", () => {
			const event1 = {
				target: {
					innerWidth: 993
				}
			} as unknown as Event;

			const event2 = {
				target: {
					innerWidth: 991
				}
			} as unknown as Event;
			let state: boolean;
			headerComponent.vm$.subscribe((vm) => {
				state = vm.menuAlwaysOpen;
			});
			expect(state!).toEqual(false);
			headerComponent.onResize(event1);
			expect(state!).toEqual(true);
			headerComponent.onResize(event2);
			expect(state!).toEqual(false);
		})
	})
})
