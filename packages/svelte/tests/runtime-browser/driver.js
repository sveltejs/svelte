// @ts-expect-error
import SvelteComponent from '__MAIN_DOT_SVELTE__';
// @ts-expect-error
import config from '__CONFIG__';
// @ts-expect-error
import * as assert from 'assert.js';
import { createClassComponent } from 'svelte/legacy';
import { flushSync } from 'svelte';

/** @param {HTMLElement} target */
export default async function (target) {
	let unhandled_rejection = false;
	/** @param {any} event */
	function unhandled_rejection_handler(event) {
		unhandled_rejection = event.reason;
	}
	window.addEventListener('unhandledrejection', unhandled_rejection_handler);

	try {
		if (config.before_test) config.before_test();

		const options = Object.assign(
			{},
			{
				component: SvelteComponent,
				target,
				props: config.props,
				intro: config.intro,
				hydrate: __HYDRATE__,
				recover: false
			},
			config.options || {}
		);

		const component = __CE_TEST__ ? null : createClassComponent(options);

		/**
		 * @param {() => boolean} fn
		 * @param {number} ms
		 */
		const wait_until = async (fn, ms = 500) => {
			const start = new Date().getTime();
			do {
				if (fn()) return;
				await new Promise((resolve) => window.setTimeout(resolve, 1));
			} while (new Date().getTime() <= start + ms);
		};

		flushSync();

		if (config.html) {
			assert.htmlEqual(target.innerHTML, config.html);
		}

		if (config.test) {
			await config.test({
				assert,
				get component() {
					if (!component) {
						throw new Error('test property `component` is not available in custom element tests');
					}
					return component;
				},
				componentCtor: SvelteComponent,
				target,
				window,
				waitUntil: wait_until
			});

			component?.$destroy();

			if (unhandled_rejection) {
				throw unhandled_rejection;
			}
		} else {
			component.$destroy();
			assert.htmlEqual(target.innerHTML, '');

			if (unhandled_rejection) {
				throw unhandled_rejection;
			}
		}

		if (config.after_test) config.after_test();
	} catch (error) {
		if (config.error) {
			assert.equal(/** @type {Error} */ (error).message, config.error);
		} else {
			throw error;
		}
	} finally {
		window.removeEventListener('unhandledrejection', unhandled_rejection_handler);
	}
}
