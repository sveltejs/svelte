export default {
	async test({ assert, component, target, window }) {
		const button = target.querySelector('button');
		const event = new window.MouseEvent('click');

		await button.dispatchEvent(event);
		assert.deepEqual(component.logs, ['click_1', 'click_2']);
		
		component.click_2 = () => component.logs.push('22');
		await button.dispatchEvent(event);
		assert.deepEqual(component.logs, ['click_1', 'click_2', 'click_1', '22']);
		
		component.click_1 = () => component.logs.push('11');
		await button.dispatchEvent(event);
		assert.deepEqual(component.logs, ['click_1', 'click_2', 'click_1', '22', '11', '22']);
	}
};
