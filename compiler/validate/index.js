import validateJs from './js/index.js';
import { getLocator } from 'locate-character';

export default function validate ( parsed, source ) {
	const locator = getLocator( source );

	const validator = {
		error: ( message, pos ) => {
			const { line, column } = locator( pos );

			validator.errors.push({
				message,
				pos,
				loc: { line: line + 1, column }
			});
		},

		warn: ( message, pos ) => {
			const { line, column } = locator( pos );

			validator.warnings.push({
				message,
				pos,
				loc: { line: line + 1, column }
			});
		},

		templateProperties: {},

		errors: [],
		warnings: []
	};

	if ( parsed.js ) {
		validateJs( validator, parsed.js, source );
	}

	return {
		errors: validator.errors,
		warnings: validator.warnings
	};
}
