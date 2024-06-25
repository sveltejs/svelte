<script>
	import Card from './Card.svelte'

	const x = [{
		fav: false,
		x: 1
	}, {
		fav: false,
		x: 2
	}, {
		fav: false,
		x: 3
	}, {
		fav: false,
		x: 4
	}];

	let p_cards = Promise.resolve(JSON.parse(JSON.stringify(x)));

	let show = true;
</script>

{#await p_cards then cards}
	{#if show}
	{#each cards.filter((card) => !card.fav) as card}
	<Card {card} onfav={() => {card.fav = !card.fav}}></Card>
	{/each}
-------
	{#each  cards.filter((card) => card.fav) as card}
		<Card {card} onfav={() => {card.fav = !card.fav}}></Card>
	{/each}
	{/if}
{/await}

