export interface EventDispatcher<EventMap extends Record<string, any>> {
	// Implementation notes:
	// - undefined extends X instead of X extends undefined makes this work better with both strict and nonstrict mode
	// - [X] extends [never] is needed, X extends never would reduce the whole resulting type to never and not to one of the condition outcomes
	<Type extends keyof EventMap>(
		...args: [EventMap[Type]] extends [never]
			? [type: Type, parameter?: null | undefined, options?: DispatchOptions]
			: null extends EventMap[Type]
			? [type: Type, parameter?: EventMap[Type], options?: DispatchOptions]
			: undefined extends EventMap[Type]
			? [type: Type, parameter?: EventMap[Type], options?: DispatchOptions]
			: [type: Type, parameter: EventMap[Type], options?: DispatchOptions]
	): boolean;
}

export interface DispatchOptions {
	cancelable?: boolean;
}
