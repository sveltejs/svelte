import { test } from '../../test';

export default test({
	error: {
		code: 'js_parse_error',
		message: 'Unexpected token\nDid you forget to add `lang="ts"` to your `<script>` tag?'
	}
});
