<script>
	import Two from './Two.svelte';
	export let a, b;
</script>

<Two {b}>
	<svelte:fragment slot="two" let:two>
		<slot name="one" one={a} two={two}></slot>
	</svelte:fragment>
</Two>
