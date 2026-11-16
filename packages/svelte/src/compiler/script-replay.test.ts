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

	it('leaves default lowering and SSR unchanged', () => {
		const baseline = compile(source, { experimental: { async: true } }).js.code;
		expect(compile(source, { experimental: { async: true, scriptReplay: false } }).js.code).toBe(
			baseline
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
		expect(code).toContain('() => snapshot = $.get($$bindings[0])');
		expect(code).toContain('() => load($.get($$bindings[1]) + $.get($$bindings[2]))');
		expect(code).toContain('$.script_value($$script, 2)');
		expect(code).toContain('$.get($.script_binding($$script, 3))');
		expect(code).toContain('$.script_template_effect(');
		expect(code).toContain('$.script_async(');
		expect(code).not.toContain('$.async_derived(');
		expect(code).not.toContain('$.run(');
		expect(code).not.toContain('var a,');
	});

	it.each([
		['raw await', 'const value = await load(input);'],
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
		['const', '{@const value = a}{value}'],
		['binding', '<input bind:value={a}>'],
		['action', '<div use:load={a}></div>'],
		['spread', '<div {...a}></div>'],
		['custom element', '<my-element value={a}></my-element>']
	])('rejects unsupported readiness consumer %s', (_, template) => {
		expect(() =>
			compile(`<script>${prefix}${first}</script>${template}`, { experimental })
		).toThrow();
	});
});
