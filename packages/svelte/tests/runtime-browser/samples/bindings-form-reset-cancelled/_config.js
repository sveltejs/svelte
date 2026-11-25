import { test } from '../../assert';

export default test({
	mode: ['client', 'hydrate'],
	async test_browser({ assert, page }) {
		const checkbox = page.locator('input[type="checkbox"]');
		const text = page.locator('input:not([type])');
		const select = page.locator('select');
		const state = page.locator('p');

		async function edit() {
			await checkbox.check();
			await text.fill('hi');
			await select.selectOption('b');
		}

		async function assert_unchanged() {
			// Let any deferred reset callback run before asserting that nothing changed.
			await page.evaluate(() => new Promise((resolve) => setTimeout(resolve)));
			assert.equal(await state.textContent(), 'checked: true, text: "hi", selected: b');
			assert.equal(await checkbox.isChecked(), true);
			assert.equal(await text.inputValue(), 'hi');
			assert.equal(await select.inputValue(), 'b');
		}

		await edit();
		await assert_unchanged();

		// Scripted dispatch does not have microtask checkpoints between listeners.
		await page.evaluate(() => document.querySelector('form')?.reset());
		await assert_unchanged();

		for (const selector of ['button[type="reset"]', 'input[type="reset"]']) {
			// This must be real user input, not button.click() inside page.evaluate.
			await page.locator(selector).click();
			await assert_unchanged();
		}

		await page.getByText('Allow reset').click();
		for (const selector of ['button[type="reset"]', 'input[type="reset"]']) {
			await page.locator(selector).click();
			await page.waitForFunction(
				() => document.querySelector('p')?.textContent === 'checked: false, text: "", selected: a'
			);
			assert.equal(await checkbox.isChecked(), false);
			assert.equal(await text.inputValue(), '');
			assert.equal(await select.inputValue(), 'a');
			await edit();
		}
	}
});
