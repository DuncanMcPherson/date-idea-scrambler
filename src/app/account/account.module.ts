import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AccountPageComponent} from './components/account-page/account-page.component';
import {RouterModule, Routes} from "@angular/router";

const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		title: 'Account',
		component: AccountPageComponent
	}
]

@NgModule({
	declarations: [
		AccountPageComponent
	],
	imports: [
		CommonModule,
		RouterModule.forChild(routes)
	]
})
export class AccountModule {
}
