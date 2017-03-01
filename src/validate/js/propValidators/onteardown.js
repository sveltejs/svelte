import ondestroy from './ondestroy.js';

export default function onteardown ( validator, prop ) {
	validator.warn( `'onteardown' has been deprecated in favour of 'ondestroy', and will cause an error in Svelte 2.x`, prop.start );
	ondestroy( validator, prop );
}
