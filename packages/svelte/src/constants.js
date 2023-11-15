export const EACH_ITEM_REACTIVE = 1;
export const EACH_INDEX_REACTIVE = 1 << 1;
export const EACH_KEYED = 1 << 2;
export const EACH_IS_CONTROLLED = 1 << 3;
export const EACH_IS_ANIMATED = 1 << 4;

/** List of Element events that will be delegated */
export const DelegatedEvents = [
	'beforeinput',
	'click',
	'dblclick',
	'contextmenu',
	'focusin',
	'focusout',
	// 'input', This conflicts with bind:input
	'keydown',
	'keyup',
	'mousedown',
	'mousemove',
	'mouseout',
	'mouseover',
	'mouseup',
	'pointerdown',
	'pointermove',
	'pointerout',
	'pointerover',
	'pointerup',
	'touchend',
	'touchmove',
	'touchstart'
];

/** List of Element events that will be delegated and are passive */
export const PassiveDelegatedEvents = ['touchstart', 'touchmove', 'touchend'];
