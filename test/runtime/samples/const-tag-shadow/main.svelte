<script>
	export let numbers = [
		{
			a: 3,
			b: 4, 
			children: [
				{ a: 5, b: 6 },
				{ a: 7, b: 8 }
			]
		},
		{
			a: 9,
			b: 10, 
			children: [
				{ a: 11, b: 12 },
				{ a: 13, b: 14 }
			]
		}
	];

</script>

{#each numbers as {a, b, children}}
	{@const ab = a + b}
	<b>{ab}</b>
	{#each children as {a, b}}
		{@const ab = a + b}
		<u>{ab}</u>
	{/each}
	<i>{ab}</i>
{/each}