import * as pug from 'pug';

export default {
	cascade: false,
	markup: ({content}) => {
		return {
			code: pug.render(content)
		};
	},
};
