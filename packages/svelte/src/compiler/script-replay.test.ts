import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { compile } from './index.js';

const experimental = { async: true, scriptReplay: true };
const prefix = 'let input = $state(1); const load = (value) => Promise.resolve(value);';
const first = 'let a = $derived(await load(input));';
const source = `<script>${prefix}${first}
let doubled = $derived(a * 2);
const snapshot = a;
let b = $derived(await load(doubled + snapshot));
</script><button onclick={() => input++}>update</button><output>{a} {doubled} {snapshot} {b}</output>{#if b}<p>{b}</p>{/if}`;

describe('experimental.scriptReplay', () => {
	it('requires async and validates the opt-in', () => {
		expect(() => compile(source, { experimental: { scriptReplay: true } })).toThrow(
			'experimental.scriptReplay requires experimental.async'
		);
		expect(() =>
			compile(source, { experimental: { async: true, scriptReplay: 'yes' as any } })
		).toThrow('experimental.scriptReplay should be true or false');
	});

	it('uses replay by default for supported scripts and leaves SSR unchanged', () => {
		const baseline = compile(source, { experimental: { async: true, scriptReplay: false } }).js
			.code;
		expect(compile(source, { experimental: { async: true } }).js.code).toContain(
			'$.script_replay('
		);
		expect(baseline).toContain('$.run(');
		expect(baseline).not.toContain('script_replay');
		expect(compile(source, { generate: 'server', experimental }).js.code).toBe(
			compile(source, { generate: 'server', experimental: { async: true } }).js.code
		);
	});

	it('leaves synchronous wrappers outside the replay subset', () => {
		const wrapper =
			'<script>import Child from "./Child.svelte";</script><svelte:boundary><Child />{#snippet pending()}loading{/snippet}</svelte:boundary>';
		expect(compile(wrapper, { experimental }).js.code).toBe(
			compile(wrapper, { experimental: { async: true } }).js.code
		);
	});

	it('keeps user initialization in the whole factory with separate producer sites', () => {
		const code = compile(source, { experimental }).js.code;
		expect(code).toContain('$$access.state(0, $.state(1))');
		expect(code.indexOf('let input =')).toBeGreaterThan(code.indexOf('($$bindings, $$access) =>'));
		expect(code.indexOf('const load =')).toBeGreaterThan(code.indexOf('($$bindings, $$access) =>'));
		expect(code).toContain('environment: [');
		expect(code).toContain('reactive: true');
		expect(code).toContain('$.script_accessor($$script, 0).update(1, false)');
		expect(code).toContain('let snapshot;');
		expect(code).toContain("['async', 'derived', 'local', 'async']");
		expect(code).toContain('[0, 1, 1, 2]');
		expect(code).toContain('snapshot = $.get($$bindings[0])');
		expect(code).toContain('() => $$access.read(1)($.get($$bindings[1]) + $.get($$bindings[2]))');
		expect(code).toContain('$.script_value($$script, 2)');
		expect(code).toContain('$.get($.script_binding($$script, 3))');
		expect(code).toContain('$.template_effect(');
		expect(code).toContain('$.async(');
		expect(code).not.toContain('$.script_template_effect(');
		expect(code).not.toContain('$.script_async(');
		expect(code).not.toContain('$.async_derived(');
		expect(code).not.toContain('$.run(');
		expect(code).not.toContain('var a,');
	});

	it('keeps prop accessors, state handles, and live function reads in the environment', () => {
		const code = compile(
			`<script>
		let { n = $bindable(0), input = 1 } = $props();
		let count = $state(n);
		function edit() { count++; }
		const origin = input;
		let value = $derived(await Promise.resolve(input));
		</script><input bind:value={n}><button onclick={edit}>edit</button><output>{origin} {count} {value}</output>`,
			{ experimental }
		).js.code;
		expect(code).toContain('$.prop($$props,');
		expect(code).toContain('read: () => n()');
		expect(code).toContain('read: () => $.get(count)');
		expect(code).toContain('read: () => edit');
		expect(code).toContain('read: () => origin');
		expect(code).toContain('$.script_accessor($$script, 0).assign(');
		expect(code).toMatch(/\$\.script_read\(\$\$script, \d+\)\?\.apply\(this, \$\$args\)/);
		expect(code.indexOf('function edit()')).toBeGreaterThan(
			code.indexOf('($$bindings, $$access) =>')
		);
	});

	it('memoizes immutable prefix const reads without caching mutable locals or functions', () => {
		const code = compile(
			`<script>
		let { input } = $props();
		const key = input;
		let local = 0;
		function helper() { return local; }
		function edit() { local++; helper = () => local; }
		const result = $derived(await Promise.resolve(key));
		</script><button onclick={edit}>edit</button>{key} {local} {helper()} {result}`,
			{ experimental }
		).js.code;
		expect(code).toContain('{ reactive: true, read: () => key }');
		expect(code).toMatch(/reactive: false,\s*read: \(\) => local/);
		expect(code).toMatch(/reactive: false,\s*read: \(\) => helper/);
	});

	it('keeps proxy state as a proxy rather than copying its value into a source', () => {
		const code = compile(
			'<script>const object = $state({ n: 1 }); const value = $derived(await Promise.resolve(1));</script>{object.n} {value}',
			{ experimental }
		).js.code;
		expect(code).toContain('const object = $.proxy(');
		expect(code).not.toContain('$$access.state(');
		expect(code).toContain('read: () => object');
		expect(code).toContain('$.script_read($$script, 0).n');
	});

	it.each(['object.n++', 'object = { n: 2 }'])(
		'keeps unproven external proxy writes explicit: %s',
		(write) => {
			const source = `<script>let object = $state({ n: 0 }); const value = $derived(await Promise.resolve(1));</script><button onclick={() => ${write}}>write</button>{value}`;
			expect(() => compile(source, { experimental })).toThrow(
				'external writes to proxy state before publication'
			);
			expect(compile(source, { experimental: { async: true } }).js.code).toBe(
				compile(source, { experimental: { async: true, scriptReplay: false } }).js.code
			);
		}
	);

	it.each([
		'class Counter { value = $state(0); } const counter = new Counter();',
		'class Counter { #value = $state.raw(0); read() { return this.#value; } } const counter = new Counter();',
		'class Counter { constructor() { this.value = $state(0); } } const counter = new Counter();',
		'class Counter { constructor() { let n = $state(0); this.read = () => n; this.increment = () => n++; } } const counter = new Counter();',
		'function make() { let n = $state(0); return () => n++; } class Counter { constructor() { this.increment = make(); } } const counter = new Counter();',
		'function Counter() { let n = $state(0); this.increment = () => n++; } const counter = new Counter();'
	])('does not claim scalar state registration covers a stateful constructor: %s', (prefix) => {
		const source = `<script>${prefix} const value = $derived(await Promise.resolve(1));</script>{value}`;
		expect(() => compile(source, { experimental })).toThrow(
			'stateful class or constructor initialization'
		);
		expect(compile(source, { experimental: { async: true } }).js.code).toBe(
			compile(source, { experimental: { async: true, scriptReplay: false } }).js.code
		);
	});

	it.each([
		'const counter = new Counter();',
		'const Alias = Counter; const counter = new Alias();',
		'class Child extends Counter {} const counter = new Child();'
	])('recognizes component-module stateful constructor allocation: %s', (prefix) => {
		const source = `<script module>class Counter { value = $state(0); }</script><script>${prefix} const value = $derived(await Promise.resolve(1));</script>{value}`;
		expect(() => compile(source, { experimental })).toThrow(
			'stateful class or constructor initialization'
		);
		expect(compile(source, { experimental: { async: true } }).js.code).toBe(
			compile(source, { experimental: { async: true, scriptReplay: false } }).js.code
		);
	});

	it('retains stateless classes with native prefix captures inside the factory', () => {
		const source =
			'<script>let { input } = $props(); const origin = input; class Snapshot { constructor() { this.origin = origin; } read() { return this.origin; } } const snapshot = new Snapshot(); const value = $derived(await Promise.resolve(input));</script>{snapshot.read()} {value}';
		const code = compile(source, { experimental }).js.code;
		expect(code).toContain('$.script_replay(');
		expect(code.indexOf('class Snapshot')).toBeGreaterThan(
			code.indexOf('($$bindings, $$access) =>')
		);
		expect(code).toContain('this.origin = origin');
		expect(code).not.toContain('$$access.state(');
	});

	it('adds environment readiness to formerly static prefix-only template reads', () => {
		const code = compile(
			'<script>let { input } = $props(); const origin = input; const value = $derived(await Promise.resolve(input));</script><output>{origin}</output>{value}',
			{ experimental }
		).js.code;
		expect(code).toMatch(
			/template_effect[\s\S]*script_read\(\$\$script, 1\)[\s\S]*environment_ready/
		);
	});

	it.each([
		"import { setContext } from 'svelte'; setContext('x', 1);",
		"import { setContext as provide } from 'svelte'; provide('x', 1);",
		"import * as api from 'svelte'; api.setContext('x', 1);",
		"import { setContext } from 'svelte'; const provide = setContext; provide('x', 1);",
		"import { createContext } from 'svelte'; const [read, provide] = createContext(); provide(1);",
		"import { getAllContexts } from 'svelte'; const contexts = getAllContexts(); contexts.set('x', 1);",
		"import { getAllContexts } from 'svelte'; getAllContexts().clear();"
	])('keeps known context mutations entirely on the existing lowering: %s', (prefix) => {
		const source = `<script>${prefix} const value = $derived(await Promise.resolve(1));</script>{value}`;
		expect(() => compile(source, { experimental })).toThrow(
			'per-attempt component context setters'
		);
		expect(compile(source, { experimental: { async: true } }).js.code).toBe(
			compile(source, { experimental: { async: true, scriptReplay: false } }).js.code
		);
	});

	it('recognizes module-declared context setters used by initialization', () => {
		for (const module of [
			"import { createContext } from 'svelte'; const [read, provide] = createContext();",
			"import { setContext } from 'svelte'; function provide(value) { setContext('x', value); }"
		]) {
			const source = `<script module>${module}</script><script>provide(1);const value = $derived(await Promise.resolve(1));</script>{value}`;
			expect(() => compile(source, { experimental })).toThrow(
				'per-attempt component context setters'
			);
		}
	});

	it.each([
		"import { getContext } from 'svelte'; const parent = getContext('x');",
		"import { getAllContexts } from 'svelte'; const parent = getAllContexts().get('x');",
		"import { createContext } from 'svelte'; const [read, provide] = createContext();",
		"import { onMount, onDestroy } from 'svelte'; onMount(() => {}); onDestroy(() => {});",
		'$effect(() => {});'
	])('does not reject readonly context or ordinary lifecycle effects: %s', (prefix) => {
		const source = `<script>${prefix} const value = $derived(await Promise.resolve(1));</script>{value}`;
		expect(compile(source, { experimental }).js.code).toContain('$.script_replay(');
	});

	it.each([
		'function run() { return Promise.resolve().then(() => count++); }',
		'function run() { function update() { count++; } return Promise.resolve().then(update); }',
		'function run() { const callback = mutate; return Promise.reject(0).catch(callback); }',
		'function run() { return Promise.resolve().finally(mutate); }',
		'const callback = mutate.bind(null); function run() { return Promise.resolve().then(callback); }',
		'function run() { return Promise.reject(0).then(null, mutate); }',
		'function middle() { mutate(); } function run() { return Promise.resolve().then(middle); }',
		'function schedule(callback) { return Promise.resolve().then(callback); } function run() { return schedule(mutate); }',
		'function schedule(callback) { queueMicrotask(callback); } function middle(callback) { schedule(callback); } function run() { middle(mutate); return Promise.resolve(1); }',
		'function run() { setTimeout(mutate, 0); return Promise.resolve(1); }',
		'function run() { setInterval(() => mutate(), 1); return Promise.resolve(1); }',
		'function run() { queueMicrotask(() => mutate()); return Promise.resolve(1); }',
		'function run() { requestAnimationFrame(mutate); return Promise.resolve(1); }',
		'function run() { process.nextTick(mutate); return Promise.resolve(1); }',
		'const later = queueMicrotask; function run() { later(mutate); return Promise.resolve(1); }',
		'const host = globalThis; function run() { host.queueMicrotask(mutate); return Promise.resolve(1); }',
		"import { setTimeout as later } from 'node:timers'; function run() { later(mutate, 0); return Promise.resolve(1); }",
		'async function run() { await Promise.resolve(); count++; return 1; }',
		'async function run() { await Promise.resolve(); mutate(); return 1; }',
		'function run() { return new Promise(resolve => { queueMicrotask(() => { count++; resolve(1); }); }); }'
	])('rejects initialization-reachable deferred state writes: %s', (helpers) => {
		const source = `<script>let count = $state(0); function mutate() { count++; } ${helpers} const result = await run();</script>{count} {result}`;
		expect(() => compile(source, { experimental })).toThrow(
			'state writes in deferred initialization callbacks'
		);
		const baseline = compile(source, { experimental: { async: true, scriptReplay: false } }).js
			.code;
		expect(compile(source, { experimental: { async: true } }).js.code).toBe(baseline);
		expect(baseline).not.toContain('$.script_replay(');
	});

	it('follows deferred object mutations through bound callback arguments', () => {
		const source =
			'<script>let object = $state({ count: 0 }); function mutate(value) { value.count++; } const callback = mutate.bind(null, object); function run() { return Promise.resolve().then(callback); } const result = await run();</script>{result}';
		expect(() => compile(source, { experimental })).toThrow(
			'state writes in deferred initialization callbacks'
		);
		expect(compile(source, { experimental: { async: true } }).js.code).toBe(
			compile(source, { experimental: { async: true, scriptReplay: false } }).js.code
		);
	});

	it('follows deferred object mutations through callback parameters', () => {
		const source =
			'<script>let object = $state({ count: 0 }); function mutate(value) { value.count++; } function run() { setTimeout(mutate, 0, object); return Promise.resolve(1); } const result = await run();</script>{result}';
		expect(() => compile(source, { experimental })).toThrow(
			'state writes in deferred initialization callbacks'
		);
		expect(compile(source, { experimental: { async: true } }).js.code).toBe(
			compile(source, { experimental: { async: true, scriptReplay: false } }).js.code
		);
	});

	it.each([
		'function run() { mutate(); return Promise.resolve(1); }',
		'function run() { return new Promise(resolve => { mutate(); resolve(1); }); }',
		'function run() { return new Promise(resolve => setTimeout(resolve, 0)); }',
		'function run() { return Promise.resolve(1).then(value => value + 1); }',
		'async function run() { let local = 0; await Promise.resolve(); local++; return local; }',
		'function run() { return Promise.resolve(1); } function click() { Promise.resolve().then(mutate); }',
		'let { register } = $props(); register(() => count++); function run() { return Promise.resolve(1); }',
		'let { register } = $props(); register(mutate.bind(null)); function run() { return Promise.resolve(1); }',
		"import { invoke } from './helper.js'; function run() { return Promise.resolve(invoke(mutate)); }",
		'let { invoke } = $props(); function run() { return Promise.resolve(invoke(mutate)); }',
		'function setTimeout(callback) { callback(); } function run() { setTimeout(mutate); return Promise.resolve(1); }',
		'function run() { function callback(count) { count++; } return Promise.resolve(1).then(callback); }'
	])('retains controlled synchronous work and unrelated callback registration: %s', (helpers) => {
		const source = `<script>let count = $state(0); function mutate() { count++; } ${helpers} const result = await run();</script>{count} {result}`;
		expect(compile(source, { experimental }).js.code).toContain('$.script_replay(');
	});

	it('leaves an uncalled async event helper outside initializer reachability', () => {
		const source =
			'<script>let count = $state(0); async function click() { await Promise.resolve(); count++; } const result = await Promise.resolve(1);</script><button onclick={click}>update</button>{count} {result}';
		expect(compile(source, { experimental }).js.code).toContain('$.script_replay(');
	});

	it('classifies the resolve-stale deferred writer without any fixture-specific option', () => {
		const source = readFileSync(
			new URL('../../tests/runtime-runes/samples/async-resolve-stale/main.svelte', import.meta.url),
			'utf8'
		);
		expect(() => compile(source, { experimental })).toThrow(
			'state writes in deferred initialization callbacks'
		);
		expect(compile(source, { experimental: { async: true } }).js.code).toBe(
			compile(source, { experimental: { async: true, scriptReplay: false } }).js.code
		);
	});

	it.each([
		['isolation', 'Child'],
		['external-write', 'Child'],
		['self-write', 'Child'],
		['operators', 'main'],
		['derived-purity', 'Child']
	])(
		'admits the actual post-await state fixture by default and in strict mode: %s',
		(sample, component) => {
			const source = readFileSync(
				new URL(
					`../../tests/runtime-runes/samples/async-script-replay-post-await-state-${sample}/${component}.svelte`,
					import.meta.url
				),
				'utf8'
			);
			for (const options of [{ async: true }, experimental]) {
				const code = compile(source, { experimental: options }).js.code;
				expect(code).toContain('$.script_replay(');
				expect(code).toContain("'state'");
				expect(code).not.toContain('$.run(');
			}
			expect(compile(source, { generate: 'server', experimental }).js.code).toBe(
				compile(source, { generate: 'server', experimental: { async: true, scriptReplay: false } })
					.js.code
			);
		}
	);

	it('stores native state handles, reads their value projections, and captures initialized sources', () => {
		const source =
			'<script>let { input, register } = $props(); await Promise.resolve(); let n = $state(input); const snapshot = n; register(() => n++); await Promise.resolve(); const copy = n;</script><input bind:value={n}>{n} {snapshot} {copy}';
		const code = compile(source, { experimental }).js.code;
		expect(code).toContain('n = $$access.state(3, $.state(');
		expect(code).toContain('snapshot = $.get(n)');
		expect(code).toContain('() => $.update(n)');
		expect(code).toContain('copy = $$access.read(3)');
		expect(code).toContain('$.script_read($$script, 3)');
		expect(code).toContain('$.set($.get($.script_binding($$script, 1)), $$value)');
		expect(code).toContain('return [n, snapshot, void 0]');
	});

	it('captures a prior-group Source and native prefix helpers, not another selected view', () => {
		const source =
			'<script>let { register } = $props(); function notify(value) {} await Promise.resolve(); let n = $state(0); await Promise.resolve(); register(() => { n++; notify(n); });</script>{n}';
		const code = compile(source, { experimental }).js.code;
		expect(code).toContain('$.update(n)');
		expect(code).toContain('notify($.get(n))');
		expect(code).not.toContain('notify($$access');
		expect(code).not.toContain('$.untrack(');
	});

	it('keeps callback parameter shadowing lexical', () => {
		const source =
			'<script>let { register } = $props(); await Promise.resolve(); let n = $state(0); let other = $state(0); register((n) => { n++; other++; });</script>{n} {other}';
		const code = compile(source, { experimental }).js.code;
		expect(code).toContain('(n) => {');
		expect(code).toContain('n++;');
		expect(code).toContain('$.update(other)');
		expect(code).not.toContain('$.update(n)');
	});

	it('forces readonly state boxing and preserves raw/proxy initialization', () => {
		const source =
			'<script>await Promise.resolve(); const constant = $state(7); const object = $state({ n: 1 }); let raw = $state.raw({ n: 1 });</script><button onclick={() => raw = { n: 2 }}>replace</button>{constant} {object.n} {raw.n}';
		const code = compile(source, { experimental }).js.code;
		expect(code).toContain('constant = $$access.state(1, $.state(7))');
		expect(code).toContain('object = $$access.state(2, $.state($.proxy(');
		expect(code).toContain('raw = $$access.state(3, $.state({ n: 1 }))');
		expect(code).toContain('$.set($.get($.script_binding($$script, 3)), { n: 2 })');
	});

	it('selects the state write reference before evaluating a reentrant RHS', () => {
		const source =
			'<script>function rhs() { return 1; } await Promise.resolve(); let n = $state(0); await Promise.resolve(); n = rhs();</script><button onclick={() => n = rhs()}>write</button>{n}';
		const code = compile(source, { experimental }).js.code;
		expect(code).toContain('$.set($.get($$bindings[1]), $$access.read(0)(), true)');
		expect(code).toContain(
			'$.set($.get($.script_binding($$script, 1)), $.script_read($$script, 0)(), true)'
		);
	});

	it.each([
		'let n = $state(await Promise.resolve(0));',
		'let n = $state.raw(await Promise.resolve(0));',
		'const [n] = $state([0]);',
		'let n = $state(0); const snapshot = n; register(() => snapshot);',
		'let n = $state(0); const raw = await Promise.resolve(1); register(() => raw);',
		'let n = $state(0); const derived = $derived(n); register(() => derived);',
		'register(() => n++); let n = $state(0);',
		'let n = $state(0); register(() => 1);',
		'let n = $state(0); register(async () => n++);',
		'let n = $state(0); const d = $derived(() => n);',
		'let n = $state(0); const d = $derived(await Promise.resolve(() => n));',
		'let n = $state(0); register(() => () => n++);',
		'let n = $state(0); const edit = () => n++;',
		'let n = $state(0); const d = $derived(n); const snapshot = d;'
	])('keeps unproved state initialization/capture forms explicit: %s', (suffix) => {
		const source = `<script>let { register } = $props(); await Promise.resolve(); ${suffix}</script>`;
		expect(() => compile(source, { experimental })).toThrow(
			'experimental.scriptReplay does not support'
		);
		expect(compile(source, { experimental: { async: true } }).js.code).toBe(
			compile(source, { experimental: { async: true, scriptReplay: false } }).js.code
		);
	});

	it.each(['object.n++', 'object = { n: 2 }'])(
		'applies the existing proxy-write exclusion after an await: %s',
		(write) => {
			const source = `<script>await Promise.resolve(); let object = $state({ n: 0 });</script><button onclick={() => ${write}}>write</button>{object.n}`;
			expect(() => compile(source, { experimental })).toThrow(
				'external writes to proxy state before publication'
			);
			expect(compile(source, { experimental: { async: true } }).js.code).toBe(
				compile(source, { experimental: { async: true, scriptReplay: false } }).js.code
			);
		}
	);

	it('classifies unsupported default scripts without leaving replay metadata behind', () => {
		const unsupported = `<script>${prefix}${first}</script><my-element value={a}></my-element>`;
		const baseline = compile(unsupported, { experimental: { async: true, scriptReplay: false } }).js
			.code;
		expect(compile(unsupported, { experimental: { async: true } }).js.code).toBe(baseline);
		expect(baseline).not.toContain('$$script');
		expect(() => compile(unsupported, { experimental })).toThrow('custom-element readiness');
	});

	it('separates statement stages from published binding slots', () => {
		const code = compile(
			`<script>${prefix}
		console.log('prefix');
		await load(input);
		const snapshot = await load(input);
		console.log(snapshot);
		let value = $derived(await load(input + snapshot));
		console.log(value);
		</script><output>{value} {snapshot}</output>`,
			{ experimental: { async: true } }
		).js.code;
		expect(code).toContain("['await', 'await', 'statement', 'async', 'statement']");
		expect(code).toContain('$.script_value($$script, 1)');
		expect(code).toContain('$.script_binding($$script, 3)');
		expect(code).toContain('void console.log($.get($$bindings[1]))');
		expect(code).not.toContain('$.run(');
		expect(code).not.toContain('await ');
	});

	it('keeps synchronous groups atomic and their direct local reads lexical', () => {
		const code = compile(
			`<script>${prefix}await load(input);
		const a = input; const b = a + 1; console.log(b);
		</script>{b}`,
			{ experimental: { async: true } }
		).js.code;
		expect(code).toContain('b = a + 1;');
		expect(code).toContain('void console.log(b);');
		expect(code).toContain('return [a, b, void 0]');
		expect(code).toContain('[[1, 4, 4]]');
	});

	it('does not read an unpublished local through a same-group derived', () => {
		const unsupported = `<script>${prefix}await load(input);
		const b = input; let d = $derived(b); const c = d;
		</script>{c}`;
		expect(() => compile(unsupported, { experimental })).toThrow(
			'same-group local dependencies through deriveds'
		);
		expect(compile(unsupported, { experimental: { async: true } }).js.code).toBe(
			compile(unsupported, { experimental: { async: true, scriptReplay: false } }).js.code
		);
		const supported = `<script>${prefix}await load(input);
		const b = input; let d = $derived(b);
		</script>{d}`;
		expect(compile(supported, { experimental }).js.code).toContain('$.script_replay(');
	});

	it.each([
		['inline await', 'let value = $derived(1 + await load(input));'],
		['nested await', 'let value = $derived(await load(await load(input)));'],
		['awaiting state', 'let value = $state(await load(input));'],
		['nested rune', 'let value = Number($state.snapshot(a));'],
		['derived.by', 'let value = $derived.by(() => a);'],
		['destructuring', 'const [value] = [a];'],
		['multiple declarators', 'const value = a, other = a;'],
		['closure', 'const value = () => a;'],
		['function', 'function value() { return a; }'],
		['class', 'class Value {}'],
		['assignment', 'let value = 0; value = a;'],
		['nested assignment', 'let value = 0; const other = (value = a);'],
		['control flow', 'if (a) input++;'],
		['override', 'a = 2;'],
		['effect', '$effect(() => console.log(a));']
	])('rejects unsupported suffix %s rather than using shared variables', (_, suffix) => {
		expect(() =>
			compile(`<script>${prefix}${first}${suffix}</script><output>{a}</output>`, { experimental })
		).toThrow('experimental.scriptReplay does not support');
	});

	it('rejects references to later replay bindings', () => {
		expect(() =>
			compile(
				`<script>${prefix}let a = $derived(await load(later)); const later = 1;</script>{a}`,
				{ experimental }
			)
		).toThrow('forward references to replay bindings');
	});

	it('updates blocker objects cached while flattening else-if chains', () => {
		const code = compile(
			`<script>let foo = $state(false); let blocking = $derived(await foo); let bar = Promise.resolve(true);</script>
		{#if foo}foo{:else if await bar}bar{:else}else{/if}
		{#if foo}foo{:else if !blocking}blocking{:else}else{/if}`,
			{ experimental: { async: true } }
		).js.code;
		expect(code).toContain('$.script_replay(');
		expect(code).not.toContain('$$promises');
	});

	it.each(['const value = mutate();', 'const value = await mutate();', 'await mutate();'])(
		'runs an imperative state-mutating initializer in the initialization context: %s',
		(suffix) => {
			const source = `<script>${prefix}function inner() { input++; return input; } function mutate() { return inner(); } ${first}${suffix}</script>{a}`;
			const code = compile(source, { experimental }).js.code;
			expect(code).toContain('$.script_replay(');
			expect(code).not.toContain('$.run(');
			expect(code).toContain('$$access.read(3)()');
		}
	);

	it('keeps initialization reads tracked and selects prefix helpers through the facade', () => {
		const code = compile(
			`<script>${prefix}function mutate() { input++; } ${first}mutate(); const snapshot = input;</script>{a} {snapshot}`,
			{ experimental }
		).js.code;
		expect(code).not.toContain('$.untrack(');
		expect(code).toContain('void $$access.read(2)()');
		expect(code).toContain('snapshot = $$access.read(0)');
	});

	it('keeps template shadowing lexical', () => {
		const code = compile(
			`<script>${prefix}${first}</script><button onclick={(a) => console.log(a)}>{a}</button>`,
			{ experimental }
		).js.code;
		expect(code).toContain('(a) => console.log(a)');
		expect(code).toContain('$.get($.script_binding($$script, 0))');
	});

	it('rejects prefix closures capturing replay bindings', () => {
		expect(() =>
			compile(`<script>${prefix} const read = () => a; ${first}</script>{read()}`, { experimental })
		).toThrow('prefix captures of replay bindings');
	});

	it.each([
		['template awaits', '{await load(a)}'],
		['each', '{#each [a] as value}{value}{/each}'],
		['prefix state binding', '<input bind:value={input}>'],
		['action', '<div use:load={a}></div>']
	])('uses the ordinary readiness contract for %s', (_, template) => {
		const code = compile(`<script>${prefix}${first}</script>${template}`, {
			experimental: { async: true }
		}).js.code;
		expect(code).toContain('$.script_replay(');
		expect(code).not.toContain('$.script_template_effect(');
		expect(code).not.toContain('$.script_async(');
	});

	it.each([
		['const', '{@const value = a}{value}'],
		['binding', '<input bind:value={a}>'],
		['spread', '<div {...a}></div>'],
		['custom element', '<my-element value={a}></my-element>']
	])('rejects unsupported readiness consumer %s', (_, template) => {
		expect(() =>
			compile(`<script>${prefix}${first}</script>${template}`, { experimental })
		).toThrow();
	});
});
