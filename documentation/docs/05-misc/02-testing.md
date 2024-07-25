---
title: Testing
---

Testing helps you write and maintain your code and guard against regressions. Testing frameworks help you with that, allowing you to describe assertions or expectations about how your code should behave. Svelte is unopinionated about which testing framework you use, so you can write unit tests, integration tests, and end-to-end tests using solutions like Vitest, Jasmine, Cypress and Playwright.

## Unit/Integration-testing using Vitest

Unit tests allow you to test small isolated parts of your code. Integration tests allow you to test parts of your application to see if they work together. We recommend using [Vitest](https://vitest.dev/) for these kinds of tests (this assumes you use Vite for bundling your application).

To get started, install Vitest (`npm install vitest -D`) and JSDOM (a library that shims DOM APIs, `npm install jsdom -D`). Then adjust your `vite.config.js` such that you can simulate a browser environment for testing Svelte components on the client:

```js
/// file: vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		/* ... */
	],
	test: {
		// If you are testing components client-side, you need to setup a DOM environment.
		// If not all your files should have this environment, you can use a
		// `// @vitest-environment jsdom` comment at the top of the test files instead.
		environment: 'jsdom'
	},
	// Tell Vitest to prefer the browser condition. Svelte uses a so-called exports map
	// which loads different code depending on the environment - we want to load the browser environment.
	resolve: process.env.VITEST
		? {
				conditions: ['browser']
			}
		: undefined
});
```

After that, you can create a test file in which you import the component to test, then interact with it programmatically and write expectations about the results:

```js
/// file: component.test.js
import { flushSync, mount, unmount } from "svelte";
import { expect, test } from "vitest";
import Component from "./Component.svelte";

test("Component", () => {
	// Instantiate the component using Svelte's mount API
	const comp = mount(Component, {
		target: document.body, // document.body is available thanks to JSDOM
		props: { initial: 0 },
	});

	expect(document.body.innerHTML).toBe("<button>0</button>");

	// Click the button, then flush the changes so you can synchronously write expectations
	document.body.querySelector("button")!.click();
	flushSync();

	expect(document.body.innerHTML).toBe("<button>1</button>");

	// Remove the component from the DOM
	unmount(comp);
});

```

While the process is very straightforward, it is also low level and somewhat brittle - the structure of your component might change and you then may need to adjust your query selectors more often than not. Solutions like [@testing-library/svelte](https://testing-library.com/docs/svelte-testing-library/intro/) can help you facilitate this problem.

### Using runes inside your test files

It is possible to use runes inside your test files. First ensure your bundler knows to route the file through the Svelte compiler before running the test by adding `.svelte` to the filename (e.g `multiplier.svelte.test.js`). After that, you can use runes inside your tests.

```js
/// file: counter.svelte.test.js
import { flushSync, mount, unmount } from 'svelte';
import { expect, test } from 'vitest';
import { multiplier } from './multiplier.svelte.js';

test('Multiplier', () => {
	let count = $state(0);
	let double = multiplier(() => count, 2);

	expect(double.value).toEqual(0);

	count = 5;

	expect(double.value).toEqual(10);
});
```

If the tested code uses effects, you need to wrap the test inside `$effect.root` to create a scope in which these are properly captured.

```js
/// file: logger.svelte.test.js
import { flushSync, mount, unmount } from 'svelte';
import { expect, test } from 'vitest';
import { logger } from './logger.svelte.js';

test('Effect', () => {
	const cleanup = $effect.root(() => {
		let count = $state(0);
		// logger uses an $effect to log updates of its input
		let log = logger(() => count);

		// effects normally run after a microtask,
		// use flushSync to execute all pending effects synchronously
		flushSync();
		expect(log.value).toEqual([0]);

		count = 1;
		flushSync();

		expect(log.value).toEqual([0, 1]);
	});

	cleanup();
});
```

## E2E tests using Playwright

E2E (short for "end to end") tests allow you to test your full application through the eyes of the user. This section uses [Playwright](https://playwright.dev/) as an example, but you can also use other solutions like [Cypress](https://www.cypress.io/) or [NightwatchJS](https://nightwatchjs.org/).

To get start with Playwright, either let you guide by [their VS Code extension](https://playwright.dev/docs/getting-started-vscode), or install it from the command line using `npm init playwright`. It is also part of the setup CLI when you run `npm create svelte`.

After you've done that, you should have a `tests` folder and a playwright config. You may need to adjust that config to tell Playwright what to do before running the tests - mainly starting your application at a certain port:

```js
/// file: playwright.config.js
const config = {
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/
};

export default config;
```

You can now start writing tests. These are totally unaware of Svelte as a framework, so you mainly interact with the DOM and write assertions.

```js
/// file: tests/hello-world.spec.js
import { expect, test } from '@playwright/test';

test('home page has expected h1', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h1')).toBeVisible();
});
```
