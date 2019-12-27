<script>
	import Nested from './Nested.svelte';

	export let things;
</script>

<Nested {things}>
	<div slot="foo" let:thing class={thing.klass || 'no-class'}>
		<span>{thing.text}</span>
	</div>
</Nested>