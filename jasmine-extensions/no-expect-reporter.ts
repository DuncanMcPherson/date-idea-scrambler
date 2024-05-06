import CustomReporter = jasmine.CustomReporter;
import SuiteInfo = jasmine.SuiteInfo;
import RunDetails = jasmine.RunDetails;

export interface NoExpectReporterResult extends jasmine.SuiteResult {
}

export interface ExecutedSpecs {
	failed: NoExpectReporterResult[];
	pending: NoExpectReporterResult[];
	successful: NoExpectReporterResult[];
	noExpectations: NoExpectReporterResult[];
}

export class NoExpectReporter implements CustomReporter {
	private specs: ExecutedSpecs = {
		failed: [],
		noExpectations: [],
		successful: [],
		pending: []
	}

	// public jasmineDone(runDetails: jasmine.JasmineDoneInfo): void | Promise<void> {
	// 	if (this.specs.noExpectations.length) {
	// 	}
	// }

	public specDone(result: jasmine.SpecResult): void {
		const totalExpectationsCount = result.passedExpectations.length + result.failedExpectations.length + result.deprecationWarnings.length;
		if (totalExpectationsCount === 0) {
			this.specs.noExpectations.push(result);
			result.failedExpectations.push({
				message: `${result.description}: No expectations found`,
				matcherName: 'No expectations found',
				expected: '1+ expectations',
				actual: '0 expectations',
				passed: false,
				stack: ''
			})
		}
	}
}
