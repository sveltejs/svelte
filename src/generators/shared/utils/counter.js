export default function counter ( used ) {
	const counts = new Map();

	used.forEach( name => counts.set( name, 1 ) );

	return function ( name ) {
		if ( counts.has( name ) ) {
			const count = counts.get( name );
			const newName = `${name}${count}`;
			counts.set( name, count + 1 );
			return newName;
		}

		counts.set( name, 1 );
		return name;
	};
}
