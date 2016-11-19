export default function counter () {
	const counts = {};

	return function ( label ) {
		if ( label in counts ) {
			return `${label}${counts[ label ]++}`;
		}

		counts[ label ] = 1;
		return label;
	};
}
