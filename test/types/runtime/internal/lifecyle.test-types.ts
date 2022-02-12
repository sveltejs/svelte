import { createEventDispatcher } from '$runtime/internal/lifecycle';

const dispatch = createEventDispatcher<{
   loaded: never
   change: string
   valid: boolean
   optional: number | null
}>();

// @ts-expect-error: dispatch invalid event
dispatch('some-event');

dispatch('loaded');
// @ts-expect-error: no detail accepted
dispatch('loaded', 123);

// @ts-expect-error: detail not provided
dispatch('change');
dispatch('change', 'string');
// @ts-expect-error: wrong type of detail
dispatch('change', 123);
// @ts-expect-error: wrong type of detail
dispatch('change', undefined);

dispatch('valid', true);
// @ts-expect-error: wrong type of detail
dispatch('valid', 'string');

dispatch('optional');
dispatch('optional', 123);
dispatch('optional', null);
// @ts-expect-error: wrong type of optional detail
dispatch('optional', 'string');
