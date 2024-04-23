import { test } from '../../test';

export default test({
	error: {
		code: 'unclosed_element',
		message: '`<script>` was left open',
		position: [32, 32]
	}
});
