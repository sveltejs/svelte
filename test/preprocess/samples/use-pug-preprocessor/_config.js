import * as pug from 'pug';

export default {
	cascade: false,
	markup: ({content}) => {
		return new Promise((fulfil, reject) => {
			try {
				const code = pug.render(content);
				fulfil({code});
			} catch (error) {
				reject(error);
			}
		});
	},
};
