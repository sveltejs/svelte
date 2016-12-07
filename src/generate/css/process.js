import spaces from '../../utils/spaces.js';
import transform from './transform.js';

export default function process ( parsed ) {
	return transform( spaces( parsed.css.content.start ) + parsed.css.content.styles, parsed.hash );
}
