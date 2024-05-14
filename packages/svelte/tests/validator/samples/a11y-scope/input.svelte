<!-- valid -->
<th scope></th>
<svelte:element this={Math.random() ? 'th' : 'td'} scope />

<!-- invalid -->
<div scope></div>
