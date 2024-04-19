import {TestBed} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {CoreModule} from "./core/core.module";
import {RouterModule} from "@angular/router";

describe('AppComponent', () => {
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				CoreModule,
				RouterModule
			],
			declarations: [
				AppComponent
			],
		}).compileComponents();
	});

	it('should create the app', () => {
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.componentInstance;
		expect(app).toBeTruthy();
	});
});
