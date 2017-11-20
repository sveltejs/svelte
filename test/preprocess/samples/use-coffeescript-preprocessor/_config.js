import * as CoffeeScript from 'coffeescript';

export default {
	cascade: false,
	script: ({content, attributes}) => {
		if (attributes.type !== 'text/coffeescript') {
			return {code: content};
		}

		return new Promise((fulfil, reject) => {
			try {
				const code = CoffeeScript.compile(content, {});
				fulfil({code});
			} catch (error) {
				reject(error);
			}
		});
	},
};
