import { Store } from '../../../../store.js';

const store = new Store();

export default {
	store,

	test(assert, component, target) {
		store.compute('dep4', ['dep1', 'dep2', 'dep3'], (...args) => ['dep4'].concat(...args));
		store.compute('dep1', ['source'], (...args) => ['dep1'].concat(...args));
		store.compute('dep2', ['dep1'], (...args) => ['dep2'].concat(...args));
		store.compute('dep3', ['dep1', 'dep2'], (...args) => ['dep3'].concat(...args));
		store.set({source: 'source'});
		assert.equal(JSON.stringify(store.get().dep4), JSON.stringify([
			'dep4',
			'dep1', 'source',
			'dep2', 'dep1', 'source',
			'dep3', 'dep1', 'source',
			'dep2', 'dep1', 'source'
		]));
	}
};
