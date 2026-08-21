<script lang="ts">
	import { resolve } from './main.svelte';
	import Bar from './Bar.svelte';

	const foo = await new Promise((r) => resolve.push(() => r('foo')));
</script>

<p>foo: {foo}</p>

<Bar/>
