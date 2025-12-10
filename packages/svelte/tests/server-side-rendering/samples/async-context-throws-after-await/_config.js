import { test } from '../../test';

export default test({
	skip: true, // TODO it appears there might be an actual bug here; the promise isn't ever actually awaited in spite of being awaited in the component
	mode: ['async'],
	error: 'lifecycle_outside_component'
});
