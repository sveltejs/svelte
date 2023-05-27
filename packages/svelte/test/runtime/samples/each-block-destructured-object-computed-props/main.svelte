<script>
	export let objectsArray;
	export let firstString;
	export let secondString;
</script>

{#each objectsArray as { [firstString]: firstProp, [secondString]: secondProp, [firstString.split('').reverse().join('')]: reverseFirst, [secondString.toUpperCase()]: upperSecond } }
	<p>{firstString}: {firstProp}</p>
  <p>{secondString}: {secondProp}</p>
	<p>{firstString.split('').reverse().join('')}: {reverseFirst}</p>
	<p>{secondString.toUpperCase()}: {upperSecond}</p>
{/each}
