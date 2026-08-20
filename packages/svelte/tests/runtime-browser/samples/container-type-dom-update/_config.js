import { test } from '../../assert';

export default test({
	async test({ assert, target, window }) {
		const input = /** @type {HTMLInputElement} */ (target.querySelector('input'));
		const thead = /** @type {HTMLTableSectionElement} */ (target.querySelector('thead'));
		const comments = /** @type {HTMLDivElement} */ (target.querySelector('[data-comments]'));
		const sibling = /** @type {HTMLDivElement} */ (target.querySelector('[data-sibling]'));
		let comments_replaced = 0;
		let sibling_replaced = 0;
		const preserved_comments = Array.from(comments.childNodes).filter(
			(node) => node.nodeType === 8
		);
		const replace_comments = comments.replaceChildren;
		const replace_sibling = sibling.replaceChildren;
		comments.replaceChildren = (...nodes) => {
			comments_replaced += 1;
			replace_comments.call(comments, ...nodes);
		};
		sibling.replaceChildren = (...nodes) => {
			sibling_replaced += 1;
			replace_sibling.call(sibling, ...nodes);
		};
		const wait = () =>
			new Promise((resolve) => {
				window.requestAnimationFrame(() => window.requestAnimationFrame(resolve));
			});

		assert.equal(thead.getBoundingClientRect().height > 0, true);
		input.click();
		await wait();
		assert.equal(comments_replaced, 1);
		assert.equal(comments.childNodes.length, preserved_comments.length);
		preserved_comments.forEach((node, i) => assert.equal(comments.childNodes[i], node));
		assert.equal(sibling_replaced, 0);
		assert.equal(sibling.querySelector('i')?.textContent, 'keep');
		assert.equal(sibling.querySelector('span'), null);
		input.click();
		await wait();
		assert.equal(thead.getBoundingClientRect().height > 0, true);
	}
});
