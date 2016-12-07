export default function checkForComputedKeys ( validator, properties ) {
	properties.forEach( prop => {
		if ( prop.key.computed ) {
			validator.error( `Cannot use computed keys`, prop.start );
		}
	});
}
