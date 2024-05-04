import {HeaderComponent} from "./header.component";
import {readObservableSynchronously} from "../../../../test-utils/read-observable-synchronously";

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
            expect(headerComponent.vm$).toBeDefined();
			const vmValue = readObservableSynchronously(headerComponent.vm$);
			expect(vmValue).toEqual({
				darkTheme: true,
				menuOpen: false,
				menuAlwaysOpen: false
			});
		});
	})
})
