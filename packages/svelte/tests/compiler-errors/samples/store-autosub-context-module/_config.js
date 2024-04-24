import { test } from '../../test';

export default test({
	error: {
		code: 'illegal_subscription',
		message: 'Cannot reference store value inside `<script context="module">`',
		position: [164, 168]
	}
});
