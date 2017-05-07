import oncreate from './oncreate.ts';

export default function onrender ( validator, prop ) {
	validator.warn( `'onrender' has been deprecated in favour of 'oncreate', and will cause an error in Svelte 2.x`, prop.start );
	oncreate( validator, prop );
}
