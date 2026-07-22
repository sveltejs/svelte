import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ target, assert }) {
		assert.htmlEqual(target.innerHTML, '<div data-received-wrong-prop="false">Comp1: prop1</div> <button>Swap Components</button>');

		// Click to swap components
		target.querySelector('button')?.click();
		flushSync();

		// After swap, should show Comp2 and Comp2 should NOT have received wrong props
		assert.htmlEqual(target.innerHTML, '<div data-received-wrong-prop="false">Comp2: prop2</div> <button>Swap Components</button>');

		// Click again to swap back
		target.querySelector('button')?.click();
		flushSync();

		// After second swap, should show Comp1 again and Comp1 should NOT have received wrong props
		assert.htmlEqual(target.innerHTML, '<div data-received-wrong-prop="false">Comp1: prop1</div> <button>Swap Components</button>');
	}
});


