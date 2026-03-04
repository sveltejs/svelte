<script>
  import { fromStore, writable } from 'svelte/store';
	
  let isLoading = $state(false);

  const value = writable(0);
  const valueFromStore = fromStore(value);
  const valueDerivedCurrent = $derived(valueFromStore.current);
</script>

<div>
	$value: {isLoading ? 'Loading...' : $value}
</div>

<div>
	valueFromStore.current: {isLoading ? 'Loading...' : valueFromStore.current}
</div>

<div>
	valueDerivedCurrent: {isLoading ? 'Loading...' : valueDerivedCurrent}
</div>

<button
	onclick={() => {
		isLoading = true;
	}}>
	Loading
</button>

<button
	onclick={() => {
		$value++;
		isLoading = false;
	}}>
	Increment
</button>
