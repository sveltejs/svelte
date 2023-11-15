import { test } from '../../test';

export default test({
	error: {
		code: 'illegal-subscription',
		message: 'Cannot reference store value inside <script context="module">'
	}
});
