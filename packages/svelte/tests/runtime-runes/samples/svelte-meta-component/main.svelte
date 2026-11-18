<script>
	import Card from './Card.svelte';
	import Nested from './Nested.svelte';
</script>

<h1>title</h1>
<Card />
<p>after</p>
<Card />
<Card />
<Nested />
<span>after nested</span>
<div><Card /><b>inside</b></div>

{#snippet content()}
	<i>snippet</i>
{/snippet}

{@render content()}
<em>after render</em>
{@html '<strong>raw</strong>'}
<small>after html</small>
