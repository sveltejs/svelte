export default function checkForAccessors ( validator, properties, label ) {
	properties.forEach( prop => {
		if ( prop.kind !== 'init' ) {
			validator.error( `${label} cannot use getters and setters`, prop.start );
		}
	});
}
