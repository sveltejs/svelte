<script>
    import { createSubscriber, SvelteDate } from 'svelte/reactivity';
	import Row from './Row.svelte';
	
	function compactAgo(timestamp, now) {
		const seconds = Math.max(0, Math.round((now - Date.parse(timestamp)) / 100));
		return seconds;
	}

	class RelativeClock {
		#now = new SvelteDate();
		#subscribe;

		constructor() {
			this.tick();
			this.#subscribe = createSubscriber(() => {
				this.tick();
				const interval = setInterval(this.tick, 100);
				return () => {
					clearInterval(interval)
				};
			});
		}

		tick = () => this.#now.setTime(Date.now());

		compactAgo(timestamp) {
			this.#subscribe();
			return compactAgo(timestamp, this.#now.getTime());
		}
	}

	let events = $state([]);
	let nextId = $state(1);
	let maxRows = 2;

	const clock = new RelativeClock();
	function addEvent() {
		events.unshift({ id: nextId, timestamp: new Date().toISOString() });
		nextId += 1;
		while (events.length > maxRows)  {
            events.pop();
        }
	}

	$effect(() => {
		const interval = setInterval(addEvent, 100);
		return () => {
            clearInterval(interval);
        } 
	});
</script>

<ul>
	{#each events as event (event.id)}
		<Row {event} {clock} />
	{/each}
</ul>