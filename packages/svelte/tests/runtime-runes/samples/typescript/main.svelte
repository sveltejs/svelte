<script context="module" lang="ts">
	interface Hello { message: 'hello' }
	type Goodbye = { message: 'goodbye' };

	function this_fn(this: any) {
		console.log(this);
	}

	export type { Hello };
</script>

<script>
	import type { Foo } from './types';
	import { type Bar, type Baz } from './types';

	let count = $state(0);
	const person = {
		message: 'goodbye'
	} satisfies Goodbye;
</script>

<button
	on:click={(e: MouseEvent) => {
		const next: number = count + 1;
		count = next! as number;
	}}
>clicks: {count}</button>
