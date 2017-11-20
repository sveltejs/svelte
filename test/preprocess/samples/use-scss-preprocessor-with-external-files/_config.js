import * as sass from 'node-sass';
import * as path from 'path';

export default {
	cascade: false,
	style: ({ content, attributes }) => {
		if (attributes.type !== 'text/scss') {
			return {code: content};
		}

		return new Promise((fulfil, reject) => {
			sass.render({
				data: content,
				includePaths: [
					path.resolve(__dirname)
				]
			}, (err, result) => {
				if (err) {
					reject(err);
				}	else {
					fulfil({ code: result.css.toString(), map: result.map });
				}
			});
		});
	}
};
