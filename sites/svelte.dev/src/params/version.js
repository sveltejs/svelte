import versions from '$lib/docs/versions.js';

/**
 * @type {import('@sveltejs/kit').ParamMatcher}
 */
export const match = (param) => versions.find((v) => v.version === param) != null;
