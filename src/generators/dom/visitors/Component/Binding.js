import deindent from '../../../../utils/deindent.js';
import flattenReference from '../../../../utils/flattenReference.js';
import getSetter, { getTailSnippet } from '../shared/binding/getSetter.js';

export default function visitBinding ( generator, block, state, node, attribute, local ) {
	const { name, keypath } = flattenReference( attribute.value );
	const { snippet, contexts, dependencies } = generator.contextualise( block, attribute.value );

	if ( dependencies.length > 1 ) throw new Error( 'An unexpected situation arose. Please raise an issue at https://github.com/sveltejs/svelte/issues — thanks!' );

	contexts.forEach( context => {
		if ( !~local.allUsedContexts.indexOf( context ) ) local.allUsedContexts.push( context );
	});

	const contextual = block.contexts.has( name );

	let obj;
	let prop;

	if ( contextual ) {
		obj = block.listNames.get( name );
		prop = block.indexNames.get( name );
	} else if ( attribute.value.type === 'MemberExpression' ) {
		prop = `'[✂${attribute.value.property.start}-${attribute.value.property.end}✂]'`;
		obj = `[✂${attribute.value.object.start}-${attribute.value.object.end}✂]`;
	} else {
		obj = 'root';
		prop = `'${name}'`;
	}

	local.bindings.push({
		name: attribute.name,
		value: snippet,
		obj,
		prop
	});

	const setter = getSetter({ generator, block, name, keypath, context: '_context', attribute, dependencies, value: 'value' });

	generator.hasComplexBindings = true;

	const updating = block.getUniqueName( `${local.name}_updating` );

	const initialValue = getInitialValue({ block, local, attribute, name });

	local.create.addBlock( deindent`
		var ${updating} = false;

		${block.component}._bindings.push( function () {
			if ( ${local.name}._torndown ) return;
			${local.name}.observe( '${attribute.name}', function ( value ) {
				if ( ${updating} ) return;
				${updating} = true;
				${setter}
				${updating} = false;
			}, { init: ${generator.helper( 'differs' )}( ${local.name}.get( '${attribute.name}' ), ${initialValue} ) });
		});
	` );

	local.update.addBlock( deindent`
		if ( !${updating} && ${dependencies.map( dependency => `'${dependency}' in changed` ).join( '||' )} ) {
			${updating} = true;
			${local.name}._set({ ${attribute.name}: ${snippet} });
			${updating} = false;
		}
	` );
}

function getInitialValue ({ block, local, attribute, name }) {
	const tail = attribute.value.type === 'MemberExpression' ? getTailSnippet( attribute.value ) : '';

	if ( block.contexts.has( name ) ) {
		// const prop = dependencies[0];

		const list = `${local.name}._context.${block.listNames.get( name )}`;
		const index = `${local.name}._context.${block.indexNames.get( name )}`;

		return `${list}[${index}]${tail}`;
	}

	return `${block.component}.get( '${name}' )${tail}`;
}