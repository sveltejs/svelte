import * as stylus from 'stylus';

export default {
	cascade: false,
	style: ({content, attributes}) => {
		if (attributes.type !== 'text/stylus') {
			return {code: content};
		}

		return new Promise((fulfil, reject) => {
			stylus(content).render((err, result) => {
				if (err) {
					reject(err);
				} else {
					fulfil({code: result});
				}
			});
		});
	},
};
