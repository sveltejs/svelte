<script lang="ts"></script>

{#each { length: 1 }, index}
	<button
		type="button"
		data-index={index}
		onclick={(e) => {
			const index = Number(e.currentTarget.dataset.index)!;
			console.log(index);
		}}>B</button
	>
{/each}
