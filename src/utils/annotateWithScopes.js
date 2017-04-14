import { walk } from 'estree-walker';

export default function annotateWithScopes ( expression ) {
	let scope = new Scope( null, false );

	walk( expression, {
		enter ( node ) {
			if ( /Function/.test( node.type ) ) {
				if ( node.type === 'FunctionDeclaration' ) {
					scope.declarations.add( node.id.name );
				} else {
					node._scope = scope = new Scope( scope, false );
					if ( node.id ) scope.declarations.add( node.id.name );
				}

				node.params.forEach( param => {
					extractNames( param ).forEach( name => {
						scope.declarations.add( name );
					});
				});
			}

			else if ( /For(?:In|Of)Statement/.test( node.type ) ) {
				node._scope = scope = new Scope( scope, true );
			}

			else if ( node.type === 'BlockStatement' ) {
				node._scope = scope = new Scope( scope, true );
			}

			else if ( /(Function|Class|Variable)Declaration/.test( node.type ) ) {
				scope.addDeclaration( node );
			}
		},

		leave ( node ) {
			if ( node._scope ) {
				scope = scope.parent;
			}
		}
	});

	return scope;
}

class Scope {
	constructor ( parent, block ) {
		this.parent = parent;
		this.block = block;
		this.declarations = new Set();
	}

	addDeclaration ( node ) {
		if ( node.kind === 'var' && !this.block && this.parent ) {
			this.parent.addDeclaration( node );
		} else if ( node.type === 'VariableDeclaration' ) {
			node.declarations.forEach( declarator => {
				extractNames( declarator.id ).forEach( name => {
					this.declarations.add( name );
				});
			});
		} else {
			this.declarations.add( node.id.name );
		}
	}

	has ( name ) {
		return this.declarations.has( name ) || this.parent && this.parent.has( name );
	}
}

function extractNames ( param ) {
	const names = [];
	extractors[ param.type ]( names, param );
	return names;
}

const extractors = {
	Identifier ( names, param ) {
		names.push( param.name );
	},

	ObjectPattern ( names, param ) {
		param.properties.forEach( prop => {
			extractors[ prop.value.type ]( names, prop.value );
		});
	},

	ArrayPattern ( names, param ) {
		param.elements.forEach( element => {
			if ( element ) extractors[ element.type ]( names, element );
		});
	},

	RestElement ( names, param ) {
		extractors[ param.argument.type ]( names, param.argument );
	},

	AssignmentPattern ( names, param ) {
		extractors[ param.left.type ]( names, param.left );
	}
};
