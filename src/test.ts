import 'zone.js/testing';
import { getTestBed } from "@angular/core/testing";
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from "@angular/platform-browser-dynamic/testing";
import Chance from 'chance';

import { NoExpectReporter } from "../jasmine-extensions/no-expect-reporter";

jasmine.getEnv().addReporter(new NoExpectReporter())

getTestBed().initTestEnvironment(
	BrowserDynamicTestingModule,
	platformBrowserDynamicTesting()
);

const chanceValue = new Chance();

declare global {
	let chance: Chance.Chance;
}

chance = chanceValue;
