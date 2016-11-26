export default function checkForDupes ( validator, properties ) {
	const seen = Object.create( null );

	properties.forEach( prop => {
		if ( seen[ prop.key.name ] ) {
			validator.error( `Duplicate property '${prop.key.name}'`, prop.start );
		}

		seen[ prop.key.name ] = true;
	});
}
