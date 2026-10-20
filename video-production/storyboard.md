svelte
<script lang="ts">
  import { writable, get } from 'svelte/store';
  import { onDestroy } from 'svelte';

  /* ---------- Types ---------- */
  type ResolveFn<T> = (value: T) => void;
  type RejectFn = (reason?: unknown) => void;
  type Deferred<T> = {
    promise: Promise<T>;
    resolve: ResolveFn<T>;
    reject: RejectFn;
  };

  /* ---------- Helpers ---------- */
  /** Create a controllable promise */
  function createDeferred<T>(): Deferred<T> {
    let resolve!: ResolveFn<T>;
    let reject!: RejectFn;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  }

  /** Simple logger with levels */
  const LogLevel = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 } as const;
  type Level = keyof typeof LogLevel;
  const CURRENT_LEVEL = LogLevel.DEBUG;
  function log(level: Level, ...args: unknown[]) {
    if (LogLevel[level] >= CURRENT_LEVEL) {
      console[level.toLowerCase() as keyof Console]('[%s]', level, ...args);
    }
  }

  /** Validate non‑negative integers */
  function assertNonNegInt(value: unknown, name: string): asserts value is number {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
      throw new TypeError(`${name} must be a non‑negative integer`);
    }
  }

  /* ---------- Stores ---------- */
  const query = writable<number>(0);
  const priceDeferred = writable<Deferred<number> | null>(null);
  const stockDeferred = writable<Deferred<number> | null>(null);

  /* ---------- Async derived with version gating ---------- */
  function asyncDerived<T>(
    source: typeof query,
    asyncFn: (value: number) => Promise<T>
  ) {
    const version = writable(0);
    const result = writable<T | null>(null);
    const error = writable<Error | null>(null);

    const unsub = source.subscribe(async (val) => {
      const curVer = ++$version;
      log('DEBUG', 'asyncDerived trigger', { val, curVer });
      try {
        const res = await asyncFn(val);
        if (curVer === $version) {
          result.set(res);
          log('INFO', 'asyncDerived commit', { val, res });
        } else {
          log('DEBUG', 'stale asyncDerived ignored', { val, curVer });
        }
      } catch (e) {
        if (curVer === $version) error.set(e as Error);
        log('ERROR', e);
      }
    });

    onDestroy(unsub);
    return { result, error };
  }

  const priceStore = asyncDerived(query, async (q) => {
    const d = get(priceDeferred);
    if (!d) throw new Error('price promise not created');
    return await d.promise;
  });

  const stockStore = asyncDerived(query, async (q) => {
    const d = get(stockDeferred);
    if (!d) throw new Error('stock promise not created');
    return await d.promise;
  });

  /* ---------- UI actions ---------- */
  function setQuery(v: number) {
    try {
      assertNonNegInt(v, 'query');
      query.set(v);
      priceDeferred.set(createDeferred<number>());
      stockDeferred.set(createDeferred<number>());
      log('INFO', 'query set', v);
    } catch (e) {
      log('ERROR', e);
    }
  }

  function resolvePrice(v: number) {
    try {
      assertNonNegInt(v, 'price');
      const d = get(priceDeferred);
      if (!d) throw new Error('price deferred missing');
      d.resolve(v);
      log('INFO', 'price resolved', v);
    } catch (e) {
      log('ERROR', e);
    }
  }

  function resolveStock(v: number) {
    try {
      assertNonNegInt(v, 'stock');
      const d = get(stockDeferred);
      if (!d) throw new Error('stock deferred missing');
      d.resolve(v);
      log('INFO', 'stock resolved', v);
    } catch (e) {
      log('ERROR', e);
    }
  }

  /* ---------- Reactive values for template ---------- */
  $: $query = $query; // expose for readability
  $: $price = $priceStore.result;
  $: $stock = $stockStore.result;
  $: $priceError = $priceStore.error;
  $: $stockError = $stockStore.error;
</script>

<style>
  button { margin: 0.2rem; }
  .error { color: #c00; }
  .output { font-family: monospace; margin: 1rem 0; }
</style>

<div>
  <h2>Mixed‑version UI demo (Svelte 5.57.2)</h2>

  <p class="output">
    Current: {$query ?? 0}, {$price ?? 0}, {$stock ?? 0}
  </p>

  <section>
    <h3>Controls</h3>
    <button on:click={() => setQuery(1)}>Query 1</button>
    <button on:click={() => setQuery(2)}>Query 2</button>

    <button on:click={() => resolvePrice(1)} disabled={!$priceDeferred}>Resolve price 1</button>
    <button on:click={() => resolvePrice(2)} disabled={!$priceDeferred}>Resolve price 2</button>

    <button on:click={() => resolveStock(1)} disabled={!$stockDeferred}>Resolve stock 1</button>
    <button on:click={() => resolveStock(2)} disabled={!$stockDeferred}>Resolve stock 2</button>
  </section>

  {#if $priceError}
    <p class="error">Price error: {$priceError.message}</p>
  {/if}
  {#if $stockError}
    <p class="error">Stock error: {$stockError.message}</p>
  {/if}
</div>