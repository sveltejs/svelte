import { tick, unmount } from 'svelte';
import { test } from '../../assert';

/**
 * @typedef {{
 *   tracking: () => boolean;
 *   registry: any[];
 *   mount: (target: HTMLElement) => Record<string, any>;
 * }} HostOptions
 */

/** @param {typeof HTMLElement} Base */
function host(Base) {
	return class extends Base {
		static observedAttributes = ['title', 'data-value', 'class', 'style'];
		/** @type {boolean[]} */
		tracking = [];
		/** @type {HostOptions | undefined} */
		config;
		/** @type {Record<string, any> | undefined} */
		child;

		/** @param {HostOptions} value */
		set options(value) {
			this.config = value;
			this.tracking.push(value.tracking());
			value.registry.push(value);
			this.child ??= value.mount(this);
		}

		attributeChangedCallback() {
			if (this.config) {
				this.tracking.push(this.config.tracking());
				// Reading this state must not subscribe the spread to it.
				this.config.registry.length;
			}
		}

		disconnectedCallback() {
			if (this.child) unmount(this.child);
		}
	};
}

export default test({
	before_test() {
		customElements.define('spread-context', host(HTMLElement));
		customElements.define('spread-builtin', host(HTMLDivElement), { extends: 'div' });
	},
	async test({ assert, target }) {
		const hosts = /** @type {Array<HTMLElement & { tracking: boolean[] }>} */ ([
			...target.querySelectorAll('spread-context, [is="spread-builtin"]')
		]);
		const children = hosts.map((host) => host.querySelector('p'));
		const [title, classes, register, remove] = target.querySelectorAll('button');
		const count = target.lastElementChild;

		/** @param {number} expected */
		function check(expected) {
			assert.equal(count?.textContent, String(expected));
			for (const [i, host] of hosts.entries()) {
				assert.htmlEqual(host.innerHTML, '<p>child</p>');
				assert.equal(host.querySelector('p'), children[i]);
				assert.equal(host.dataset.destroyed, undefined);
				assert.equal(host.tracking.length > 0, true);
				assert.equal(
					host.tracking.every((tracking) => tracking === false),
					true
				);
			}
		}

		check(4);
		assert.equal(hosts[0].dataset.title, 'a');

		title.click();
		await tick();
		check(7);
		assert.equal(hosts[0].dataset.title, 'aa');
		assert.equal(hosts[0].hasAttribute('style'), false);
		assert.equal(hosts[0].hasAttribute('data-value'), false);

		classes.click();
		await tick();
		check(9);
		assert.equal(hosts[0].className, 'active');
		assert.equal(hosts[1].className, 'active');

		register.click();
		await tick();
		check(10);

		classes.click();
		await tick();
		check(12);
		assert.equal(hosts[0].hasAttribute('class'), false);
		assert.equal(hosts[1].hasAttribute('class'), false);
		assert.equal(hosts[0].dataset.attachmentCleanups, '1');

		// The spread attachment stays owned by the parent, while each child root
		// survives spread updates and is disposed by the host on disconnection.
		remove.click();
		await tick();
		assert.equal(target.querySelectorAll('spread-context, [is="spread-builtin"]').length, 0);
		assert.equal(hosts[0].dataset.title, undefined);
		assert.equal(hosts[0].dataset.attachmentCleanups, '2');
		for (const host of hosts) {
			assert.equal(host.dataset.destroyed, 'true');
		}
	}
});
