import { test } from '../../test';

export default test({
	error: {
		code: 'element_unclosed',
		message: '`<script>` was left open',
		position: [32, 32]
	}
});
