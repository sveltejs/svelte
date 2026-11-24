import { test, ok } from '../../assert';

export default test({
	async test({ assert, target }) {
		const form = target.querySelector('form');
		const input = target.querySelector('input');
		const p = target.querySelector('p');
		ok(form);
		ok(input);
		ok(p);

		const list = new DataTransfer();
		list.items.add(new File(['content'], 'filename.jpg'));
		input.files = list.files;
		input.dispatchEvent(new Event('change'));
		await new Promise((r) => setTimeout(r, 100));
		assert.equal(p.textContent, 'filename.jpg');

		form.reset();
		await new Promise((r) => setTimeout(r, 100));
		assert.equal(input.files?.length, 0);
		assert.equal(p.textContent, 'empty');
	}
});
