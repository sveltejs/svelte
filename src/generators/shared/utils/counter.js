export default function counter ( used ) {
	const counts = {};

	used.forEach( name => counts[ name ] = 1 );

	return function ( name ) {
		if ( name in counts ) {
			return `${name}${counts[ name ]++}`;
		}

		counts[ name ] = 1;
		return name;
	};
}
