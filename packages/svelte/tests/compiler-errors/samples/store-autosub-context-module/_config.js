import { test } from '../../test';

export default test({
	error: {
		code: 'store_invalid_subscription',
		message: 'Cannot reference store value inside `<script context="module">`',
		position: [164, 168]
	}
});
