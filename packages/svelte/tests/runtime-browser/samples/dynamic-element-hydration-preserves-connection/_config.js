import { flushSync } from 'svelte';
import { assert_ok, test } from '../../assert';

/** @type {Record<string, number>} */
const connections = {};
/** @type {string[]} */
const disconnections = [];
/** @type {Element[]} */
let claimed;
/** @type {MutationObserver} */
let observer;

export default test({
	before_test() {
		const target = document.querySelector('main');
		assert_ok(target);
		claimed = Array.from(target.children);
		customElements.define(
			'connection-probe',
			class extends HTMLElement {
				connectedCallback() {
					connections[this.id] = (connections[this.id] || 0) + 1;
				}
				disconnectedCallback() {
					disconnections.push(this.id);
				}
			}
		);
		observer = new MutationObserver(() => {});
		observer.observe(target, { childList: true });
	},

	test({ assert, component, target }) {
		const removed = observer.takeRecords().flatMap((record) => Array.from(record.removedNodes));
		observer.disconnect();
		assert.deepEqual(
			removed
				.filter((node) => node instanceof Element)
				.filter((node) => claimed.includes(node))
				.map((node) => node.id),
			[]
		);
		assert.deepEqual(connections, { child: 1, custom: 1 });
		assert.deepEqual(disconnections, []);

		flushSync(() => {
			component.tag = 'section';
			component.empty_tag = 'span';
			component.void_tag = 'hr';
			component.custom_tag = 'aside';
		});
		assert.equal(target.querySelector('#parent')?.tagName, 'SECTION');
		assert.equal(target.querySelector('#empty')?.tagName, 'SPAN');
		assert.equal(target.querySelector('#void')?.tagName, 'HR');
		assert.equal(target.querySelector('#custom')?.tagName, 'ASIDE');
		assert.deepEqual(connections, { child: 2, custom: 1 });
		assert.deepEqual(disconnections, ['child', 'custom']);

		flushSync(() => {
			component.tag = null;
		});
		assert.equal(target.querySelector('#parent'), null);
		assert.deepEqual(disconnections, ['child', 'custom', 'child']);

		flushSync(() => {
			component.tag = 'div';
		});
		assert.equal(target.querySelector('#parent')?.tagName, 'DIV');
		assert.deepEqual(connections, { child: 3, custom: 1 });
	}
});
