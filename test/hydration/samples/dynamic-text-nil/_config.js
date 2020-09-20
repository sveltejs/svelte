export default {
	props: {},

	snapshot(target) {
		const nullText = target.querySelectorAll('p')[0].textContent;
		const undefinedText = target.querySelectorAll('p')[1].textContent;

		return {
			nullText,
			undefinedText,
		};
	},

	test(assert, target, snapshot) {
		const nullText = target.querySelectorAll('p')[0].textContent;
		const undefinedText = target.querySelectorAll('p')[1].textContent;

		assert.equal(nullText, snapshot.nullText);
		assert.equal(undefinedText, snapshot.undefinedText);
	},
};
