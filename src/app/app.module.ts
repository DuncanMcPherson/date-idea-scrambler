import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {CoreModule} from "./core/core.module";
import {AppService} from "./core/services/app/app.service";
import {NgxsModule} from "@ngxs/store";
import {environment} from "../environments/environment";
import {UserState} from "./core/states/user.state";

@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		CoreModule,
		NgxsModule.forRoot([UserState], {
			developmentMode: !environment.production
		})
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule {
	constructor(
		appService: AppService
	) {
		appService.initialize();
	}
}
