import { test, ok } from '../../assert';

const tick = () => new Promise((r) => setTimeout(r, 50));

export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const dialog = target.querySelector('dialog');
		const toggle = /** @type {HTMLButtonElement} */ (target.querySelector('.toggle'));
		const submit = /** @type {HTMLButtonElement} */ (target.querySelector('.submit'));
		const p = target.querySelector('p');
		ok(dialog);
		ok(p);

		assert.equal(dialog.open, false);
		assert.equal(p.textContent, 'false 0');

		toggle.click();
		await tick();
		assert.equal(dialog.open, true, 'opened by binding');
		assert.equal(dialog.matches(':modal'), false, 'binding opens a non-modal dialog');

		toggle.click();
		await tick();
		assert.equal(dialog.open, false, 'closed by binding');
		assert.equal(p.textContent, 'false 1', 'closing via binding fires close');

		toggle.click();
		await tick();
		submit.click();
		await tick();
		assert.equal(dialog.open, false);
		assert.equal(p.textContent, 'false 2', 'form method=dialog updates binding');

		dialog.showModal();
		await tick();
		assert.equal(p.textContent, 'true 2', 'showModal updates binding');

		dialog.close();
		await tick();
		assert.equal(p.textContent, 'false 3', 'close() updates binding');
	}
});
