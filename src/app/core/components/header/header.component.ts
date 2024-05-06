import {Component, EventEmitter, HostListener, OnInit, Output} from '@angular/core';
import {BehaviorSubject, combineLatestWith, map, Observable, tap} from "rxjs";

interface IHeaderVm {
	darkTheme: boolean;
	menuOpen: boolean;
	menuAlwaysOpen: boolean;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
	@Output() public themeChange = new EventEmitter<boolean>()
	private prefersDarkTheme$$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	private prefersDarkTheme$: Observable<boolean> = this.prefersDarkTheme$$
		.pipe(
			tap((dark) => {
				this.themeChange.emit(dark);
			})
		);
	private menuAlwaysOpen$$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
	private menuOpen$$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	public vm$: Observable<IHeaderVm>;

	// TODO: Accounts and authentication state
	constructor(
	) {
	}

	public ngOnInit(): void {
		const prefersDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
		this.prefersDarkTheme$$.next(prefersDarkTheme);
		const isLarge = window.innerWidth >= 992;
		this.menuAlwaysOpen$$.next(isLarge);

		this.vm$ = this.prefersDarkTheme$.pipe(
			combineLatestWith(
				this.menuOpen$$,
				this.menuAlwaysOpen$$
			),
			map(([prefersDark, menuOpen, menuAlwaysOpen]) => {
				return {
					darkTheme: prefersDark,
					menuOpen,
					menuAlwaysOpen
				}
			})
		)
	}

	public toggleMenu(): void {
		this.menuOpen$$.next(!this.menuOpen$$.value);
	}

	public toggleTheme(): void {
		this.prefersDarkTheme$$.next(!this.prefersDarkTheme$$.value);
	}

	@HostListener('window:resize', ['$event'])
	public onResize(e: Event) {
		const isLarge = (e.target as Window).innerWidth >= 992;
        this.menuAlwaysOpen$$.next(isLarge);
	}
}
