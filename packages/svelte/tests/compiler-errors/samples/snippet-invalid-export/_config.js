import { test } from '../../test';

export default test({
	error: {
		code: 'snippet_invalid_export',
		message:
			'An exported snippet can only reference things declared in a `<script module>`, or other exportable snippets',
		position: [26, 29]
	}
});
