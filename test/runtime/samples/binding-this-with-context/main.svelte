<script>
  export let items = ['foo', 'bar', 'baz'];
	export let divs = [];
	export let spans = {};
	export let ps = [];
	export let hrs = {};
	const prefix = '-';
</script>

{#each items as item, j}
	<div bind:this={divs[j]}>{item}</div>
{/each}

{#each Object.entries(items) as [ key, val ] }
	<span bind:this="{spans[prefix + val + key]}">{val}</span>
{/each}

<ul>
	{#each items as thing, j (thing)}
		<li><p bind:this="{ps[j]}">{thing}</p></li>
	{/each}
</ul>

<ul>
	{#each items as sure, j (sure)}
		<li><hr bind:this="{hrs[sure]}" /></li>
	{/each}
</ul>