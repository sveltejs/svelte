import deindent from '../../utils/deindent.js';
import spaces from '../../utils/spaces.js';
import transform from './transform.js';

export default function process ( parsed ) {
	const scoped = transform( spaces( parsed.css.content.start ) + parsed.css.content.styles, parsed.hash );

	return deindent`
		let addedCss = false;
		function addCss () {
			var style = document.createElement( 'style' );
			style.textContent = ${JSON.stringify( scoped )};
			document.head.appendChild( style );

			addedCss = true;
		}
	`;
}
