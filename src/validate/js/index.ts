import propValidators from './propValidators/index';
import fuzzymatch from '../utils/fuzzymatch';
import checkForDupes from './utils/checkForDupes';
import checkForComputedKeys from './utils/checkForComputedKeys';
import namespaces from '../../utils/namespaces';
import { Validator } from '../';
import { Node } from '../../interfaces';

const validPropList = Object.keys( propValidators );

export default function validateJs ( validator: Validator, js: Node ) {
	js.content.body.forEach( ( node: Node ) => {
		// check there are no named exports
		if ( node.type === 'ExportNamedDeclaration' ) {
			validator.error( `A component can only have a default export`, node.start );
		}

		if ( node.type === 'ExportDefaultDeclaration' ) {
			if ( node.declaration.type !== 'ObjectExpression' ) {
				return validator.error( `Default export must be an object literal`, node.declaration.start );
			}

			checkForComputedKeys( validator, node.declaration.properties );
			checkForDupes( validator, node.declaration.properties );

			const props = validator.properties;

			node.declaration.properties.forEach( ( prop: Node ) => {
				props.set( prop.key.name, prop );
			});

			// Remove these checks in version 2
			if ( props.has( 'oncreate' ) && props.has( 'onrender' ) ) {
				validator.error( 'Cannot have both oncreate and onrender', props.get( 'onrender' ).start );
			}

			if ( props.has( 'ondestroy' ) && props.has( 'onteardown' ) ) {
				validator.error( 'Cannot have both ondestroy and onteardown', props.get( 'onteardown' ).start );
			}

			// ensure all exported props are valid
			node.declaration.properties.forEach( ( prop: Node ) => {
				const propValidator = propValidators[ prop.key.name ];

				if ( propValidator ) {
					propValidator( validator, prop );
				} else {
					const match = fuzzymatch( prop.key.name, validPropList );
					if ( match ) {
						validator.error( `Unexpected property '${prop.key.name}' (did you mean '${match}'?)`, prop.start );
					} else if ( /FunctionExpression/.test( prop.value.type ) ) {
						validator.error( `Unexpected property '${prop.key.name}' (did you mean to include it in 'methods'?)`, prop.start );
					} else {
						validator.error( `Unexpected property '${prop.key.name}'`, prop.start );
					}
				}
			});

			if ( props.has( 'namespace' ) ) {
				const ns = props.get( 'namespace' ).value.value;
				validator.namespace = namespaces[ ns ] || ns;
			}

			validator.defaultExport = node;
		}
	});

	[ 'components', 'methods', 'helpers', 'transitions' ].forEach( key => {
		if ( validator.properties.has( key ) ) {
			validator.properties.get( key ).value.properties.forEach( ( prop: Node ) => {
				validator[ key ].set( prop.key.name, prop.value );
			});
		}
	});
}
