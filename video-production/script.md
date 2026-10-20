svelte
<script lang="ts">
  import { writable, derived } from 'svelte/store';

  /** Simple logger with levels */
  const logger = {
    debug: (...args: any[]) => console.debug('[DEBUG]', ...args),
    info: (...args: any[]) => console.info('[INFO]', ...args),
    warn: (...args: any[]) => console.warn('[WARN]', ...args),
    error: (...args: any[]) => console.error('[ERROR]', ...args),
  };

  /** Validate that a value is a non‑negative integer */
  function validatePositiveInt(value: unknown, name: string): number {
    const num = Number(value);
    if (!Number.isInteger(num) || num < 0) {
      throw new TypeError(`${name} must be a non‑negative integer, got ${value}`);
    }
    return num;
  }

  /** Store for the current query id */
  const query = writable<number>(0);

  /** Stores for async price and stock promises */
  const pricePromise = writable<Promise<number>>(Promise.resolve(0));
  const stockPromise = writable<Promise<number>>(Promise.resolve(0));

  /** Resolve a price asynchronously (simulated) */
  function resolvePrice(id: number, value: number): void {
    try {
      const validId = validatePositiveInt(id, 'price id');
      const validValue = validatePositiveInt(value, 'price value');
      pricePromise.set(
        new Promise<number>((resolve) => {
          setTimeout(() => {
            logger.debug(`Price ${validId} resolved to ${validValue}`);
            resolve(validValue);
          }, 0);
        })
      );
    } catch (e) {
      logger.error(e);
    }
  }

  /** Resolve a stock asynchronously (simulated) */
  function resolveStock(id: number, value: number): void {
    try {
      const validId = validatePositiveInt(id, 'stock id');
      const validValue = validatePositiveInt(value, 'stock value');
      stockPromise.set(
        new Promise<number>((resolve) => {
          setTimeout(() => {
            logger.debug(`Stock ${validId} resolved to ${validValue}`);
            resolve(validValue);
          }, 0);
        })
      );
    } catch (e) {
      logger.error(e);
    }
  }

  /** Async derived store that waits for both price and stock promises */
  const combined = derived(
    [query, pricePromise, stockPromise],
    ([$query, $priceP, $stockP], set) => {
      // Reset UI while awaiting
      set({ query: $query, price: null, stock: null });

      // Resolve both promises concurrently
      Promise.all([$priceP, $stockP])
        .then(([price, stock]) => {
          logger.info('All async values resolved', { query: $query, price, stock });
          set({ query: $query, price, stock });
        })
        .catch((err) => {
          logger.error('Error resolving async values', err);
          set({ query: $query, price: null, stock: null });
        });
    },
    { query: 0, price: null as number | null, stock: null as number | null }
  );

  /** UI helper to format the output */
  $: display = $combined
    ? `${$combined.query},${$combined.stock ?? '-'},${$combined.price ?? '-'}`
    : 'loading...';

  /** Event handler for changing the query */
  function setQuery(id: number) {
    try {
      const validId = validatePositiveInt(id, 'query id');
      query.set(validId);
    } catch (e) {
      logger.error(e);
    }
  }
</script>

<style>
  button {
    margin: 0.25rem;
    padding: 0.5rem 1rem;
  }
</style>

<div>
  <h2>Async Derived Demo</h2>
  <p>Result: {display}</p>

  <button on:click={() => setQuery(1)}>Query 1</button>
  <button on:click={() => setQuery(2)}>Query 2</button>

  <button on:click={() => resolvePrice(1, 1)}>Resolve price 1</button>
  <button on:click={() => resolvePrice(2, 2)}>Resolve price 2</button>

  <button on:click={() => resolveStock(1, 1)}>Resolve stock 1</button>
  <button on:click={() => resolveStock(2, 2)}>Resolve stock 2</button>
</div>