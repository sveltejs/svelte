import validateJs from './js/index.js';
import { getLocator } from 'locate-character';
import getCodeFrame from '../utils/getCodeFrame.js';

export default function validate ( parsed, source, options ) {
	const locator = getLocator( source );

	const validator = {
		error: ( message, pos ) => {
			const { line, column } = locator( pos );

			const error = new Error( message );
			error.frame = getCodeFrame( source, line, column );
			error.loc = { line: line + 1, column };
			error.pos = pos;

			error.toString = () => `${error.message} (${error.loc.line}:${error.loc.column})\n${error.frame}`;

			if ( options.onerror ) {
				options.onerror( error );
			} else {
				throw error;
			}
		},

		warn: ( message, pos ) => {
			const { line, column } = locator( pos );

			const frame = getCodeFrame( source, line, column );

			options.onwarn({
				message,
				frame,
				loc: { line: line + 1, column },
				pos,
				toString: () => `${message} (${line + 1}:${column})\n${frame}`
			});
		},

		templateProperties: {},

		errors: [],
		warnings: []
	};

	if ( parsed.js ) {
		validateJs( validator, parsed.js );
	}

	return {
		errors: validator.errors,
		warnings: validator.warnings
	};
}
