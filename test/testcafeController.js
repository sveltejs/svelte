// based on https://github.com/cvializ/testcafe-mocha

import * as fs from 'fs';
import * as createTestCafe from 'testcafe';
import { ClientFunction, Selector, TestController } from 'testcafe';
import * as browserProviderPool from 'testcafe/lib/browser/provider/pool';

export const testcafeHolder = {
	testController: null,
	captureResolver: null,
	getResolver: null,

	capture: function(t) {
		testcafeHolder.testController = t;
		if (testcafeHolder.getResolver) {
			testcafeHolder.getResolver(t);
		}
		return new Promise(function(resolve) {
			testcafeHolder.captureResolver = resolve;
		});
	},

	free: function() {
		testcafeHolder.testController = null;
		if (testcafeHolder.captureResolver) {
			testcafeHolder.captureResolver();
		}
	},

	get: function() {
		return new Promise(function(resolve) {
			if (testcafeHolder.testController) {
				resolve(testcafeHolder.testController);
			} else {
				 testcafeHolder.getResolver = resolve;
			}
		});
	},
};

export class TestcafeController {

	// path is relative to project root
	// must not contain slashes
	static testcafeTempfile = 'temp_testcafeTestSrc.js';

	static createTestCafeWithRunner(browserList, port1, port2) {
		return createTestCafe('localhost', port1, port2)
			.then(function(testcafe) {
				const runner = testcafe.createRunner();
				// http://devexpress.github.io/testcafe/documentation/using-testcafe/programming-interface/runner.html
				runner
					.src('./'+TestcafeController.testcafeTempfile)
					//.screenshots('reports/screenshots/', true)
					.browsers(browserList)
					.run();
				return testcafe;
			});
	}

	// TODO better than tempfile?
	// add method to testcafe.runner?
	static createTestFile(options) {
		const opt = Object.assign({}, {
			// default options
			fixtureName: 'fixture',
			testName: 'test',
			// import path is relative to project root
			testcafeControllerFile: './test/testcafeController',
		}, options);
		fs.writeFileSync(
			TestcafeController.testcafeTempfile,
			`
				import { testcafeHolder } from ${JSON.stringify(opt.testcafeControllerFile)};
				fixture(${JSON.stringify(opt.fixtureName)});
				test(${JSON.stringify(opt.testName)}, testcafeHolder.capture);
			`
		);
	}

	static deleteTestFile() {
		fs.unlinkSync(TestcafeController.testcafeTempfile);
	}

	static async testcafeListLocalBrowsers() {
		// copy paste from testcafe/lib/cli/cli.js
		const providerName = 'locally-installed';
		const provider = await browserProviderPool.getProvider(providerName);
		if (provider && provider.isMultiBrowser) {
			const browserNames = await provider.getBrowserList();
			await browserProviderPool.dispose();
			return browserNames;
		}
		else
			return [];
	}

	constructor(t) {
		this.t = t; // testController
		this._fn_getTitle = this.getFunc(() => document.title);
		this.consolePos = null;
	}

	bindFunc(fn) {
		return fn.with({boundTestRun: this.t});
	}

	// run javascript in browser. sample use:
	//   const f = c.getFunc(() => document.title);
	//   const t = await f();
	getFunc(fn) {
		return this.bindFunc(ClientFunction(fn));
	}

	// some utility functions

	async findFirstElement(cssSelector) {
		return await this.bindFunc(Selector(cssSelector).nth(0));
	}

	// send keyboard string to browser
	// handle null = document
	async sendKeys(handle, keys) {
		if (handle)
			await this.t.typeText(handle.getElement(), keys);
		else
			await this.t.pressKey(keys);
	}

	// get last console messages
	async popConsole() {
		const _console = await this.t.getBrowserConsoleMessages();

		const res = this.consolePos
			? Object.keys(_console)
				.reduce((acc, key) => {
					acc[key] = _console[key].slice(this.consolePos[key]);
					return acc;
				}, {})
			: _console;

		// save array positions
		this.consolePos = Object.keys(_console)
		.reduce((acc, key) => {
			acc[key] = _console[key].length;
			return acc;
		}, {});

		return res;
	}

	async getElementText(handle) {
		return await handle.getElement().innerText;
	}

	async getTitle() {
		return await this._fn_getTitle();
	}

	async click(handle) {
		return await this.t.click(handle.getElement());
	}
}
