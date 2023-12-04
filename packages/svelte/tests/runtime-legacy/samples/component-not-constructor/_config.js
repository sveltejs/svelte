import { test } from '../../test';

export default test({
	skip_if_ssr: 'permanent',
	skip_if_hydrate: 'permanent',
	get props() {
		return { selected: false };
	},
	error: '$$component is not a function'
});
