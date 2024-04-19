import {NgModule} from '@angular/core';
import {RouterModule, Routes, TitleStrategy} from '@angular/router';
import {DateIdeaTitleStrategy} from "./title/date-idea.strategy";

const routes: Routes = [
	{
		path: 'account',
		loadChildren: () => import('./account/account.module').then(m => m.AccountModule)
	},
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'account'
	}
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
	providers: [
		{
			provide: TitleStrategy,
			useClass: DateIdeaTitleStrategy
		}
	]
})
export class AppRoutingModule {
}
