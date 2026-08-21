import { test } from '../../test';

export default test({
	mode: ['async-server', 'server'],
	html: '<p>postfix: 0, postfix_minus: 1, prefix: 1, prefix_minus: 0, count: 0</p><p>postfix_n: 0, postfix_minus_n: 1, prefix_n: 1, prefix_minus_n: 0, count_n: 0</p>'
});
