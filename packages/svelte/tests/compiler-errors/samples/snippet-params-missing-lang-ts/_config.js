import { test } from '../../test';

export default test({
	error: {
		code: 'js_parse_error',
		message: `Unexpected token in snippet parameters. Did you forget to add lang="ts" to the <script> tag?`,
		position: [18, 18]
	}
});
