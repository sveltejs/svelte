/**
 * @type {import('@sveltejs/kit').ParamMatcher}
 */
export const match = (param) => /^v\d/.exec(param) != null;
