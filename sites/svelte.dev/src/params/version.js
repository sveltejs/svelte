/**
 * @type {import('@sveltejs/kit').ParamMatcher}
 */
export const match = (param) => param.startsWith('v-');
