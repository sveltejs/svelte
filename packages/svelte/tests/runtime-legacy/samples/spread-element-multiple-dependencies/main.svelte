<script>
	export let foo = false;
	export let a = 'a';
	export let b = 'b';
	export let bar = { title: 'baz' };
</script>

<div class={foo ? a : b} {...bar}></div>
