import { DefaultReporter } from 'vitest/node';

/**
 * Like the built-in `minimal` reporter (only failures are printed), but with a single-line
 * progress indicator in a TTY:
 *
 *   Tests 1234/5067 | Files 12/46 | 2 failed | 6 skipped | 4.8s
 *
 * The built-in `dot` reporter, and the multi-line live summary of the `default` reporter,
 * can both grow taller than the terminal, at which point they can't be redrawn in place
 * and the output scrolls endlessly instead. A single line truncated to the terminal width
 * can never wrap, so this can't happen.
 *
 * We reuse the `default` reporter's renderer (which redraws the window at the bottom of
 * the terminal and forwards other output above it), and replace the window contents.
 * This relies on the internal `summary.createSummary` method (Vitest 4.1), and falls
 * back to the default multi-line summary if that changes.
 */
export default class CompactReporter extends DefaultReporter {
	#files = { total: 0, completed: 0 };
	#tests = { total: 0, completed: 0, failed: 0, skipped: 0 };
	#start = 0;

	/** @param {ConstructorParameters<typeof DefaultReporter>[0]} [options] */
	constructor(options = {}) {
		super({ silent: 'passed-only', ...options });

		const summary = /** @type {{ createSummary?: () => string[] } | undefined} */ (this.summary);

		if (typeof summary?.createSummary === 'function') {
			// the trailing empty row leaves the cursor at the start of a line, which the
			// renderer relies on when clearing the window before the next render
			summary.createSummary = () => [this.#progress(), ''];
		}
	}

	#progress() {
		const files = this.#files;
		const tests = this.#tests;
		const elapsed = ((performance.now() - this.#start) / 1000).toFixed(1);

		const parts = [
			`Tests ${tests.completed}/${tests.total}`,
			`Files ${files.completed}/${files.total}`,
			tests.failed && `${tests.failed} failed`,
			tests.skipped && `${tests.skipped} skipped`,
			`${elapsed}s`
		].filter(Boolean);

		// leave the last column free, some terminals wrap when the cursor reaches it
		const columns = Math.max(1, this.ctx.logger.getColumns() - 1);
		const line = ` ${parts.join(' | ')}`.slice(0, columns);

		return tests.failed ? `\x1b[31m${line}\x1b[39m` : line;
	}

	/** @param {Parameters<DefaultReporter['onTestRunStart']>[0]} specifications */
	onTestRunStart(specifications) {
		this.#files = { total: specifications.length, completed: 0 };
		this.#tests = { total: 0, completed: 0, failed: 0, skipped: 0 };
		this.#start = performance.now();
		super.onTestRunStart(specifications);
	}

	/** @param {import('vitest/node').TestModule} module */
	onTestModuleCollected(module) {
		for (const _ of module.children.allTests()) this.#tests.total++;
		super.onTestModuleCollected(module);
	}

	/** @param {import('vitest/node').TestCase} test */
	onTestCaseResult(test) {
		const state = test.result().state;
		this.#tests.completed++;
		if (state === 'failed') this.#tests.failed++;
		if (state === 'skipped') this.#tests.skipped++;
		super.onTestCaseResult(test);
	}

	/** @param {import('vitest/node').TestModule} module */
	onTestModuleEnd(module) {
		this.#files.completed++;
		super.onTestModuleEnd(module);
	}

	/** @param {import('vitest/node').TestModule} module */
	printTestModule(module) {
		if (module.state() === 'failed') super.printTestModule(module);
	}

	/**
	 * @param {Parameters<DefaultReporter['printTestCase']>[0]} state
	 * @param {import('vitest/node').TestCase} test
	 */
	printTestCase(state, test) {
		if (test.result().state === 'failed') super.printTestCase(state, test);
	}
}
