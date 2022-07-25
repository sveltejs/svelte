// Type definitions for Svelte HTML, based on JSX React 18 typings
// Original Project/Authors:
// Type definitions for React 18.0
// Project: http://facebook.github.io/react/
// Definitions by: Asana <https://asana.com>
//                 AssureSign <http://www.assuresign.com>
//                 Microsoft <https://microsoft.com>
//                 John Reilly <https://github.com/johnnyreilly>
//                 Benoit Benezech <https://github.com/bbenezech>
//                 Patricio Zavolinsky <https://github.com/pzavolinsky>
//                 Eric Anderson <https://github.com/ericanderson>
//                 Dovydas Navickas <https://github.com/DovydasNavickas>
//                 Josh Rutherford <https://github.com/theruther4d>
//                 Guilherme Hübner <https://github.com/guilhermehubner>
//                 Ferdy Budhidharma <https://github.com/ferdaber>
//                 Johann Rakotoharisoa <https://github.com/jrakotoharisoa>
//                 Olivier Pascal <https://github.com/pascaloliv>
//                 Martin Hochel <https://github.com/hotell>
//                 Frank Li <https://github.com/franklixuefei>
//                 Jessica Franco <https://github.com/Jessidhia>
//                 Saransh Kataria <https://github.com/saranshkataria>
//                 Kanitkorn Sujautra <https://github.com/lukyth>
//                 Sebastian Silbermann <https://github.com/eps1lon>
//                 Kyle Scully <https://github.com/zieka>
//                 Cong Zhang <https://github.com/dancerphil>
//                 Dimitri Mitropoulos <https://github.com/dimitropoulos>
//                 JongChan Choi <https://github.com/disjukr>
//                 Victor Magalhães <https://github.com/vhfmag>
//                 Dale Tan <https://github.com/hellatan>
//                 Priyanshu Rav <https://github.com/priyanshurav>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.8

// Note: We also allow `null` as a valid value because Svelte treats this the same as `undefined`

type Booleanish = boolean | 'true' | 'false';

//
// Event Handler Types
// ----------------------------------------------------------------------

type EventHandler<E extends Event = Event, T extends EventTarget = Element> =
(event: E & { currentTarget: EventTarget & T}) => any;

export type ClipboardEventHandler<T extends EventTarget> = EventHandler<ClipboardEvent, T>;
export type CompositionEventHandler<T extends EventTarget> = EventHandler<CompositionEvent, T>;
export type DragEventHandler<T extends EventTarget> = EventHandler<DragEvent, T>;
export type FocusEventHandler<T extends EventTarget> = EventHandler<FocusEvent, T>;
export type FormEventHandler<T extends EventTarget> = EventHandler<Event, T>;
export type ChangeEventHandler<T extends EventTarget> = EventHandler<Event, T>;
export type KeyboardEventHandler<T extends EventTarget> = EventHandler<KeyboardEvent, T>;
export type MouseEventHandler<T extends EventTarget> = EventHandler<MouseEvent, T>;
export type TouchEventHandler<T extends EventTarget> = EventHandler<TouchEvent, T>;
export type PointerEventHandler<T extends EventTarget> = EventHandler<PointerEvent, T>;
export type UIEventHandler<T extends EventTarget> = EventHandler<UIEvent, T>;
export type WheelEventHandler<T extends EventTarget> = EventHandler<WheelEvent, T>;
export type AnimationEventHandler<T extends EventTarget> = EventHandler<AnimationEvent, T>;
export type TransitionEventHandler<T extends EventTarget> = EventHandler<TransitionEvent, T>;
export type MessageEventHandler<T extends EventTarget> = EventHandler<MessageEvent, T>;

//
// DOM Attributes
// ----------------------------------------------------------------------

export interface DOMAttributes<T extends EventTarget> {
	// Clipboard Events
	'on:copy'?: ClipboardEventHandler<T> | undefined | null;
	'on:cut'?: ClipboardEventHandler<T> | undefined | null;
	'on:paste'?: ClipboardEventHandler<T> | undefined | null;

	// Composition Events
	'on:compositionend'?: CompositionEventHandler<T> | undefined | null;
	'on:compositionstart'?: CompositionEventHandler<T> | undefined | null;
	'on:compositionupdate'?: CompositionEventHandler<T> | undefined | null;

	// Focus Events
	'on:focus'?: FocusEventHandler<T> | undefined | null;
	'on:focusin'?: FocusEventHandler<T> | undefined | null;
	'on:focusout'?: FocusEventHandler<T> | undefined | null;
	'on:blur'?: FocusEventHandler<T> | undefined | null;

	// Form Events
	'on:change'?: FormEventHandler<T> | undefined | null;
	'on:beforeinput'?: EventHandler<InputEvent, T> | undefined | null;
	'on:input'?: FormEventHandler<T> | undefined | null;
	'on:reset'?: FormEventHandler<T> | undefined | null;
	'on:submit'?: EventHandler<SubmitEvent, T> | undefined | null;
	'on:invalid'?: EventHandler<Event, T> | undefined | null;


	// Image Events
	'on:load'?: EventHandler | undefined | null;
	'on:error'?: EventHandler | undefined | null; // also a Media Event

	// Detail Events
	'on:toggle'?: EventHandler<Event, T> | undefined | null;

	// Keyboard Events
	'on:keydown'?: KeyboardEventHandler<T> | undefined | null;
	'on:keypress'?: KeyboardEventHandler<T> | undefined | null;
	'on:keyup'?: KeyboardEventHandler<T> | undefined | null;

	// Media Events
	'on:abort'?: EventHandler<Event, T> | undefined | null;
	'on:canplay'?: EventHandler<Event, T> | undefined | null;
	'on:canplaythrough'?: EventHandler<Event, T> | undefined | null;
	'on:cuechange'?: EventHandler<Event, T> | undefined | null;
	'on:durationchange'?: EventHandler<Event, T> | undefined | null;
	'on:emptied'?: EventHandler<Event, T> | undefined | null;
	'on:encrypted'?: EventHandler<Event, T> | undefined | null;
	'on:ended'?: EventHandler<Event, T> | undefined | null;
	'on:loadeddata'?: EventHandler<Event, T> | undefined | null;
	'on:loadedmetadata'?: EventHandler<Event, T> | undefined | null;
	'on:loadstart'?: EventHandler<Event, T> | undefined | null;
	'on:pause'?: EventHandler<Event, T> | undefined | null;
	'on:play'?: EventHandler<Event, T> | undefined | null;
	'on:playing'?: EventHandler<Event, T> | undefined | null;
	'on:progress'?: EventHandler<Event, T> | undefined | null;
	'on:ratechange'?: EventHandler<Event, T> | undefined | null;
	'on:seeked'?: EventHandler<Event, T> | undefined | null;
	'on:seeking'?: EventHandler<Event, T> | undefined | null;
	'on:stalled'?: EventHandler<Event, T> | undefined | null;
	'on:suspend'?: EventHandler<Event, T> | undefined | null;
	'on:timeupdate'?: EventHandler<Event, T> | undefined | null;
	'on:volumechange'?: EventHandler<Event, T> | undefined | null;
	'on:waiting'?: EventHandler<Event, T> | undefined | null;

	// MouseEvents
	'on:auxclick'?: MouseEventHandler<T> | undefined | null;
	'on:click'?: MouseEventHandler<T> | undefined | null;
	'on:contextmenu'?: MouseEventHandler<T> | undefined | null;
	'on:dblclick'?: MouseEventHandler<T> | undefined | null;
	'on:drag'?: DragEventHandler<T> | undefined | null;
	'on:dragend'?: DragEventHandler<T> | undefined | null;
	'on:dragenter'?: DragEventHandler<T> | undefined | null;
	'on:dragexit'?: DragEventHandler<T> | undefined | null;
	'on:dragleave'?: DragEventHandler<T> | undefined | null;
	'on:dragover'?: DragEventHandler<T> | undefined | null;
	'on:dragstart'?: DragEventHandler<T> | undefined | null;
	'on:drop'?: DragEventHandler<T> | undefined | null;
	'on:mousedown'?: MouseEventHandler<T> | undefined | null;
	'on:mouseenter'?: MouseEventHandler<T> | undefined | null;
	'on:mouseleave'?: MouseEventHandler<T> | undefined | null;
	'on:mousemove'?: MouseEventHandler<T> | undefined | null;
	'on:mouseout'?: MouseEventHandler<T> | undefined | null;
	'on:mouseover'?: MouseEventHandler<T> | undefined | null;
	'on:mouseup'?: MouseEventHandler<T> | undefined | null;

	// Selection Events
	'on:select'?: EventHandler<Event, T> | undefined | null;
	'on:selectionchange'?: EventHandler<Event, T> | undefined | null;
	'on:selectstart'?: EventHandler<Event, T> | undefined | null;

	// Touch Events
	'on:touchcancel'?: TouchEventHandler<T> | undefined | null;
	'on:touchend'?: TouchEventHandler<T> | undefined | null;
	'on:touchmove'?: TouchEventHandler<T> | undefined | null;
	'on:touchstart'?: TouchEventHandler<T> | undefined | null;

	// Pointer Events
	'on:gotpointercapture'?: PointerEventHandler<T> | undefined | null;
	'on:pointercancel'?: PointerEventHandler<T> | undefined | null;
	'on:pointerdown'?: PointerEventHandler<T> | undefined | null;
	'on:pointerenter'?: PointerEventHandler<T> | undefined | null;
	'on:pointerleave'?: PointerEventHandler<T> | undefined | null;
	'on:pointermove'?: PointerEventHandler<T> | undefined | null;
	'on:pointerout'?: PointerEventHandler<T> | undefined | null;
	'on:pointerover'?: PointerEventHandler<T> | undefined | null;
	'on:pointerup'?: PointerEventHandler<T> | undefined | null;
	'on:lostpointercapture'?: PointerEventHandler<T> | undefined | null;

	// UI Events
	'on:scroll'?: UIEventHandler<T> | undefined | null;
	'on:resize'?: UIEventHandler<T> | undefined | null;

	// Wheel Events
	'on:wheel'?: WheelEventHandler<T> | undefined | null;

	// Animation Events
	'on:animationstart'?: AnimationEventHandler<T> | undefined | null;
	'on:animationend'?: AnimationEventHandler<T> | undefined | null;
	'on:animationiteration'?: AnimationEventHandler<T> | undefined | null;

	// Transition Events
	'on:transitionstart'?: TransitionEventHandler<T> | undefined | null;
	'on:transitionrun'?: TransitionEventHandler<T> | undefined | null;
	'on:transitionend'?: TransitionEventHandler<T> | undefined | null;
	'on:transitioncancel'?: TransitionEventHandler<T> | undefined | null;

	// Svelte Transition Events
	'on:outrostart'?: EventHandler<CustomEvent<null>, T> | undefined | null;
	'on:outroend'?: EventHandler<CustomEvent<null>, T> | undefined | null;
	'on:introstart'?: EventHandler<CustomEvent<null>, T> | undefined | null;
	'on:introend'?: EventHandler<CustomEvent<null>, T> | undefined | null;

	// Message Events
	'on:message'?: MessageEventHandler<T> | undefined | null;
	'on:messageerror'?: MessageEventHandler<T> | undefined | null;

	// Global Events
	'on:cancel'?: EventHandler<Event, T> | undefined | null;
	'on:close'?: EventHandler<Event, T> | undefined | null;
	'on:fullscreenchange'?: EventHandler<Event, T> | undefined | null;
	'on:fullscreenerror'?: EventHandler<Event, T> | undefined | null;
}

// All the WAI-ARIA 1.1 attributes from https://www.w3.org/TR/wai-aria-1.1/
export interface AriaAttributes {
	/** Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. */
	'aria-activedescendant'?: string | undefined | null;
	/** Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. */
	'aria-atomic'?: Booleanish | undefined | null;
	/**
	 * Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be
	 * presented if they are made.
	 */
	'aria-autocomplete'?: 'none' | 'inline' | 'list' | 'both' | undefined | null;
	/** Indicates an element is being modified and that assistive technologies MAY want to wait until the modifications are complete before exposing them to the user. */
	'aria-busy'?: Booleanish | undefined | null;
	/**
	 * Indicates the current "checked" state of checkboxes, radio buttons, and other widgets.
	 * @see aria-pressed @see aria-selected.
	 */
	'aria-checked'?: boolean | 'false' | 'mixed' | 'true' | undefined | null;
	/**
	 * Defines the total number of columns in a table, grid, or treegrid.
	 * @see aria-colindex.
	 */
	'aria-colcount'?: number | undefined | null;
	/**
	 * Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid.
	 * @see aria-colcount @see aria-colspan.
	 */
	'aria-colindex'?: number | undefined | null;
	/**
	 * Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid.
	 * @see aria-colindex @see aria-rowspan.
	 */
	'aria-colspan'?: number | undefined | null;
	/**
	 * Identifies the element (or elements) whose contents or presence are controlled by the current element.
	 * @see aria-owns.
	 */
	'aria-controls'?: string | undefined | null;
	/** Indicates the element that represents the current item within a container or set of related elements. */
	'aria-current'?: boolean | 'false' | 'true' | 'page' | 'step' | 'location' | 'date' | 'time' | undefined | null;
	/**
	 * Identifies the element (or elements) that describes the object.
	 * @see aria-labelledby
	 */
	'aria-describedby'?: string | undefined | null;
	/**
	 * Identifies the element that provides a detailed, extended description for the object.
	 * @see aria-describedby.
	 */
	'aria-details'?: string | undefined | null;
	/**
	 * Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable.
	 * @see aria-hidden @see aria-readonly.
	 */
	'aria-disabled'?: Booleanish | undefined | null;
	/**
	 * Indicates what functions can be performed when a dragged object is released on the drop target.
	 * @deprecated in ARIA 1.1
	 */
	'aria-dropeffect'?: 'none' | 'copy' | 'execute' | 'link' | 'move' | 'popup' | undefined | null;
	/**
	 * Identifies the element that provides an error message for the object.
	 * @see aria-invalid @see aria-describedby.
	 */
	'aria-errormessage'?: string | undefined | null;
	/** Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. */
	'aria-expanded'?: Booleanish | undefined | null;
	/**
	 * Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion,
	 * allows assistive technology to override the general default of reading in document source order.
	 */
	'aria-flowto'?: string | undefined | null;
	/**
	 * Indicates an element's "grabbed" state in a drag-and-drop operation.
	 * @deprecated in ARIA 1.1
	 */
	'aria-grabbed'?: Booleanish | undefined | null;
	/** Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. */
	'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' | undefined | null;
	/**
	 * Indicates whether the element is exposed to an accessibility API.
	 * @see aria-disabled.
	 */
	'aria-hidden'?: Booleanish | undefined | null;
	/**
	 * Indicates the entered value does not conform to the format expected by the application.
	 * @see aria-errormessage.
	 */
	'aria-invalid'?: boolean | 'false' | 'true' | 'grammar' | 'spelling' | undefined | null;
	/** Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element. */
	'aria-keyshortcuts'?: string | undefined | null;
	/**
	 * Defines a string value that labels the current element.
	 * @see aria-labelledby.
	 */
	'aria-label'?: string | undefined | null;
	/**
	 * Identifies the element (or elements) that labels the current element.
	 * @see aria-describedby.
	 */
	'aria-labelledby'?: string | undefined | null;
	/** Defines the hierarchical level of an element within a structure. */
	'aria-level'?: number | undefined | null;
	/** Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region. */
	'aria-live'?: 'off' | 'assertive' | 'polite' | undefined | null;
	/** Indicates whether an element is modal when displayed. */
	'aria-modal'?: Booleanish | undefined | null;
	/** Indicates whether a text box accepts multiple lines of input or only a single line. */
	'aria-multiline'?: Booleanish | undefined | null;
	/** Indicates that the user may select more than one item from the current selectable descendants. */
	'aria-multiselectable'?: Booleanish | undefined | null;
	/** Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. */
	'aria-orientation'?: 'horizontal' | 'vertical' | undefined | null;
	/**
	 * Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship
	 * between DOM elements where the DOM hierarchy cannot be used to represent the relationship.
	 * @see aria-controls.
	 */
	'aria-owns'?: string | undefined | null;
	/**
	 * Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value.
	 * A hint could be a sample value or a brief description of the expected format.
	 */
	'aria-placeholder'?: string | undefined | null;
	/**
	 * Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
	 * @see aria-setsize.
	 */
	'aria-posinset'?: number | undefined | null;
	/**
	 * Indicates the current "pressed" state of toggle buttons.
	 * @see aria-checked @see aria-selected.
	 */
	'aria-pressed'?: boolean | 'false' | 'mixed' | 'true' | undefined | null;
	/**
	 * Indicates that the element is not editable, but is otherwise operable.
	 * @see aria-disabled.
	 */
	'aria-readonly'?: Booleanish | undefined | null;
	/**
	 * Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified.
	 * @see aria-atomic.
	 */
	'aria-relevant'?: 'additions' | 'additions removals' | 'additions text' | 'all' | 'removals' | 'removals additions' | 'removals text' | 'text' | 'text additions' | 'text removals' | undefined | null;
	/** Indicates that user input is required on the element before a form may be submitted. */
	'aria-required'?: Booleanish | undefined | null;
	/** Defines a human-readable, author-localized description for the role of an element. */
	'aria-roledescription'?: string | undefined | null;
	/**
	 * Defines the total number of rows in a table, grid, or treegrid.
	 * @see aria-rowindex.
	 */
	'aria-rowcount'?: number | undefined | null;
	/**
	 * Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid.
	 * @see aria-rowcount @see aria-rowspan.
	 */
	'aria-rowindex'?: number | undefined | null;
	/**
	 * Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid.
	 * @see aria-rowindex @see aria-colspan.
	 */
	'aria-rowspan'?: number | undefined | null;
	/**
	 * Indicates the current "selected" state of various widgets.
	 * @see aria-checked @see aria-pressed.
	 */
	'aria-selected'?: Booleanish | undefined | null;
	/**
	 * Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
	 * @see aria-posinset.
	 */
	'aria-setsize'?: number | undefined | null;
	/** Indicates if items in a table or grid are sorted in ascending or descending order. */
	'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other' | undefined | null;
	/** Defines the maximum allowed value for a range widget. */
	'aria-valuemax'?: number | undefined | null;
	/** Defines the minimum allowed value for a range widget. */
	'aria-valuemin'?: number | undefined | null;
	/**
	 * Defines the current value for a range widget.
	 * @see aria-valuetext.
	 */
	'aria-valuenow'?: number | undefined | null;
	/** Defines the human readable text alternative of aria-valuenow for a range widget. */
	'aria-valuetext'?: string | undefined | null;
}

// All the WAI-ARIA 1.1 role attribute values from https://www.w3.org/TR/wai-aria-1.1/#role_definitions
export type AriaRole =
	| 'alert'
	| 'alertdialog'
	| 'application'
	| 'article'
	| 'banner'
	| 'button'
	| 'cell'
	| 'checkbox'
	| 'columnheader'
	| 'combobox'
	| 'complementary'
	| 'contentinfo'
	| 'definition'
	| 'dialog'
	| 'directory'
	| 'document'
	| 'feed'
	| 'figure'
	| 'form'
	| 'grid'
	| 'gridcell'
	| 'group'
	| 'heading'
	| 'img'
	| 'link'
	| 'list'
	| 'listbox'
	| 'listitem'
	| 'log'
	| 'main'
	| 'marquee'
	| 'math'
	| 'menu'
	| 'menubar'
	| 'menuitem'
	| 'menuitemcheckbox'
	| 'menuitemradio'
	| 'navigation'
	| 'none'
	| 'note'
	| 'option'
	| 'presentation'
	| 'progressbar'
	| 'radio'
	| 'radiogroup'
	| 'region'
	| 'row'
	| 'rowgroup'
	| 'rowheader'
	| 'scrollbar'
	| 'search'
	| 'searchbox'
	| 'separator'
	| 'slider'
	| 'spinbutton'
	| 'status'
	| 'switch'
	| 'tab'
	| 'table'
	| 'tablist'
	| 'tabpanel'
	| 'term'
	| 'textbox'
	| 'timer'
	| 'toolbar'
	| 'tooltip'
	| 'tree'
	| 'treegrid'
	| 'treeitem'
	| (string & {});

export interface HTMLAttributes<T extends EventTarget> extends AriaAttributes, DOMAttributes<T> {
	// Standard HTML Attributes
	accesskey?: string | undefined | null;
	class?: string | undefined | null;
	contenteditable?: Booleanish | "inherit" | undefined | null;
	contextmenu?: string | undefined | null;
	dir?: string | undefined | null;
	draggable?: Booleanish | undefined | null;
	hidden?: boolean | undefined | null;
	id?: string | undefined | null;
	lang?: string | undefined | null;
	placeholder?: string | undefined | null;
	slot?: string | undefined | null;
	spellcheck?: Booleanish | undefined | null;
	style?: string | undefined | null;
	tabindex?: number | undefined | null;
	title?: string | undefined | null;
	translate?: "yes" | "no" | "" | undefined | null;
	inert?: boolean | undefined | null;

	// Unknown
	radiogroup?: string | undefined | null; // <command>, <menuitem>

	// WAI-ARIA
	role?: AriaRole | undefined | null;

	// RDFa Attributes
	about?: string | undefined | null;
	datatype?: string | undefined | null;
	inlist?: any;
	prefix?: string | undefined | null;
	property?: string | undefined | null;
	resource?: string | undefined | null;
	typeof?: string | undefined | null;
	vocab?: string | undefined | null;

	// Non-standard Attributes
	autocapitalize?: string | undefined | null;
	autocorrect?: string | undefined | null;
	autosave?: string | undefined | null;
	color?: string | undefined | null;
	itemprop?: string | undefined | null;
	itemscope?: boolean | undefined | null;
	itemtype?: string | undefined | null;
	itemid?: string | undefined | null;
	itemref?: string | undefined | null;
	results?: number | undefined | null;
	security?: string | undefined | null;
	unselectable?: 'on' | 'off' | undefined | null;

	// Living Standard
	/**
	 * Hints at the type of data that might be entered by the user while editing the element or its contents
	 * @see https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute
	 */
	inputmode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search' | undefined | null;
	/**
	 * Specify that a standard HTML element should behave like a defined custom built-in element
	 * @see https://html.spec.whatwg.org/multipage/custom-elements.html#attr-is
	 */
	is?: string | undefined | null;

	// Svelte bind:x
	/**
	 * Elements with the contenteditable attribute support innerHTML and textContent bindings.
	 */
	innerHTML?: string | undefined | null;
	/**
	* Elements with the contenteditable attribute support innerHTML and textContent bindings.
	*/
	textContent?: string | undefined | null;
}


export type HTMLAttributeReferrerPolicy =
	| ''
	| 'no-referrer'
	| 'no-referrer-when-downgrade'
	| 'origin'
	| 'origin-when-cross-origin'
	| 'same-origin'
	| 'strict-origin'
	| 'strict-origin-when-cross-origin'
	| 'unsafe-url';

export type HTMLAttributeAnchorTarget =
	| '_self'
	| '_blank'
	| '_parent'
	| '_top'
	| (string & {});

export interface AnchorHTMLAttributes extends HTMLAttributes<HTMLAnchorElement> {
	download?: any;
	href?: string | undefined | null;
	hreflang?: string | undefined | null;
	media?: string | undefined | null;
	ping?: string | undefined | null;
	rel?: string | undefined | null;
	target?: HTMLAttributeAnchorTarget | undefined | null;
	type?: string | undefined | null;
	referrerpolicy?: HTMLAttributeReferrerPolicy | undefined | null;

	// SvelteKit
	"sveltekit:noscroll"?: true | undefined | null;
	"sveltekit:prefetch"?: true | undefined | null;
	"sveltekit:reload"?: true | undefined | null;
}

export interface AudioHTMLAttributes extends MediaHTMLAttributes<HTMLAudioElement> {}

export interface AreaHTMLAttributes extends HTMLAttributes<HTMLAreaElement> {
	alt?: string | undefined | null;
	coords?: string | undefined | null;
	download?: any;
	href?: string | undefined | null;
	hreflang?: string | undefined | null;
	media?: string | undefined | null;
	referrerpolicy?: HTMLAttributeReferrerPolicy | undefined | null;
	rel?: string | undefined | null;
	shape?: string | undefined | null;
	target?: string | undefined | null;
}

export interface BaseHTMLAttributes extends HTMLAttributes<HTMLBaseElement> {
	href?: string | undefined | null;
	target?: string | undefined | null;
}

export interface BlockquoteHTMLAttributes extends HTMLAttributes<HTMLQuoteElement> {
	cite?: string | undefined | null;
}

export interface ButtonHTMLAttributes extends HTMLAttributes<HTMLButtonElement> {
	autofocus?: boolean | undefined | null;
	disabled?: boolean | undefined | null;
	form?: string | undefined | null;
	formaction?: string | undefined | null;
	formenctype?: string | undefined | null;
	formmethod?: string | undefined | null;
	formnovalidate?: boolean | undefined | null;
	formtarget?: string | undefined | null;
	name?: string | undefined | null;
	type?: 'submit' | 'reset' | 'button' | undefined | null;
	value?: string | string[] | number | undefined | null;
}

export interface CanvasHTMLAttributes extends HTMLAttributes<HTMLCanvasElement> {
	height?: number | string | undefined | null;
	width?: number | string | undefined | null;
}

export interface ColHTMLAttributes extends HTMLAttributes<HTMLTableColElement> {
	span?: number | undefined | null;
	width?: number | string | undefined | null;
}

export interface ColgroupHTMLAttributes extends HTMLAttributes<HTMLTableColElement> {
	span?: number | undefined | null;
}

export interface DataHTMLAttributes extends HTMLAttributes<HTMLDataElement> {
	value?: string | string[] | number | undefined | null;
}

export interface DetailsHTMLAttributes extends HTMLAttributes<HTMLDetailsElement> {
	open?: boolean | undefined | null;
}

export interface DelHTMLAttributes extends HTMLAttributes<HTMLModElement> {
	cite?: string | undefined | null;
	datetime?: string | undefined | null;
}

export interface DialogHTMLAttributes extends HTMLAttributes<HTMLDialogElement> {
	open?: boolean | undefined | null;
}

export interface EmbedHTMLAttributes extends HTMLAttributes<HTMLEmbedElement> {
	height?: number | string | undefined | null;
	src?: string | undefined | null;
	type?: string | undefined | null;
	width?: number | string | undefined | null;
}

export interface FieldsetHTMLAttributes extends HTMLAttributes<HTMLFieldSetElement> {
	disabled?: boolean | undefined | null;
	form?: string | undefined | null;
	name?: string | undefined | null;
}

export interface FormHTMLAttributes extends HTMLAttributes<HTMLFormElement> {
	acceptcharset?: string | undefined | null;
	action?: string | undefined | null;
	autocomplete?: string | undefined | null;
	enctype?: string | undefined | null;
	method?: string | undefined | null;
	name?: string | undefined | null;
	novalidate?: boolean | undefined | null;
	target?: string | undefined | null;
}

export interface HtmlHTMLAttributes extends HTMLAttributes<HTMLHtmlElement> {
	manifest?: string | undefined | null;
}

export interface IframeHTMLAttributes extends HTMLAttributes<HTMLIFrameElement> {
	allow?: string | undefined | null;
	allowfullscreen?: boolean | undefined | null;
	allowtransparency?: boolean | undefined | null;
	/** @deprecated */
	frameborder?: number | string | undefined | null;
	height?: number | string | undefined | null;
	loading?: "eager" | "lazy" | undefined | null;
	/** @deprecated */
	marginheight?: number | undefined | null;
	/** @deprecated */
	marginwidth?: number | undefined | null;
	name?: string | undefined | null;
	referrerpolicy?: HTMLAttributeReferrerPolicy | undefined | null;
	sandbox?: string | undefined | null;
	/** @deprecated */
	scrolling?: string | undefined | null;
	seamless?: boolean | undefined | null;
	src?: string | undefined | null;
	srcdoc?: string | undefined | null;
	width?: number | string | undefined | null;
}

export interface ImgHTMLAttributes extends HTMLAttributes<HTMLImageElement> {
	alt?: string | undefined | null;
	crossorigin?: "anonymous" | "use-credentials" | "" | undefined | null;
	decoding?: "async" | "auto" | "sync" | undefined | null;
	height?: number | string | undefined | null;
	ismap?: boolean | undefined | null;
	loading?: "eager" | "lazy" | undefined | null;
	referrerpolicy?: HTMLAttributeReferrerPolicy | undefined | null;
	sizes?: string | undefined | null;
	src?: string | undefined | null;
	srcset?: string | undefined | null;
	usemap?: string | undefined | null;
	width?: number | string | undefined | null;
}

export interface InsHTMLAttributes extends HTMLAttributes<HTMLModElement> {
	cite?: string | undefined | null;
	datetime?: string | undefined | null;
}

export type HTMLInputTypeAttribute =
	| 'button'
	| 'checkbox'
	| 'color'
	| 'date'
	| 'datetime-local'
	| 'email'
	| 'file'
	| 'hidden'
	| 'image'
	| 'month'
	| 'number'
	| 'password'
	| 'radio'
	| 'range'
	| 'reset'
	| 'search'
	| 'submit'
	| 'tel'
	| 'text'
	| 'time'
	| 'url'
	| 'week'
	| (string & {});

export interface InputHTMLAttributes extends HTMLAttributes<HTMLInputElement> {
	accept?: string | undefined | null;
	alt?: string | undefined | null;
	autocomplete?: string | undefined | null;
	autofocus?: boolean | undefined | null;
	capture?: boolean | 'user' | 'environment' | undefined | null; // https://www.w3.org/TR/html-media-capture/#the-capture-attribute
	checked?: boolean | undefined | null;
	crossorigin?: string | undefined | null;
	disabled?: boolean | undefined | null;
	enterkeyhint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send' | undefined | null;
	form?: string | undefined | null;
	formaction?: string | undefined | null;
	formenctype?: string | undefined | null;
	formmethod?: string | undefined | null;
	formnovalidate?: boolean | undefined | null;
	formtarget?: string | undefined | null;
	height?: number | string | undefined | null;
	list?: string | undefined | null;
	max?: number | string | undefined | null;
	maxlength?: number | undefined | null;
	min?: number | string | undefined | null;
	minlength?: number | undefined | null;
	multiple?: boolean | undefined | null;
	name?: string | undefined | null;
	pattern?: string | undefined | null;
	placeholder?: string | undefined | null;
	readonly?: boolean | undefined | null;
	required?: boolean | undefined | null;
	size?: number | undefined | null;
	src?: string | undefined | null;
	step?: number | string | undefined | null;
	type?: HTMLInputTypeAttribute | undefined | null;
	value?: any;
	width?: number | string | undefined | null;

	'on:change'?: ChangeEventHandler<HTMLInputElement> | undefined | null;

	// Svelte bind:x
	group?: any | undefined | null;
	files?: FileList | undefined | null;
	indeterminate?: boolean | undefined | null;
}

export interface KeygenHTMLAttributes extends HTMLAttributes<HTMLElement> {
	autofocus?: boolean | undefined | null;
	challenge?: string | undefined | null;
	disabled?: boolean | undefined | null;
	form?: string | undefined | null;
	keytype?: string | undefined | null;
	keyparams?: string | undefined | null;
	name?: string | undefined | null;
}

export interface LabelHTMLAttributes extends HTMLAttributes<HTMLLabelElement> {
	form?: string | undefined | null;
	for?: string | undefined | null;
}

export interface LiHTMLAttributes extends HTMLAttributes<HTMLLIElement> {
	value?: string | string[] | number | undefined | null;
}

export interface LinkHTMLAttributes extends HTMLAttributes<HTMLLinkElement> {
	as?: string | undefined | null;
	crossorigin?: string | undefined | null;
	href?: string | undefined | null;
	hreflang?: string | undefined | null;
	integrity?: string | undefined | null;
	media?: string | undefined | null;
	imagesrcset?: string | undefined | null;
	imagesizes?: string | undefined | null;
	referrerpolicy?: HTMLAttributeReferrerPolicy | undefined | null;
	rel?: string | undefined | null;
	sizes?: string | undefined | null;
	type?: string | undefined | null;
	charset?: string | undefined | null;
}

export interface MapHTMLAttributes extends HTMLAttributes<HTMLMapElement> {
	name?: string | undefined | null;
}

export interface MenuHTMLAttributes extends HTMLAttributes<HTMLMenuElement> {
	type?: string | undefined | null;
}

export interface MediaHTMLAttributes<T extends HTMLMediaElement> extends HTMLAttributes<T> {
	autoplay?: boolean | undefined | null;
	controls?: boolean | undefined | null;
	controlslist?: 'nodownload' | 'nofullscreen' | 'noplaybackrate' | 'noremoteplayback' | (string & {}) | undefined | null;
	crossorigin?: string | undefined | null;
	currenttime?: number | undefined | null;
	defaultmuted?: boolean | undefined | null;
	defaultplaybackrate?: number | undefined | null;
	loop?: boolean | undefined | null;
	mediagroup?: string | undefined | null;
	muted?: boolean | undefined | null;
	playsinline?: boolean | undefined | null;
	preload?: string | undefined | null;
	src?: string | undefined | null;
	/**
	 * a value between 0 and 1
	*/
	volume?: number | undefined | null;

	// Svelte bind:x
	readonly duration?: number | undefined | null;
	readonly buffered?: SvelteMediaTimeRange[] | undefined | null;
	readonly played?: SvelteMediaTimeRange[] | undefined | null;
	readonly seekable?: SvelteMediaTimeRange[] | undefined | null;
	readonly seeking?: boolean | undefined | null;
	readonly ended?: boolean | undefined | null;
	/**
	 * the current playback time in the video, in seconds
	 */
	currentTime?: number | undefined | null;
	/**
	 * how fast or slow to play the video, where 1 is 'normal'
	 */
	playbackRate?: number | undefined | null;
	paused?: boolean | undefined | null;
}

export interface MetaHTMLAttributes extends HTMLAttributes<HTMLMetaElement> {
	charSet?: string | undefined | null;
	content?: string | undefined | null;
	httpequiv?: string | undefined | null;
	name?: string | undefined | null;
	media?: string | undefined | null;
}

export interface MeterHTMLAttributes extends HTMLAttributes<HTMLMeterElement> {
	form?: string | undefined | null;
	high?: number | undefined | null;
	low?: number | undefined | null;
	max?: number | string | undefined | null;
	min?: number | string | undefined | null;
	optimum?: number | undefined | null;
	value?: string | string[] | number | undefined | null;
}

export interface QuoteHTMLAttributes extends HTMLAttributes<HTMLQuoteElement> {
	cite?: string | undefined | null;
}

export interface ObjectHTMLAttributes extends HTMLAttributes<HTMLObjectElement> {
	classid?: string | undefined | null;
	data?: string | undefined | null;
	form?: string | undefined | null;
	height?: number | string | undefined | null;
	name?: string | undefined | null;
	type?: string | undefined | null;
	usemap?: string | undefined | null;
	width?: number | string | undefined | null;
	wmode?: string | undefined | null;
}

export interface OlHTMLAttributes extends HTMLAttributes<HTMLOListElement> {
	reversed?: boolean | undefined | null;
	start?: number | undefined | null;
	type?: '1' | 'a' | 'A' | 'i' | 'I' | undefined | null;
}

export interface OptgroupHTMLAttributes extends HTMLAttributes<HTMLOptGroupElement> {
	disabled?: boolean | undefined | null;
	label?: string | undefined | null;
}

export interface OptionHTMLAttributes extends HTMLAttributes<HTMLOptionElement> {
	disabled?: boolean | undefined | null;
	label?: string | undefined | null;
	selected?: boolean | undefined | null;
	value?: any;
}

export interface OutputHTMLAttributes extends HTMLAttributes<HTMLOutputElement> {
	form?: string | undefined | null;
	for?: string | undefined | null;
	name?: string | undefined | null;
}

export interface ParamHTMLAttributes extends HTMLAttributes<HTMLParamElement> {
	name?: string | undefined | null;
	value?: string | string[] | number | undefined | null;
}

export interface ProgressHTMLAttributes extends HTMLAttributes<HTMLProgressElement> {
	max?: number | string | undefined | null;
	value?: string | string[] | number | undefined | null;
}

export interface SlotHTMLAttributes extends HTMLAttributes<HTMLSlotElement> {
	name?: string | undefined | null;
}

export interface ScriptHTMLAttributes extends HTMLAttributes<HTMLScriptElement> {
	async?: boolean | undefined | null;
	/** @deprecated */
	charset?: string | undefined | null;
	crossorigin?: string | undefined | null;
	defer?: boolean | undefined | null;
	integrity?: string | undefined | null;
	nomodule?: boolean | undefined | null;
	nonce?: string | undefined | null;
	referrerpolicy?: HTMLAttributeReferrerPolicy | undefined | null;
	src?: string | undefined | null;
	type?: string | undefined | null;
}

export interface SelectHTMLAttributes extends HTMLAttributes<HTMLSelectElement> {
	autocomplete?: string | undefined | null;
	autofocus?: boolean | undefined | null;
	disabled?: boolean | undefined | null;
	form?: string | undefined | null;
	multiple?: boolean | undefined | null;
	name?: string | undefined | null;
	required?: boolean | undefined | null;
	size?: number | undefined | null;
	value?: any;

	'on:change'?: ChangeEventHandler<HTMLSelectElement> | undefined | null;
}

export interface SourceHTMLAttributes extends HTMLAttributes<HTMLSourceElement> {
	height?: number | string | undefined | null;
	media?: string | undefined | null;
	sizes?: string | undefined | null;
	src?: string | undefined | null;
	srcset?: string | undefined | null;
	type?: string | undefined | null;
	width?: number | string | undefined | null;
}

export interface StyleHTMLAttributes extends HTMLAttributes<HTMLStyleElement> {
	media?: string | undefined | null;
	nonce?: string | undefined | null;
	scoped?: boolean | undefined | null;
	type?: string | undefined | null;
}

export interface TableHTMLAttributes extends HTMLAttributes<HTMLTableElement> {
	align?: "left" | "center" | "right" | undefined | null;
	bgcolor?: string | undefined | null;
	border?: number | undefined | null;
	cellpadding?: number | string | undefined | null;
	cellspacing?: number | string | undefined | null;
	frame?: boolean | undefined | null;
	rules?: "none" | "groups" | "rows" | "columns" | "all" | undefined | null;
	summary?: string | undefined | null;
	width?: number | string | undefined | null;
}

export interface TextareaHTMLAttributes extends HTMLAttributes<HTMLTextAreaElement> {
	autocomplete?: string | undefined | null;
	autofocus?: boolean | undefined | null;
	cols?: number | undefined | null;
	dirname?: string | undefined | null;
	disabled?: boolean | undefined | null;
	form?: string | undefined | null;
	maxlength?: number | undefined | null;
	minlength?: number | undefined | null;
	name?: string | undefined | null;
	placeholder?: string | undefined | null;
	readonly?: boolean | undefined | null;
	required?: boolean | undefined | null;
	rows?: number | undefined | null;
	value?: string | string[] | number | undefined | null;
	wrap?: string | undefined | null;

	'on:change'?: ChangeEventHandler<HTMLTextAreaElement> | undefined | null;
}

export interface TdHTMLAttributes extends HTMLAttributes<HTMLTableCellElement> {
	align?: "left" | "center" | "right" | "justify" | "char" | undefined | null;
	colspan?: number | undefined | null;
	headers?: string | undefined | null;
	rowspan?: number | undefined | null;
	scope?: string | undefined | null;
	abbr?: string | undefined | null;
	height?: number | string | undefined | null;
	width?: number | string | undefined | null;
	valign?: "top" | "middle" | "bottom" | "baseline" | undefined | null;
}

export interface ThHTMLAttributes extends HTMLAttributes<HTMLTableCellElement> {
	align?: "left" | "center" | "right" | "justify" | "char" | undefined | null;
	colspan?: number | undefined | null;
	headers?: string | undefined | null;
	rowspan?: number | undefined | null;
	scope?: string | undefined | null;
	abbr?: string | undefined | null;
}

export interface TimeHTMLAttributes extends HTMLAttributes<HTMLTimeElement> {
	datetime?: string | undefined | null;
}

export interface TrackHTMLAttributes extends HTMLAttributes<HTMLTrackElement> {
	default?: boolean | undefined | null;
	kind?: string | undefined | null;
	label?: string | undefined | null;
	src?: string | undefined | null;
	srclang?: string | undefined | null;
}

export interface VideoHTMLAttributes extends MediaHTMLAttributes<HTMLVideoElement> {
	height?: number | string | undefined | null;
	playsinline?: boolean | undefined | null;
	poster?: string | undefined | null;
	width?: number | string | undefined | null;
	disablepictureinpicture?: boolean | undefined | null;
	disableremoteplayback?: boolean | undefined | null;

	// Svelte bind:x
	readonly videoWidth?: number | undefined | null;
	readonly videoHeight?: number | undefined | null;
}

export interface SvelteMediaTimeRange {
	start: number;
	end: number;
}

export interface SvelteWindowAttributes extends HTMLAttributes<Window>  {
	readonly innerWidth?: Window['innerWidth'] | undefined | null;
	readonly innerHeight?: Window['innerHeight'] | undefined | null;
	readonly outerWidth?: Window['outerWidth'] | undefined | null;
	readonly outerHeight?: Window['outerHeight'] | undefined | null;
	scrollX?: Window['scrollX'] | undefined | null;
	scrollY?: Window['scrollY'] | undefined | null;
	readonly online?: Window['navigator']['onLine'] | undefined | null;

	// Transformed from on:sveltekit:xy
	'onsveltekit:start'?: EventHandler<CustomEvent, Window> | undefined | null;
	'onsveltekit:navigation-start'?: EventHandler<CustomEvent, Window> | undefined | null;
	'onsveltekit:navigation-end'?: EventHandler<CustomEvent, Window> | undefined | null;

	'on:devicelight'?: EventHandler<Event, Window> | undefined | null;
	'on:beforeinstallprompt'?: EventHandler<Event, Window> | undefined | null;
	'on:deviceproximity'?: EventHandler<Event, Window> | undefined | null;
	'on:paint'?: EventHandler<Event, Window> | undefined | null;
	'on:userproximity'?: EventHandler<Event, Window> | undefined | null;
	'on:beforeprint'?: EventHandler<Event, Window> | undefined | null;
	'on:afterprint'?: EventHandler<Event, Window> | undefined | null;
	'on:languagechange'?: EventHandler<Event, Window> | undefined | null;
	'on:orientationchange'?: EventHandler<Event, Window> | undefined | null;
	'on:message'?: EventHandler<MessageEvent, Window> | undefined | null;
	'on:messageerror'?: EventHandler<MessageEvent, Window> | undefined | null;
	'on:offline'?: EventHandler<Event, Window> | undefined | null;
	'on:online'?: EventHandler<Event, Window> | undefined | null;
	'on:beforeunload'?: EventHandler<BeforeUnloadEvent, Window> | undefined | null;
	'on:unload'?: EventHandler<Event, Window> | undefined | null;
	'on:storage'?: EventHandler<StorageEvent, Window> | undefined | null;
	'on:hashchange'?: EventHandler<HashChangeEvent, Window> | undefined | null;
	'on:pagehide'?: EventHandler<PageTransitionEvent, Window> | undefined | null;
	'on:pageshow'?: EventHandler<PageTransitionEvent, Window> | undefined | null;
	'on:popstate'?: EventHandler<PopStateEvent, Window> | undefined | null;
	'on:devicemotion'?: EventHandler<DeviceMotionEvent> | undefined | null;
	'on:deviceorientation'?: EventHandler<DeviceOrientationEvent, Window> | undefined | null;
	'on:deviceorientationabsolute'?: EventHandler<DeviceOrientationEvent, Window> | undefined | null;
	'on:unhandledrejection'?: EventHandler<PromiseRejectionEvent, Window> | undefined | null;
	'on:rejectionhandled'?: EventHandler<PromiseRejectionEvent, Window> | undefined | null;
}

export interface SVGAttributes<T extends EventTarget> extends AriaAttributes, DOMAttributes<T> {
	// Attributes which also defined in HTMLAttributes
	className?: string | undefined | null;
	class?: string | undefined | null;
	color?: string | undefined | null;
	height?: number | string | undefined | null;
	id?: string | undefined | null;
	lang?: string | undefined | null;
	max?: number | string | undefined | null;
	media?: string | undefined | null;
	method?: string | undefined | null;
	min?: number | string | undefined | null;
	name?: string | undefined | null;
	style?: string | undefined | null;
	target?: string | undefined | null;
	type?: string | undefined | null;
	width?: number | string | undefined | null;

	// Other HTML properties supported by SVG elements in browsers
	role?: AriaRole | undefined | null;
	tabindex?: number | undefined | null;
	crossorigin?: 'anonymous' | 'use-credentials' | '' | undefined | null;

	// SVG Specific attributes
	'accent-height'?: number | string | undefined | null;
	accumulate?: 'none' | 'sum' | undefined | null;
	additive?: 'replace' | 'sum' | undefined | null;
	'alignment-baseline'?: 'auto' | 'baseline' | 'before-edge' | 'text-before-edge' | 'middle' |
	  'central' | 'after-edge' | 'text-after-edge' | 'ideographic' | 'alphabetic' | 'hanging' |
	  'mathematical' | 'inherit' | undefined | null;
	allowReorder?: 'no' | 'yes' | undefined | null;
	alphabetic?: number | string | undefined | null;
	amplitude?: number | string | undefined | null;
	'arabic-form'?: 'initial' | 'medial' | 'terminal' | 'isolated' | undefined | null;
	ascent?: number | string | undefined | null;
	attributeName?: string | undefined | null;
	attributeType?: string | undefined | null;
	autoReverse?: number | string | undefined | null;
	azimuth?: number | string | undefined | null;
	baseFrequency?: number | string | undefined | null;
	'baseline-shift'?: number | string | undefined | null;
	baseProfile?: number | string | undefined | null;
	bbox?: number | string | undefined | null;
	begin?: number | string | undefined | null;
	bias?: number | string | undefined | null;
	by?: number | string | undefined | null;
	calcMode?: number | string | undefined | null;
	'cap-height'?: number | string | undefined | null;
	clip?: number | string | undefined | null;
	'clip-path'?: string | undefined | null;
	clipPathUnits?: number | string | undefined | null;
	'clip-rule'?: number | string | undefined | null;
	'color-interpolation'?: number | string | undefined | null;
	'color-interpolation-filters'?: 'auto' | 'sRGB' | 'linearRGB' | 'inherit' | undefined | null;
	'color-profile'?: number | string | undefined | null;
	'color-rendering'?: number | string | undefined | null;
	contentScriptType?: number | string | undefined | null;
	contentStyleType?: number | string | undefined | null;
	cursor?: number | string | undefined | null;
	cx?: number | string | undefined | null;
	cy?: number | string | undefined | null;
	d?: string | undefined | null;
	decelerate?: number | string | undefined | null;
	descent?: number | string | undefined | null;
	diffuseConstant?: number | string | undefined | null;
	direction?: number | string | undefined | null;
	display?: number | string | undefined | null;
	divisor?: number | string | undefined | null;
	'dominant-baseline'?: number | string | undefined | null;
	dur?: number | string | undefined | null;
	dx?: number | string | undefined | null;
	dy?: number | string | undefined | null;
	edgeMode?: number | string | undefined | null;
	elevation?: number | string | undefined | null;
	'enable-background'?: number | string | undefined | null;
	end?: number | string | undefined | null;
	exponent?: number | string | undefined | null;
	externalResourcesRequired?: number | string | undefined | null;
	fill?: string | undefined | null;
	'fill-opacity'?: number | string | undefined | null;
	'fill-rule'?: 'nonzero' | 'evenodd' | 'inherit' | undefined | null;
	filter?: string | undefined | null;
	filterRes?: number | string | undefined | null;
	filterUnits?: number | string | undefined | null;
	'flood-color'?: number | string | undefined | null;
	'flood-opacity'?: number | string | undefined | null;
	focusable?: number | string | undefined | null;
	'font-family'?: string | undefined | null;
	'font-size'?: number | string | undefined | null;
	'font-size-adjust'?: number | string | undefined | null;
	'font-stretch'?: number | string | undefined | null;
	'font-style'?: number | string | undefined | null;
	'font-variant'?: number | string | undefined | null;
	'font-weight'?: number | string | undefined | null;
	format?: number | string | undefined | null;
	from?: number | string | undefined | null;
	fx?: number | string | undefined | null;
	fy?: number | string | undefined | null;
	g1?: number | string | undefined | null;
	g2?: number | string | undefined | null;
	'glyph-name'?: number | string | undefined | null;
	'glyph-orientation-horizontal'?: number | string | undefined | null;
	'glyph-orientation-vertical'?: number | string | undefined | null;
	glyphRef?: number | string | undefined | null;
	gradientTransform?: string | undefined | null;
	gradientUnits?: string | undefined | null;
	hanging?: number | string | undefined | null;
	href?: string | undefined | null;
	'horiz-adv-x'?: number | string | undefined | null;
	'horiz-origin-x'?: number | string | undefined | null;
	ideographic?: number | string | undefined | null;
	'image-rendering'?: number | string | undefined | null;
	in2?: number | string | undefined | null;
	in?: string | undefined | null;
	intercept?: number | string | undefined | null;
	k1?: number | string | undefined | null;
	k2?: number | string | undefined | null;
	k3?: number | string | undefined | null;
	k4?: number | string | undefined | null;
	k?: number | string | undefined | null;
	kernelMatrix?: number | string | undefined | null;
	kernelUnitLength?: number | string | undefined | null;
	kerning?: number | string | undefined | null;
	keyPoints?: number | string | undefined | null;
	keySplines?: number | string | undefined | null;
	keyTimes?: number | string | undefined | null;
	lengthAdjust?: number | string | undefined | null;
	'letter-spacing'?: number | string | undefined | null;
	'lighting-color'?: number | string | undefined | null;
	limitingConeAngle?: number | string | undefined | null;
	local?: number | string | undefined | null;
	'marker-end'?: string | undefined | null;
	markerHeight?: number | string | undefined | null;
	'marker-mid'?: string | undefined | null;
	'marker-start'?: string | undefined | null;
	markerUnits?: number | string | undefined | null;
	markerWidth?: number | string | undefined | null;
	mask?: string | undefined | null;
	maskContentUnits?: number | string | undefined | null;
	maskUnits?: number | string | undefined | null;
	mathematical?: number | string | undefined | null;
	mode?: number | string | undefined | null;
	numOctaves?: number | string | undefined | null;
	offset?: number | string | undefined | null;
	opacity?: number | string | undefined | null;
	operator?: number | string | undefined | null;
	order?: number | string | undefined | null;
	orient?: number | string | undefined | null;
	orientation?: number | string | undefined | null;
	origin?: number | string | undefined | null;
	overflow?: number | string | undefined | null;
	'overline-position'?: number | string | undefined | null;
	'overline-thickness'?: number | string | undefined | null;
	'paint-order'?: number | string | undefined | null;
	'panose-1'?: number | string | undefined | null;
	path?: string | undefined | null;
	pathLength?: number | string | undefined | null;
	patternContentUnits?: string | undefined | null;
	patternTransform?: number | string | undefined | null;
	patternUnits?: string | undefined | null;
	'pointer-events'?: number | string | undefined | null;
	points?: string | undefined | null;
	pointsAtX?: number | string | undefined | null;
	pointsAtY?: number | string | undefined | null;
	pointsAtZ?: number | string | undefined | null;
	preserveAlpha?: number | string | undefined | null;
	preserveAspectRatio?: string | undefined | null;
	primitiveUnits?: number | string | undefined | null;
	r?: number | string | undefined | null;
	radius?: number | string | undefined | null;
	refX?: number | string | undefined | null;
	refY?: number | string | undefined | null;
	'rendering-intent'?: number | string | undefined | null;
	repeatCount?: number | string | undefined | null;
	repeatDur?: number | string | undefined | null;
	requiredExtensions?: number | string | undefined | null;
	requiredFeatures?: number | string | undefined | null;
	restart?: number | string | undefined | null;
	result?: string | undefined | null;
	rotate?: number | string | undefined | null;
	rx?: number | string | undefined | null;
	ry?: number | string | undefined | null;
	scale?: number | string | undefined | null;
	seed?: number | string | undefined | null;
	'shape-rendering'?: number | string | undefined | null;
	slope?: number | string | undefined | null;
	spacing?: number | string | undefined | null;
	specularConstant?: number | string | undefined | null;
	specularExponent?: number | string | undefined | null;
	speed?: number | string | undefined | null;
	spreadMethod?: string | undefined | null;
	startOffset?: number | string | undefined | null;
	stdDeviation?: number | string | undefined | null;
	stemh?: number | string | undefined | null;
	stemv?: number | string | undefined | null;
	stitchTiles?: number | string | undefined | null;
	'stop-color'?: string | undefined | null;
	'stop-opacity'?: number | string | undefined | null;
	'strikethrough-position'?: number | string | undefined | null;
	'strikethrough-thickness'?: number | string | undefined | null;
	string?: number | string | undefined | null;
	stroke?: string | undefined | null;
	'stroke-dasharray'?: string | number | undefined | null;
	'stroke-dashoffset'?: string | number | undefined | null;
	'stroke-linecap'?: 'butt' | 'round' | 'square' | 'inherit' | undefined | null;
	'stroke-linejoin'?: 'miter' | 'round' | 'bevel' | 'inherit' | undefined | null;
	'stroke-miterlimit'?: string | undefined | null;
	'stroke-opacity'?: number | string | undefined | null;
	'stroke-width'?: number | string | undefined | null;
	surfaceScale?: number | string | undefined | null;
	systemLanguage?: number | string | undefined | null;
	tableValues?: number | string | undefined | null;
	targetX?: number | string | undefined | null;
	targetY?: number | string | undefined | null;
	'text-anchor'?: string | undefined | null;
	'text-decoration'?: number | string | undefined | null;
	textLength?: number | string | undefined | null;
	'text-rendering'?: number | string | undefined | null;
	to?: number | string | undefined | null;
	transform?: string | undefined | null;
	u1?: number | string | undefined | null;
	u2?: number | string | undefined | null;
	'underline-position'?: number | string | undefined | null;
	'underline-thickness'?: number | string | undefined | null;
	unicode?: number | string | undefined | null;
	'unicode-bidi'?: number | string | undefined | null;
	'unicode-range'?: number | string | undefined | null;
	'units-per-em'?: number | string | undefined | null;
	'v-alphabetic'?: number | string | undefined | null;
	values?: string | undefined | null;
	'vector-effect'?: number | string | undefined | null;
	version?: string | undefined | null;
	'vert-adv-y'?: number | string | undefined | null;
	'vert-origin-x'?: number | string | undefined | null;
	'vert-origin-y'?: number | string | undefined | null;
	'v-hanging'?: number | string | undefined | null;
	'v-ideographic'?: number | string | undefined | null;
	viewBox?: string | undefined | null;
	viewTarget?: number | string | undefined | null;
	visibility?: number | string | undefined | null;
	'v-mathematical'?: number | string | undefined | null;
	widths?: number | string | undefined | null;
	'word-spacing'?: number | string | undefined | null;
	'writing-mode'?: number | string | undefined | null;
	x1?: number | string | undefined | null;
	x2?: number | string | undefined | null;
	x?: number | string | undefined | null;
	xChannelSelector?: string | undefined | null;
	'x-height'?: number | string | undefined | null;
	'xlink:actuate'?: string | undefined | null;
	'xlink:arcrole'?: string | undefined | null;
	'xlink:href'?: string | undefined | null;
	'xlink:role'?: string | undefined | null;
	'xlink:show'?: string | undefined | null;
	'xlink:title'?: string | undefined | null;
	'xlink:type'?: string | undefined | null;
	'xml:base'?: string | undefined | null;
	'xml:lang'?: string | undefined | null;
	xmlns?: string | undefined | null;
	'xmlns:xlink'?: string | undefined | null;
	'xml:space'?: string | undefined | null;
	y1?: number | string | undefined | null;
	y2?: number | string | undefined | null;
	y?: number | string | undefined | null;
	yChannelSelector?: string | undefined | null;
	z?: number | string | undefined | null;
	zoomAndPan?: string | undefined | null;
}

export interface WebViewHTMLAttributes extends HTMLAttributes<HTMLElement> {
	allowfullscreen?: boolean | undefined | null;
	allowpopups?: boolean | undefined | null;
	autofocus?: boolean | undefined | null;
	autosize?: boolean | undefined | null;
	blinkfeatures?: string | undefined | null;
	disableblinkfeatures?: string | undefined | null;
	disableguestresize?: boolean | undefined | null;
	disablewebsecurity?: boolean | undefined | null;
	guestinstance?: string | undefined | null;
	httpreferrer?: string | undefined | null;
	nodeintegration?: boolean | undefined | null;
	partition?: string | undefined | null;
	plugins?: boolean | undefined | null;
	preload?: string | undefined | null;
	src?: string | undefined | null;
	useragent?: string | undefined | null;
	webpreferences?: string | undefined | null;
}

//
// DOM Elements
// ----------------------------------------------------------------------

export interface SvelteHTMLElements {
	a: AnchorHTMLAttributes;
	abbr: HTMLAttributes<HTMLElement>;
	address: HTMLAttributes<HTMLElement>;
	area: AreaHTMLAttributes;
	article: HTMLAttributes<HTMLElement>;
	aside: HTMLAttributes<HTMLElement>;
	audio: AudioHTMLAttributes;
	b: HTMLAttributes<HTMLElement>;
	base: BaseHTMLAttributes;
	bdi: HTMLAttributes<HTMLElement>;
	bdo: HTMLAttributes<HTMLElement>;
	big: HTMLAttributes<HTMLElement>;
	blockquote: BlockquoteHTMLAttributes;
	body: HTMLAttributes<HTMLBodyElement>;
	br: HTMLAttributes<HTMLBRElement>;
	button: ButtonHTMLAttributes;
	canvas: CanvasHTMLAttributes;
	caption: HTMLAttributes<HTMLElement>;
	cite: HTMLAttributes<HTMLElement>;
	code: HTMLAttributes<HTMLElement>;
	col: ColHTMLAttributes;
	colgroup: ColgroupHTMLAttributes;
	data: DataHTMLAttributes;
	datalist: HTMLAttributes<HTMLDataListElement>;
	dd: HTMLAttributes<HTMLElement>;
	del: DelHTMLAttributes;
	details: DetailsHTMLAttributes;
	dfn: HTMLAttributes<HTMLElement>;
	dialog: DialogHTMLAttributes;
	div: HTMLAttributes<HTMLDivElement>;
	dl: HTMLAttributes<HTMLDListElement>;
	dt: HTMLAttributes<HTMLElement>;
	em: HTMLAttributes<HTMLElement>;
	embed: EmbedHTMLAttributes;
	fieldset: FieldsetHTMLAttributes;
	figcaption: HTMLAttributes<HTMLElement>;
	figure: HTMLAttributes<HTMLElement>;
	footer: HTMLAttributes<HTMLElement>;
	form: FormHTMLAttributes;
	h1: HTMLAttributes<HTMLHeadingElement>;
	h2: HTMLAttributes<HTMLHeadingElement>;
	h3: HTMLAttributes<HTMLHeadingElement>;
	h4: HTMLAttributes<HTMLHeadingElement>;
	h5: HTMLAttributes<HTMLHeadingElement>;
	h6: HTMLAttributes<HTMLHeadingElement>;
	head: HTMLAttributes<HTMLElement>;
	header: HTMLAttributes<HTMLElement>;
	hgroup: HTMLAttributes<HTMLElement>;
	hr: HTMLAttributes<HTMLHRElement>;
	html: HtmlHTMLAttributes;
	i: HTMLAttributes<HTMLElement>;
	iframe: IframeHTMLAttributes;
	img: ImgHTMLAttributes;
	input: InputHTMLAttributes;
	ins: InsHTMLAttributes;
	kbd: HTMLAttributes<HTMLElement>;
	keygen: KeygenHTMLAttributes;
	label: LabelHTMLAttributes;
	legend: HTMLAttributes<HTMLLegendElement>;
	li: LiHTMLAttributes;
	link: LinkHTMLAttributes;
	main: HTMLAttributes<HTMLElement>;
	map: MapHTMLAttributes;
	mark: HTMLAttributes<HTMLElement>;
	menu: MenuHTMLAttributes;
	menuitem: HTMLAttributes<HTMLElement>;
	meta: MetaHTMLAttributes;
	meter: MeterHTMLAttributes;
	nav: HTMLAttributes<HTMLElement>;
	noscript: HTMLAttributes<HTMLElement>;
	object: ObjectHTMLAttributes;
	ol: OlHTMLAttributes;
	optgroup: OptgroupHTMLAttributes;
	option: OptionHTMLAttributes;
	output: OutputHTMLAttributes;
	p: HTMLAttributes<HTMLParagraphElement>;
	param: ParamHTMLAttributes;
	picture: HTMLAttributes<HTMLElement>;
	pre: HTMLAttributes<HTMLPreElement>;
	progress: ProgressHTMLAttributes;
	q: QuoteHTMLAttributes;
	rp: HTMLAttributes<HTMLElement>;
	rt: HTMLAttributes<HTMLElement>;
	ruby: HTMLAttributes<HTMLElement>;
	s: HTMLAttributes<HTMLElement>;
	samp: HTMLAttributes<HTMLElement>;
	slot: SlotHTMLAttributes;
	script: ScriptHTMLAttributes;
	section: HTMLAttributes<HTMLElement>;
	select: SelectHTMLAttributes;
	small: HTMLAttributes<HTMLElement>;
	source: SourceHTMLAttributes;
	span: HTMLAttributes<HTMLSpanElement>;
	strong: HTMLAttributes<HTMLElement>;
	style: StyleHTMLAttributes;
	sub: HTMLAttributes<HTMLElement>;
	summary: HTMLAttributes<HTMLElement>;
	sup: HTMLAttributes<HTMLElement>;
	table: TableHTMLAttributes;
	template: HTMLAttributes<HTMLTemplateElement>;
	tbody: HTMLAttributes<HTMLTableSectionElement>;
	td: TdHTMLAttributes;
	textarea: TextareaHTMLAttributes;
	tfoot: HTMLAttributes<HTMLTableSectionElement>;
	th: ThHTMLAttributes;
	thead: HTMLAttributes<HTMLTableSectionElement>;
	time: TimeHTMLAttributes;
	title: HTMLAttributes<HTMLTitleElement>;
	tr: HTMLAttributes<HTMLTableRowElement>;
	track: TrackHTMLAttributes;
	u: HTMLAttributes<HTMLElement>;
	ul: HTMLAttributes<HTMLUListElement>;
	"var": HTMLAttributes<HTMLElement>;
	video: VideoHTMLAttributes;
	wbr: HTMLAttributes<HTMLElement>;
	webview: WebViewHTMLAttributes;
	
	// SVG
	svg: SVGAttributes<SVGSVGElement>;

	animate: SVGAttributes<SVGAnimateElement>;
	animateMotion: SVGAttributes<SVGElement>;
	animateTransform: SVGAttributes<SVGAnimateTransformElement>;
	circle: SVGAttributes<SVGCircleElement>;
	clipPath: SVGAttributes<SVGClipPathElement>;
	defs: SVGAttributes<SVGDefsElement>;
	desc: SVGAttributes<SVGDescElement>;
	ellipse: SVGAttributes<SVGEllipseElement>;
	feBlend: SVGAttributes<SVGFEBlendElement>;
	feColorMatrix: SVGAttributes<SVGFEColorMatrixElement>;
	feComponentTransfer: SVGAttributes<SVGFEComponentTransferElement>;
	feComposite: SVGAttributes<SVGFECompositeElement>;
	feConvolveMatrix: SVGAttributes<SVGFEConvolveMatrixElement>;
	feDiffuseLighting: SVGAttributes<SVGFEDiffuseLightingElement>;
	feDisplacementMap: SVGAttributes<SVGFEDisplacementMapElement>;
	feDistantLight: SVGAttributes<SVGFEDistantLightElement>;
	feDropShadow: SVGAttributes<SVGFEDropShadowElement>;
	feFlood: SVGAttributes<SVGFEFloodElement>;
	feFuncA: SVGAttributes<SVGFEFuncAElement>;
	feFuncB: SVGAttributes<SVGFEFuncBElement>;
	feFuncG: SVGAttributes<SVGFEFuncGElement>;
	feFuncR: SVGAttributes<SVGFEFuncRElement>;
	feGaussianBlur: SVGAttributes<SVGFEGaussianBlurElement>;
	feImage: SVGAttributes<SVGFEImageElement>;
	feMerge: SVGAttributes<SVGFEMergeElement>;
	feMergeNode: SVGAttributes<SVGFEMergeNodeElement>;
	feMorphology: SVGAttributes<SVGFEMorphologyElement>;
	feOffset: SVGAttributes<SVGFEOffsetElement>;
	fePointLight: SVGAttributes<SVGFEPointLightElement>;
	feSpecularLighting: SVGAttributes<SVGFESpecularLightingElement>;
	feSpotLight: SVGAttributes<SVGFESpotLightElement>;
	feTile: SVGAttributes<SVGFETileElement>;
	feTurbulence: SVGAttributes<SVGFETurbulenceElement>;
	filter: SVGAttributes<SVGFilterElement>;
	foreignObject: SVGAttributes<SVGForeignObjectElement>;
	g: SVGAttributes<SVGGElement>;
	image: SVGAttributes<SVGImageElement>;
	line: SVGAttributes<SVGLineElement>;
	linearGradient: SVGAttributes<SVGLinearGradientElement>;
	marker: SVGAttributes<SVGMarkerElement>;
	mask: SVGAttributes<SVGMaskElement>;
	metadata: SVGAttributes<SVGMetadataElement>;
	mpath: SVGAttributes<SVGElement>;
	path: SVGAttributes<SVGPathElement>;
	pattern: SVGAttributes<SVGPatternElement>;
	polygon: SVGAttributes<SVGPolygonElement>;
	polyline: SVGAttributes<SVGPolylineElement>;
	radialGradient: SVGAttributes<SVGRadialGradientElement>;
	rect: SVGAttributes<SVGRectElement>;
	stop: SVGAttributes<SVGStopElement>;
	switch: SVGAttributes<SVGSwitchElement>;
	symbol: SVGAttributes<SVGSymbolElement>;
	text: SVGAttributes<SVGTextElement>;
	textPath: SVGAttributes<SVGTextPathElement>;
	tspan: SVGAttributes<SVGTSpanElement>;
	use: SVGAttributes<SVGUseElement>;
	view: SVGAttributes<SVGViewElement>;

	// Svelte specific
	'svelte:window': SvelteWindowAttributes;
	'svelte:body': HTMLAttributes<HTMLElement>;
	'svelte:fragment': { slot?: string; };
	'svelte:options': { [name: string]: any };
	'svelte:head': { [name: string]: any };

	[name: string]: { [name: string]: any };
}
