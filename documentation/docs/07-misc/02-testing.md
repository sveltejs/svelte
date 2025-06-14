---
title: Testing
---

Testing helps you write and maintain your code and guard against regressions. Testing frameworks help you with that, allowing you to describe assertions or expectations about how your code should behave. Svelte is unopinionated about which testing framework you use — you can write unit tests, integration tests, and end-to-end tests using solutions like [Vitest](https://vitest.dev/), [Jasmine](https://jasmine.github.io/), [Cypress](https://www.cypress.io/) and [Playwright](https://playwright.dev/).

## Unit and integration testing using Vitest

Unit tests allow you to test small isolated parts of your code. Integration tests allow you to test parts of your application to see if they work together. If you're using Vite (including via SvelteKit), we recommend using [Vitest](https://vitest.dev/). You can use the Svelte CLI to [setup Vitest](/docs/cli/vitest) either during project creation or later on.

The CLI will create two configurations with Vitest: one for client code (e.g. code inside components, the `.svelte` files, as well as code with runes, the [`.svelte.(js|ts)` files](/docs/svelte/svelte-js-files)), and another for server code (API logic, pure functions, server-side utilities). This configuration is in the `vite.config.(js|ts)` file.

## Testing server code

The default configuration will only pick up tests that are in files ending in `.(test|spec).(js|ts)`. These tests will run inside a Node.js environment, so you won't have access to any DOM APIs.

Note that server tests won't work properly with runes. See the section on client code testing on how to test code that uses runes (and even use runes inside your test code).

```js
/// file: multiplier.test.js
// @errors: 2307
import { expect, test } from 'vitest';
import { multiplier } from './multiplier.js';

test('Multiplier', () => {
	let double = multiplier(0, 2);
	expect(double.value).toEqual(0);

	double.set(5);
	expect(double.value).toEqual(10);
});
```

```js
/// file: multiplier.js
/**
 * @param {number} initial
 * @param {number} k
 */
export function multiplier(initial, k) {
	let count = initial;

	return {
		get value() {
			return count * k;
		},
		/** @param {number} c */
		set: (c) => {
			count = c;
		}
	};
}
```

### Testing SSR (server-side rendering)

You can ensure components rendered on the server contain certain content by directly using Svelte's [`render`](https://svelte.dev/docs/svelte/svelte-server#render) function on server code:

```js
/// file: Greeter.ssr.test.js
import { describe, it, expect } from 'vitest';
import { render } from 'svelte/server';
import Greeter from './Greeter.svelte';

describe('Greeter.svelte SSR', () => {
	it('renders name', () => {
		const { body } = render(Greeter, { props: { name: 'foo' } });
		expect(body).toContain('foo');
	});
});
```

```svelte
<!--- file: Greeter.svelte --->
<script>
	let { name } = $props();
</script>

Hello, {name}!
```

## Testing client code

It is possible to test your components in isolation using Vitest. The default configuration will only pick up tests that are in files ending in `.svelte.(test|spec).(js|ts)`. These tests will run inside a [jsdom](https://github.com/jsdom/jsdom) environment, which means it only emulates a web browser. You may need to define specific mocks if the browser APIs you're using don't exist in jsdom.

> [!NOTE] Before writing component tests, think about whether you actually need to test the component, or if it's more about the logic _inside_ the component. If so, consider extracting out that logic to test it in isolation, without the overhead of a component.

In your test code, you'll need to import at least the `render` function from `@testing-library/svelte`:

```js
/// file: Greeter.svelte.test.js
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import Greeter from './Greeter.svelte';

describe('Greeter.svelte', () => {
	it('shows name', () => {
		const { container } = render(Greeter, { props: { name: 'Svelte Summit' } });
		expect(container).toHaveTextContent('Svelte Summit');
	});
	it('can be tested with reactive state', () => {
		const props = $state({ name: 'Svelte Summit' });
		const { container } = render(Greeter, { props });
		expect(container).toHaveTextContent('Svelte Summit');
		props.name = 'Barcelona';
		flushSync();
		expect(container).not.toHaveTextContent('Svelte Summit');
		expect(container).toHaveTextContent('Barcelona');
	});
});
```

```svelte
<!--- file: Greeter.svelte --->
<script>
	let { name } = $props();
</script>

Hello, {name}!
```

In some cases, you might also find it useful to import `@testing-library/jest-dom/vitest` for its custom matchers (in the example below, we use `toBeInTheDocument()`):

```js
/// file: App.svelte.test.js
import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import Page from './App.svelte';

describe('/App.svelte', () => {
	test('should render h1', () => {
		render(Page);
		expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
	});
});
```

```svelte
<!--- file: App.svelte --->
<section>
	<h1>
		Hello world!
	</h1>
</section>
```

When writing component tests that involve two-way bindings, context or snippet props, it's best to create a wrapper component for your specific test and interact with that. `@testing-library/svelte` contains some [examples](https://testing-library.com/docs/svelte-testing-library/example).

### Testing code with runes and using runes inside your test files

You can test all code with runes in client tests. Since Vitest processes your test files the same way as your source files, you can also use runes inside your tests, as long as the test filename includes `.svelte`:

```js
/// file: doubler.svelte.test.js
import { describe, expect, it } from 'vitest';
import { Doubler } from './doubler.svelte.js';

describe('doubler.svelte.js', () => {
	it('should double initial value', () => {
		let value = $state(1);
		let doubler = new Doubler(() => value);
		expect(doubler.value).toBe(2);
	});
	it('should be reactive', () => {
		let value = $state(0);
		let doubler = new Doubler(() => value);
		expect(doubler.value).toBe(0);
		value = 2;
		expect(doubler.value).toBe(4);
	});
});

```

```js
/// file: doubler.svelte.js
// @errors: 2729 7006
export class Doubler {
	#getNumber;
	#double = $derived(this.#getNumber() * 2);
	constructor(getNumber) {
		this.#getNumber = getNumber;
	}
	get value() {
		return this.#double;
	}
}
```

If the code being tested uses [effects](/docs/svelte/$effect), you need to wrap the test inside [`$effect.root`](/docs/svelte/$effect#$effect.root) and call [`flushSync`](/docs/svelte/svelte#flushSync) to force effects to run in the middle of test code.

```js
/// file: logger.svelte.test.js
import { flushSync } from 'svelte';
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

```js
/// file: logger.svelte.js
/**
 * @param {() => any} getValue
 */
export function logger(getValue) {
	/** @type {any[]} */
	let log = $state([]);

	$effect(() => {
		log.push(getValue());
	});

	return {
		get value() {
			return log;
		}
	};
}
```

### Adding additional jsdom mocks for client code

The default configuration creates a `vitest-setup-client.(js|ts)` file where you can define mocks to "extend" the jsdom environment with additional browser APIs.

For example, if your code uses [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage), you can mock it with code similar to the following:

```js
import { vi } from 'vitest';

const localStorageMock = {
	clear: vi.fn(),
	getItem: vi.fn(),
	key: vi.fn(),
	removeItem: vi.fn(),
	setItem: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
	value: localStorageMock,
})
```

### Testing client code with a real browser

In more complex cases, it might be undesirable to test client code with jsdom because of jsdom's missing browser APIs, subtle behavior differences compared to real browsers, or because of no actual visual feedback. It's possible to configure Vitest to use a real browser environment, driven by [Playwright](https://playwright.dev/).

To do so, start by adding the required packages:

```bash
npm install -D @vitest/browser vitest-browser-svelte playwright
```

And adjust the client testing configuration in `vite.config.js`:

```js
/// file: vite.config.js
// ...
{
	extends: './vite.config.js',
	plugins: [svelteTesting()],
	test: {
		name: 'client',
		environment: +++'browser'+++,
+++		browser: {+++
+++		enabled: true,+++
+++		provider: 'playwright',+++
+++		instances: [{+++
+++			browser: 'chromium'+++
+++		}]+++
+++	},+++
		// ...
	},
},
// ...
```

Since this is a real browser environment, the mocks in `vitest-setup-client.js` can be removed, and replaced with only the following code for additional matchers in test code:

```js
// @errors: 2688
/// <reference types="@vitest/browser/matchers" />
/// <reference types="@vitest/browser/providers/playwright" />
```

If you already had test code using the jsdom environment, you'll need to replace imports from the `@testing-library/svelte` library with imports from the `vitest-browser-svelte` library:

```js
/// file: Greeter.svelte.test.js
import { describe, it, expect } from 'vitest';
---import { render } from '@testing-library/svelte';---
+++import { render } from 'vitest-browser-svelte';+++
import { flushSync } from 'svelte';
import Greeter from './Greeter.svelte';

describe('Greeter.svelte', () => {
	it('shows name', () => {
		const { container } = render(Greeter, { props: { name: 'Svelte Summit' } });
		expect(container).toHaveTextContent('Svelte Summit');
	});
	it('can be tested with reactive state', () => {
		const props = $state({ name: 'Svelte Summit' });
		const { container } = render(Greeter, { props });
		expect(container).toHaveTextContent('Svelte Summit');
		props.name = 'Barcelona';
		flushSync();
		expect(container).not.toHaveTextContent('Svelte Summit');
		expect(container).toHaveTextContent('Barcelona');
	});
});
```

```svelte
/// file: Greeter.svelte
<script>
	let { name } = $props();
</script>

Hello, {name}!
```

For more context and examples on testing Svelte components with real browsers, Scott Spence wrote [a blog post](https://scottspence.com/posts/migrating-from-testing-library-svelte-to-vitest-browser-svelte) expanding on a talk given at Svelte Summit 2025.

## Manual unit and integration testing setup

To setup Vitest manually, first install it and the additional libraries we need for both server-side and client-side tests (using jsdom):

```bash
npm install -D vitest @testing-library/svelte @testing-library/jest-dom jsdom
```

Then adjust your `vite.config.js`:

<!-- prettier-ignore -->
```js
/// file: vite.config.js
import { defineConfig } from +++'vitest/config'+++;
+++import { svelteTesting } from '@testing-library/svelte/vite'+++;

export default defineConfig({
	// ...
	test: {
		workspace: [
			{
				extends: './vite.config.js',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}'],
				},
			},
			{
				extends: './vite.config.js',
				plugins: [svelteTesting()],
				test: {
					name: 'client',
					environment: 'jsdom',
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
					setupFiles: ['./vitest-setup-client.js'],
				},
			},
		],
	},
});
```

And create the file `vitest-setup-client.js` with a mock required by Svelte:

<!-- prettier-ignore -->
```js
/// file: vitest-setup-client.js
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// required for svelte5 + jsdom as jsdom does not support matchMedia
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	enumerable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
});

// add more mocks here if you need them
```

## E2E tests using Playwright

E2E (short for 'end to end') tests allow you to test your full application through the eyes of the user. This section uses [Playwright](https://playwright.dev/) as an example, but you can also use other solutions like [Cypress](https://www.cypress.io/) or [NightwatchJS](https://nightwatchjs.org/).

You can use the Svelte CLI to [setup Playwright](/docs/cli/playwright) either during project creation or later on. You can also [set it up with `npm init playwright`](https://playwright.dev/docs/intro). Additionally, you may also want to install an IDE plugin such as [the VS Code extension](https://playwright.dev/docs/getting-started-vscode) to be able to execute tests from inside your IDE.

If you've run `npm init playwright` or are not using Vite, you may need to adjust the Playwright config to tell Playwright what to do before running the tests - mainly starting your application at a certain port. For example:

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
// @errors: 2307 7031
/// file: tests/hello-world.spec.js
import { expect, test } from '@playwright/test';

test('home page has expected h1', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h1')).toBeVisible();
});
```
