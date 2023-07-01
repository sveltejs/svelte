import { createEventDispatcher } from '$runtime/internal/lifecycle';

const dispatch = createEventDispatcher<{
	loaded: null;
	change: string;
	valid: boolean;
	optional: number | null;
}>();

// @ts-expect-error: dispatch invalid event
dispatch('some-event');

dispatch('loaded');
dispatch('loaded', null);
dispatch('loaded', undefined);
dispatch('loaded', undefined, { cancelable: true });
// @ts-expect-error: no detail accepted
dispatch('loaded', 123);

// @ts-expect-error: detail not provided
dispatch('change');
dispatch('change', 'string');
dispatch('change', 'string', { cancelable: true });
// @ts-expect-error: wrong type of detail
dispatch('change', 123);
// @ts-expect-error: wrong type of detail
dispatch('change', undefined);

dispatch('valid', true);
dispatch('valid', true, { cancelable: true });
// @ts-expect-error: wrong type of detail
dispatch('valid', 'string');

dispatch('optional');
dispatch('optional', 123);
dispatch('optional', 123, { cancelable: true });
dispatch('optional', null);
dispatch('optional', undefined);
dispatch('optional', undefined, { cancelable: true });
// @ts-expect-error: wrong type of optional detail
dispatch('optional', 'string');
// @ts-expect-error: wrong type of option
dispatch('optional', undefined, { cancelabled: true });

function generic_fn<T extends boolean>(t: T) {
	const dispatch = createEventDispatcher<{
		required: T;
		optional: T | null;
	}>();

	dispatch('required', t);
	dispatch('optional', t);
	dispatch('optional', null);
	dispatch('optional', undefined);
	// @ts-expect-error: wrong type of optional detail
	dispatch('optional', 'string');
	// @ts-expect-error: wrong type of required detail
	dispatch('required', 'string');
	// @ts-expect-error: wrong type of optional detail
	dispatch('optional', true);
	// @ts-expect-error: wrong type of required detail
	dispatch('required', true);
}
generic_fn;
