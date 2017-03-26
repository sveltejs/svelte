import deindent from '../../../../utils/deindent.js';
import flattenReference from '../../../../utils/flattenReference.js';
import getSetter from './binding/getSetter.js';

export default function createBinding ( generator, node, attribute, current, local ) {
	const { name } = flattenReference( attribute.value );
	const { snippet, contexts, dependencies } = generator.contextualise( attribute.value );

	if ( dependencies.length > 1 ) throw new Error( 'An unexpected situation arose. Please raise an issue at https://github.com/sveltejs/svelte/issues — thanks!' );

	contexts.forEach( context => {
		if ( !~local.allUsedContexts.indexOf( context ) ) local.allUsedContexts.push( context );
	});

	const contextual = current.contexts.has( name );

	let obj;
	let prop;

	if ( contextual ) {
		obj = current.listNames.get( name );
		prop = current.indexNames.get( name );
	} else if ( attribute.value.type === 'MemberExpression' ) {
		prop = `'[✂${attribute.value.property.start}-${attribute.value.property.end}✂]}'`;
		obj = `root.[✂${attribute.value.object.start}-${attribute.value.object.end}✂]}`;
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

	const setter = getSetter({ current, name, context: '_context', attribute, dependencies, snippet, value: 'value' });

	generator.hasComplexBindings = true;

	local.init.addBlock( deindent`
		var ${local.name}_updating = false;

		component._bindings.push( function () {
			if ( ${local.name}._torndown ) return;
			${local.name}.observe( '${attribute.name}', function ( value ) {
				if ( ${local.name}_updating ) return;
				${local.name}_updating = true;
				${setter}
				${local.name}_updating = false;
			});
		});
	` );

	local.update.addBlock( deindent`
		if ( !${local.name}_updating && ${dependencies.map( dependency => `'${dependency}' in changed` ).join( '||' )} ) {
			${local.name}_updating = true;
			${local.name}._set({ ${attribute.name}: ${snippet} });
			${local.name}_updating = false;
		}
	` );
}
