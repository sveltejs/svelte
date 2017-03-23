export default function checkForDupes ( validator, properties ) {
	const seen = new Set();

	properties.forEach( prop => {
		if ( seen.has( prop.key.name ) ) {
			validator.error( `Duplicate property '${prop.key.name}'`, prop.start );
		}

		seen.add( prop.key.name );
	});
}
