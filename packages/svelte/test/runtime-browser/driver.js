// @ts-expect-error
import SvelteComponent from '__MAIN_DOT_SVELTE__';
// @ts-expect-error
import config from '__CONFIG__';
// @ts-expect-error
import * as assert from 'assert.js';

export default async function (target) {
	let unhandled_rejection = false;
	function unhandled_rejection_handler(event) {
		unhandled_rejection = event.reason;
	}
	window.addEventListener('unhandledrejection', unhandled_rejection_handler);

	try {
		if (config.before_test) config.before_test();

		const options = Object.assign(
			{},
			{
				target,
				// @ts-expect-error
				// eslint-disable-next-line no-undef
				hydrate: __HYDRATE__,
				props: config.props,
				intro: config.intro
			},
			config.options || {}
		);

		const component = new SvelteComponent(options);

		const wait_until = async (fn, ms = 500) => {
			const start = new Date().getTime();
			do {
				if (fn()) return;
				await new Promise((resolve) => window.setTimeout(resolve, 1));
			} while (new Date().getTime() <= start + ms);
		};

		if (config.html) {
			assert.htmlEqual(target.innerHTML, config.html);
		}

		if (config.test) {
			await config.test({
				assert,
				component,
				target,
				window,
				waitUntil: wait_until
			});

			component.$destroy();

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
			assert.equal(error.message, config.error);
		} else {
			throw error;
		}
	} finally {
		window.removeEventListener('unhandledrejection', unhandled_rejection_handler);
	}
}
