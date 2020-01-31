<script>
	import { writable } from 'svelte/store';

	export function createValidator() {
		const { subscribe, set } = writable({ dirty: false, valid: false });

		function action(node, binding) {
			return {
				update(value) {
					set({ dirty: true, valid: value !== '' });
				}
			};
		}

		return [{ subscribe }, action];
	}
	const [validity, validate] = createValidator();
	let email = null;
</script>

<input class="input"
	type="text"
	bind:value={email}
	placeholder="Type here"
	use:validate={email}
/>

Dirty: {$validity.dirty}
Valid: {$validity.valid}
