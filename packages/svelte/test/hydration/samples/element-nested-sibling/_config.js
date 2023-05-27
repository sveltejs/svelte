export default {
	snapshot(target) {
		const p = target.querySelector('p');

		return {
			p,
			span: p.querySelector('span'),
			code: p.querySelector('code')
		};
	}
};
