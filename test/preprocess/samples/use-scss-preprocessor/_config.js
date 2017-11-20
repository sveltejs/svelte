import * as sass from 'node-sass';

export default {
	cascade: false,
	style: ({ content, attributes }) => {
		if (attributes.type !== 'text/scss') {
			return {code: content};
		}

		if (attributes['aria-hidden'] !== true) {
			throw new Error('aria-hidden is supposed to be true');
		}

		return new Promise((fulfil, reject) => {
			sass.render({
				data: content,
			}, (err, result) => {
				if (err) {
					reject(err);
				} else {
					fulfil({ code: result.css.toString(), map: result.map });
				}
			});
		});
	}
};
