import propValidators from './propValidators/index.js';
import FuzzySet from './utils/FuzzySet.js';
import checkForDupes from './utils/checkForDupes.js';
import checkForComputedKeys from './utils/checkForComputedKeys.js';
import namespaces from '../../utils/namespaces.js';

const validPropList = Object.keys( propValidators );

const fuzzySet = new FuzzySet( validPropList );

export default function validateJs ( validator, js ) {
	js.content.body.forEach( node => {
		// check there are no named exports
		if ( node.type === 'ExportNamedDeclaration' ) {
			validator.error( `A component can only have a default export`, node.start );
		}

		if ( node.type === 'ExportDefaultDeclaration' ) {
			if ( validator.defaultExport ) {
				return validator.error( `Duplicate default export`, node.start );
			}

			if ( node.declaration.type !== 'ObjectExpression' ) {
				return validator.error( `Default export must be an object literal`, node.declaration.start );
			}

			checkForComputedKeys( validator, node.declaration.properties );
			checkForDupes( validator, node.declaration.properties );

			node.declaration.properties.forEach( prop => {
				validator.templateProperties[ prop.key.name ] = prop;
			});

			// ensure all exported props are valid
			node.declaration.properties.forEach( prop => {
				const propValidator = propValidators[ prop.key.name ];

				if ( propValidator ) {
					propValidator( validator, prop );
				} else {
					const matches = fuzzySet.get( prop.key.name );
					if ( matches && matches[0] && matches[0][0] > 0.7 ) {
						validator.error( `Unexpected property '${prop.key.name}' (did you mean '${matches[0][1]}'?)`, prop.start );
					} else if ( /FunctionExpression/.test( prop.value.type ) ) {
						validator.error( `Unexpected property '${prop.key.name}' (did you mean to include it in 'methods'?)`, prop.start );
					} else {
						validator.error( `Unexpected property '${prop.key.name}'`, prop.start );
					}
				}
			});

			if ( validator.templateProperties.namespace ) {
				const ns = validator.templateProperties.namespace.value.value;
				validator.namespace = namespaces[ ns ] || ns;
			}

			validator.defaultExport = node;
		}
	});
}
