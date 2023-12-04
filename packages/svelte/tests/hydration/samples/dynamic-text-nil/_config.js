import { test } from '../../test';

export default test({
	snapshot(target) {
		const null_text = target.querySelectorAll('p')[0].textContent;
		const undefined_text = target.querySelectorAll('p')[1].textContent;

		return {
			nullText: null_text,
			undefinedText: undefined_text
		};
	}
});
