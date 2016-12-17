import transform from './transform.js';

export default function process ( parsed ) {
	return transform( parsed.css.content.styles, parsed.hash );
}
