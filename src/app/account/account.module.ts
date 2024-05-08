import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AccountPageComponent} from './components/account-page/account-page.component';
import {RouterModule, Routes} from "@angular/router";
import {SignUpComponent} from './components/sign-up/sign-up.component';
import {authGuard} from "../core/guards/auth.guard";

const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		title: 'Account',
		component: AccountPageComponent,
		canMatch: [authGuard]
	},
	{
		path: 'sign-in',
		redirectTo: 'sign-up'
	},
	{
		path: 'sign-up',
		component: SignUpComponent,
	}
]

@NgModule({
	declarations: [
		AccountPageComponent,
		SignUpComponent
	],
	imports: [
		CommonModule,
		RouterModule.forChild(routes)
	]
})
export class AccountModule {
}
