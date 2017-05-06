import validateEventHandler from './validateEventHandler.js';

export default function validateElement ( validator, node ) {
	const isComponent = node.name === ':Self' || validator.components.has( node.name );

	let hasIntro;
	let hasOutro;
	let hasTransition;

	node.attributes.forEach( attribute => {
		if ( !isComponent && attribute.type === 'Binding' ) {
			const { name } = attribute;

			if ( name === 'value' ) {
				if ( node.name !== 'input' && node.name !== 'textarea' && node.name !== 'select' ) {
					validator.error( `'value' is not a valid binding on <${node.name}> elements`, attribute.start );
				}
			}

			else if ( name === 'checked' ) {
				if ( node.name !== 'input' ) {
					validator.error( `'checked' is not a valid binding on <${node.name}> elements`, attribute.start );
				}

				if ( getType( validator, node ) !== 'checkbox' ) {
					validator.error( `'checked' binding can only be used with <input type="checkbox">`, attribute.start );
				}
			}

			else if ( name === 'group' ) {
				if ( node.name !== 'input' ) {
					validator.error( `'group' is not a valid binding on <${node.name}> elements`, attribute.start );
				}

				const type = getType( validator, node );

				if ( type !== 'checkbox' && type !== 'radio' ) {
					validator.error( `'checked' binding can only be used with <input type="checkbox"> or <input type="radio">` );
				}
			}

			else if ( name === 'currentTime' || name === 'duration' || name === 'paused' ) {
				if ( node.name !== 'audio' && node.name !== 'video' ) {
					validator.error( `'${name}' binding can only be used with <audio> or <video>` );
				}
			}

			else {
				validator.error( `'${attribute.name}' is not a valid binding`, attribute.start );
			}
		}

		else if ( attribute.type === 'EventHandler' ) {
			validateEventHandler( validator, attribute );
		}

		else if ( attribute.type === 'Transition' ) {
			const bidi = attribute.intro && attribute.outro;

			if ( hasTransition ) {
				if ( bidi ) validator.error( `An element can only have one 'transition' directive`, attribute.start );
				validator.error( `An element cannot have both a 'transition' directive and an '${attribute.intro ? 'in' : 'out'}' directive`, attribute.start );
			}

			if ( ( hasIntro && attribute.intro ) || ( hasOutro && attribute.outro ) ) {
				if ( bidi ) validator.error( `An element cannot have both an '${hasIntro ? 'in' : 'out'}' directive and a 'transition' directive`, attribute.start );
				validator.error( `An element can only have one '${hasIntro ? 'in' : 'out'}' directive`, attribute.start );
			}

			if ( attribute.intro ) hasIntro = true;
			if ( attribute.outro ) hasOutro = true;
			if ( bidi ) hasTransition = true;

			if ( !validator.transitions.has( attribute.name ) ) {
				validator.error( `Missing transition '${attribute.name}'`, attribute.start );
			}
		}
	});
}

function getType ( validator, node ) {
	const attribute = node.attributes.find( attribute => attribute.name === 'type' );
	if ( !attribute ) return null;

	if ( attribute.value === true ) {
		validator.error( `'type' attribute must be specified`, attribute.start );
	}

	if ( attribute.value.length > 1 || attribute.value[0].type !== 'Text' ) {
		validator.error( `'type attribute cannot be dynamic`, attribute.start );
	}

	return attribute.value[0].data;
}
