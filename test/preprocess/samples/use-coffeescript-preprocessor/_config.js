import * as CoffeeScript from 'coffeescript';

export default {
	cascade: false,
	script: ({content, attributes}) => {
		if (attributes.type !== 'text/coffeescript') {
			return null;
		}

		return {
			code: CoffeeScript.compile(content, {})
		};
	},
};
