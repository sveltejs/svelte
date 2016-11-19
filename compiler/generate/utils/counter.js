export default function counter () {
	const counts = {};

	return function ( label ) {
		if ( label in counts ) {
			return `label_${counts[ label ]++}`;
		}

		counts[ label ] = 0;
		return label;
	};
}
