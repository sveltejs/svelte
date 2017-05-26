import { Declaration, Options } from './getIntro';

export type Globals = (id: string) => any;

export default function getGlobals ( imports: Declaration[], options: Options ) {
	const { globals, onerror, onwarn } = options;
	const globalFn = getGlobalFn( globals );

	return imports.map( x => {
		let name = globalFn( x.source.value );

		if ( !name ) {
			if ( x.name.startsWith( '__import' ) ) {
				const error = new Error( `Could not determine name for imported module '${x.source.value}' – use options.globals` );
				if ( onerror ) {
					onerror( error );
				} else {
					throw error;
				}
			}

			else {
				const warning = {
					message: `No name was supplied for imported module '${x.source.value}'. Guessing '${x.name}', but you should use options.globals`
				};

				if ( onwarn ) {
					onwarn( warning );
				} else {
					console.warn( warning ); // eslint-disable-line no-console
				}
			}

			name = x.name;
		}

		return name;
	});
}

function getGlobalFn ( globals: any ): Globals {
	if ( typeof globals === 'function' ) return globals;
	if ( typeof globals === 'object' ) {
		return id => globals[ id ];
	}

	return () => undefined;
}
