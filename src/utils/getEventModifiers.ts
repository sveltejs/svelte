import EventHandler from '../compile/nodes/EventHandler';
import deindent from '../utils/deindent';

export default function getEventModifiers(handlerName: String) {
	// Ignore first element because it's the event name, i.e. click
	let modifiers = handlerName.split('|').slice(1);

	let eventModifiers = modifiers.reduce((acc, m) => {
		if (m === 'stopPropagation')
			acc.bodyModifiers += 'event.stopPropagation();\n';
		else if (m === 'preventDefault')
			acc.bodyModifiers += 'event.preventDefault();\n';
		else if (m === 'capture')
			acc.optionModifiers[m] = true;
		else if (m === 'once')
			acc.optionModifiers[m] = true;
		else if (m === 'passive')
			acc.optionModifiers[m] = true;
		
		return acc;
	}, {
		bodyModifiers: '',
		optionModifiers: {
			capture: false,
			once: false,
			passive: false,
		}
	});
	
	if (eventModifiers.bodyModifiers !== '')
		eventModifiers.bodyModifiers = deindent`
			${eventModifiers.bodyModifiers}
		`;

	return eventModifiers;
}