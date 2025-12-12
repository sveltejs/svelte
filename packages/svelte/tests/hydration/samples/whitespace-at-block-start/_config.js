import { test } from '../../test';

export default test({
	errors: [
		'Failed to hydrate: ',
		new DOMException("Node can't be inserted in a #text parent.", 'HierarchyRequestError')
	]
});
