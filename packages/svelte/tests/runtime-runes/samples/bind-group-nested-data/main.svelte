<script lang="ts">
  import { writable } from 'svelte/store';

  let menu = ['Cookies and cream', 'Mint choc chip', 'Raspberry ripple'];
  let order = writable({ flavours: ['Mint choc chip'], scoops: 1 });
</script>

<form method="POST">
  <h2>Size</h2>

  <label>
    <input type="radio" bind:group={$order.scoops} name="scoops" value={1} />
    One scoop
  </label>

  <label>
    <input type="radio" bind:group={$order.scoops} name="scoops" value={2} />
    Two scoops
  </label>

  <label>
    <input type="radio" bind:group={$order.scoops} name="scoops" value={3} />
    Three scoops
  </label>

  <h2>Flavours</h2>

  {#each menu as flavour}
    <label>
      <input
        type="checkbox"
        bind:group={$order.flavours}
        name="flavours"
        value={flavour}
      />
      {flavour}
    </label>
  {/each}
</form>

<div>
	<h2>Current flavours</h2>
	<span id="output">{$order.flavours.join('+')}</span>
</div>
