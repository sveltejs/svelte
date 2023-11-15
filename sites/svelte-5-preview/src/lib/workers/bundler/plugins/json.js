/** @type {import('@rollup/browser').Plugin} */
export default {
	name: 'json',
	transform: (code, id) => {
		if (!id.endsWith('.json')) return;

		return {
			code: `export default ${code};`,
			map: null
		};
	}
};
