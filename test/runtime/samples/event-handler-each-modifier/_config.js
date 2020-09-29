export default {
	async test({ assert, component, target, window }) {
		// set first
		await component.lists.update(() => [
			{ text: "item1" },
			{ text: "item2" },
			{ text: "item3" }
		]);

		await component.lists.update(() => [
			{ text: "item3" },
			{ text: "item2" },
			{ text: "item1" }
		]);

		await component.lists.update(() => [
			{ text: "item1" },
			{ text: "item2" },
			{ text: "item3" }
		]);

		assert.equal(component.updated, 4);

		const [item1, item2] = target.childNodes;
		const [item1Btn1, item1Btn2] = item1.querySelectorAll('button');
		const [item2Btn1, item2Btn2] = item2.querySelectorAll('button');

		const clickEvent = new window.MouseEvent('click');
		
		await item1Btn1.dispatchEvent(clickEvent);
		assert.equal(component.getNormalCount(), 1);
		
		await item1Btn2.dispatchEvent(clickEvent);
		assert.equal(component.getModifierCount(), 1);

		await item2Btn1.dispatchEvent(clickEvent);
		assert.equal(component.getNormalCount(), 2);
		
		await item2Btn2.dispatchEvent(clickEvent);
		assert.equal(component.getModifierCount(), 2);
	}
};
