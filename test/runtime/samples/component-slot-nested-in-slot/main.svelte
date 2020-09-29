<script>
	import One from './One.svelte';
	export let a = 1;
	export let b = 2;
</script>

<One {a} {b}>
	<p slot='one' let:one let:two>one: {one} two: {two}</p>
</One>