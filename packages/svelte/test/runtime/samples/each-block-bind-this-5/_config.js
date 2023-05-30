export default {
	html: `
    <p>0</p><p>1</p><p>2</p><p>3</p><p>4</p><p>5</p><p>6</p><p>7</p><p>8</p><p>9</p>
	`,

	async test({ assert, window, component, target }) {
		const pArray = target.querySelectorAll('p');
    for (let i = 0; i <= 9; i++) {
		  assert.equal(component.bindings[i], pArray[i]);
    }
	}
};
