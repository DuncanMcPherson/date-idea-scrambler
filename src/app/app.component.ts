import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
	/* istanbul ignore next */
	public setTheme(dark: boolean): void {
		document.querySelector('body')?.classList.add(dark ? 'dark' : 'light');
		document.querySelector('body')?.classList.remove(dark ? 'light' : 'dark');
	}
}
