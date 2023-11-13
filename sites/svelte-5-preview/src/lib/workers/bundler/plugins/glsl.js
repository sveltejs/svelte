/** @type {import('@rollup/browser').Plugin} */
export default {
	name: 'glsl',
	transform: (code, id) => {
		if (!id.endsWith('.glsl')) return;

		return {
			code: `export default ${JSON.stringify(code)};`,
			map: null
		};
	}
};
