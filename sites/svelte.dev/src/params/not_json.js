/** @type {import('@sveltejs/kit').ParamMatcher} */
export function match(param) {
	return !/\.json$$/.test(param);
}
