import * as stylus from 'stylus';
import * as path from 'path';

export default {
	preprocessor: (styles) =>
		stylus(styles).include(path.resolve(__dirname)).render(),
	cascade: false,
	style: ({content, attributes}) => {
		if (attributes.type !== 'text/stylus') {
			return {code: content};
		}

		return new Promise((fulfil, reject) => {
			stylus(content).include(path.resolve(__dirname)).
				render((err, result) => {
					if (err) {
						reject(err);
					} else {
						fulfil({code: result});
					}
				});
		});
	},
};
