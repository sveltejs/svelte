import results from './results.json';

export async function load() {
	let total = 0;
	let passed = 0;
	let failed = 0;
	let skipped = 0;

	const suites = results.testResults
		.map((suite) => {
			let name = suite.name.split('/').at(-2);

			if (name === 'runtime-browser') {
				// special case
				name = suite.assertionResults[0].ancestorTitles[1];
			}

			return {
				name,
				tests: suite.assertionResults.map((test) => {
					total += 1;
					if (test.status === 'passed') passed += 1;
					if (test.status === 'failed') failed += 1;
					if (test.status === 'skipped') skipped += 1;
					return {
						title: test.title,
						status: test.status
					};
				})
			};
		})
		.sort((a, b) => (a.name < b.name ? -1 : +1));

	return {
		nav_title: 'Status',
		results: {
			suites,
			total,
			passed,
			failed,
			skipped
		}
	};
}
