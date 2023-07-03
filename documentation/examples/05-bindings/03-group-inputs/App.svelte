<script>
	let scoops = 1;
	let flavours = ['Éclats de menthe'];

	let menu = ['Cookie crémeux', 'Éclats de menthe', 'Vague à la fraise'];

	function join(flavours) {
		if (flavours.length === 1) return flavours[0];
		return `${flavours.slice(0, -1).join(', ')} et ${flavours[flavours.length - 1]}`;
	}
</script>

<h2>Nombre de boules</h2>

<label>
	<input type="radio" bind:group={scoops} name="scoops" value={1} />
	Une boule
</label>

<label>
	<input type="radio" bind:group={scoops} name="scoops" value={2} />
	Deux boules
</label>

<label>
	<input type="radio" bind:group={scoops} name="scoops" value={3} />
	Trois boules
</label>

<h2>Parfums</h2>

{#each menu as flavour}
	<label>
		<input type="checkbox" bind:group={flavours} name="flavours" value={flavour} />
		{flavour}
	</label>
{/each}

{#if flavours.length === 0}
	<p>Veuillez choisir au moins un parfum</p>
{:else if flavours.length > scoops}
	<p>Vous ne pouvez pas choisir plus de parfums que de boules !</p>
{:else}
	<p>
		Vous avez commandé {scoops}
		{scoops === 1 ? 'boule' : 'boules'}
		de {join(flavours)}
	</p>
{/if}
