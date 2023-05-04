export default {
	props: {},

	snapshot(target) {
		const nullText = target.querySelectorAll('p')[0].textContent;
		const undefinedText = target.querySelectorAll('p')[1].textContent;

		return {
			nullText,
			undefinedText
		};
	}
};
