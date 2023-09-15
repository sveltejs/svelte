export default {
	async test({ assert, component, target, window }) {
		// set first
		await component.lists.update(() => [{ text: 'item1' }, { text: 'item2' }, { text: 'item3' }]);

		await component.lists.update(() => [{ text: 'item3' }, { text: 'item2' }, { text: 'item1' }]);

		await component.lists.update(() => [{ text: 'item1' }, { text: 'item2' }, { text: 'item3' }]);

		assert.equal(component.updated, 4);

		const [item1, item2] = target.childNodes;
		const [item1_btn1, item1_btn2] = item1.querySelectorAll('button');
		const [item2_btn1, item2_btn2] = item2.querySelectorAll('button');

		const click_event = new window.MouseEvent('click');

		await item1_btn1.dispatchEvent(click_event);
		assert.equal(component.getNormalCount(), 1);

		await item1_btn2.dispatchEvent(click_event);
		assert.equal(component.getModifierCount(), 1);

		await item2_btn1.dispatchEvent(click_event);
		assert.equal(component.getNormalCount(), 2);

		await item2_btn2.dispatchEvent(click_event);
		assert.equal(component.getModifierCount(), 2);
	}
};
