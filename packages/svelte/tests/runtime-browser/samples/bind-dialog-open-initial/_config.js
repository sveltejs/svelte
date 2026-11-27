import { test, ok } from '../../assert';

const tick = () => new Promise((r) => setTimeout(r, 50));

export default test({
	async test({ assert, target }) {
		await tick();
		const dialog = target.querySelector('dialog');
		const inside = /** @type {HTMLButtonElement} */ (target.querySelector('.inside'));
		const toggle = /** @type {HTMLButtonElement} */ (target.querySelector('.toggle'));
		const p = target.querySelector('p');
		ok(dialog);
		ok(p);

		// Same result as the `open` attribute from SSR, in both client and hydrate mode
		assert.equal(dialog.open, true);
		assert.equal(dialog.matches(':modal'), false);
		assert.equal(p.textContent, 'true 0', 'mounting open fires no toggle event');
		assert.ok(document.activeElement !== inside, 'mounting open does not move focus');

		toggle.click();
		await tick();
		assert.equal(dialog.open, false);
		assert.equal(p.textContent, 'false 1');

		toggle.click();
		await tick();
		assert.equal(dialog.open, true);
		assert.equal(p.textContent, 'true 2', 'later changes still go through show()');
		assert.equal(document.activeElement, inside, 'show() moves focus into the dialog');
	}
});
