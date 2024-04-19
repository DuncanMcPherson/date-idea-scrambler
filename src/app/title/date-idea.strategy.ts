import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, PRIMARY_OUTLET, RouterStateSnapshot, TitleStrategy} from "@angular/router";
import {Title} from "@angular/platform-browser";

@Injectable({
	providedIn: "root"
})
export class DateIdeaTitleStrategy extends TitleStrategy {
	constructor(
		private title: Title
	) {
		super();
	}

	override updateTitle(snapshot: RouterStateSnapshot) {
		const title = this.buildTitle(snapshot);
		if (title != null) {
			this.title.setTitle(`${title} - Date Idea Scrambler`);
		}
	}

	override buildTitle(snapshot: RouterStateSnapshot): string | undefined {
		let titles: string[] = []
		let root: ActivatedRouteSnapshot | undefined = snapshot.root
		while (root !== undefined) {
			const title = this.getResolvedTitleForRoute(root);
			title !== undefined && title.trim() !== '' && titles.push(title)
			root = root.children.find((child) => child.outlet === PRIMARY_OUTLET);
		}
		return titles.join(' - ')
	}
}
