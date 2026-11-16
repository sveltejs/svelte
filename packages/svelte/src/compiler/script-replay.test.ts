import { describe, expect, it } from 'vitest';
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

	it('separates the stable shell, fresh locals, producer sites and readiness', () => {
		const code = compile(source, { experimental }).js.code;
		expect(code).toContain('let input = $.state(1)');
		expect(code).toContain('let snapshot;');
		expect(code).toContain("['async', 'derived', 'local', 'async']");
		expect(code).toContain('[0, 1, 1, 2]');
		expect(code).toContain('snapshot = $.get($$bindings[0])');
		expect(code).toContain('() => load($.get($$bindings[1]) + $.get($$bindings[2]))');
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
		expect(code).toContain('$.untrack(() => void console.log(b));');
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
		['state', 'let value = $state(1);'],
		['nested rune', 'let value = Number($state.snapshot(a));'],
		['derived.by', 'let value = $derived.by(() => a);'],
		['destructuring', 'const [value] = [a];'],
		['multiple declarators', 'const value = a, other = a;'],
		['closure', 'const value = () => a;'],
		['function', 'function value() { return a; }'],
		['class', 'class Value {}'],
		['assignment', 'input = a;'],
		['nested assignment', 'const value = (input = a);'],
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
		'keeps a known state-mutating initializer on the old path: %s',
		(suffix) => {
			const source = `<script>${prefix}function inner() { input++; return input; } function mutate() { return inner(); } ${first}${suffix}</script>{a}`;
			expect(() => compile(source, { experimental })).toThrow(
				'state-mutating local or raw-await initializers'
			);
			expect(compile(source, { experimental: { async: true } }).js.code).toBe(
				compile(source, { experimental: { async: true, scriptReplay: false } }).js.code
			);
		}
	);

	it('untracks ordinary statement side effects without untracking local values', () => {
		const code = compile(
			`<script>${prefix}function mutate() { input++; } ${first}mutate(); const snapshot = input;</script>{a} {snapshot}`,
			{ experimental }
		).js.code;
		expect(code).toContain('$.untrack(() => void mutate())');
		expect(code).toContain('snapshot = $.get(input)');
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
