import * as g from '@teasel/parser/grammar';

const value = { value: g.bind(g.js.pattern) };
const error = { error: g.bind(g.js.pattern) };
const transition = { expression: g.value.expression };

/** The template language, as the parser reads it: its elements and their fields, its directives, its blocks and tags. */
export const grammar = g.grammar('svelte', {
	document: g.node(
		'Root',
		{
			css: g.doc.style,
			js: g.literal([]),
			options: g.literal(null),
			comments: g.doc.comments,
			module: g.optional(g.doc.module)
		},
		g.scope({ instance: g.optional(g.doc.script) }, g.scope({ fragment: g.content }))
	),
	fragment: g.node('Fragment', g.scope({ nodes: g.nodes })),
	text: g.node('Text', { data: g.text.data, raw: g.text.raw }),
	comment: g.node('Comment', { data: g.text.data }),
	attributes: { shorthand: ['{', '}'] },
	autoclose: true,
	trim: true,
	void: [
		'area',
		'base',
		'br',
		'col',
		'command',
		'embed',
		'hr',
		'img',
		'input',
		'keygen',
		'link',
		'meta',
		'param',
		'source',
		'track',
		'wbr'
	],

	elements: {
		fields: { name: g.element.tag, attributes: g.element.attributes, fragment: g.content },
		rules: {
			// `this` stays an attribute: a value mixing text and expressions warns where it is promoted
			'svelte:element': g.node('SvelteElement'),
			'svelte:component': g.node('SvelteComponent', { expression: g.element.this }),
			'svelte:self': g.node('SvelteSelf'),
			'svelte:window': { node: 'SvelteWindow', root: true, once: true },
			'svelte:document': { node: 'SvelteDocument', root: true, once: true },
			'svelte:body': { node: 'SvelteBody', root: true, once: true },
			'svelte:head': { node: 'SvelteHead', root: true, once: true },
			'svelte:options': { node: 'SvelteOptions', root: true, once: true },
			'svelte:fragment': g.node('SvelteFragment'),
			'svelte:boundary': g.node('SvelteBoundary'),
			title: { node: 'TitleElement', inside: 'svelte:head' },
			slot: { node: 'SlotElement', outside: 'shadowrootmode' },
			textarea: { node: 'RegularElement', content: 'rcdata' },
			script: { node: 'RegularElement', content: 'raw' },
			style: { node: 'RegularElement', content: 'raw' }
		},
		component: g.node('Component'),
		other: g.node('RegularElement')
	},

	script: {
		element: 'script',
		module: [['context', 'module'], ['module']],
		typescript: [['lang', 'ts']]
	},
	style: 'style',

	directives: {
		arg: ':',
		modifier: '|',
		fields: { name: g.directive.arg, modifiers: g.directive.modifiers },
		rules: {
			bind: {
				node: 'BindDirective',
				form: [{ expression: g.orArg(g.value.expression) }],
				unique: 'attributes'
			},
			on: g.node('OnDirective', g.opt({ expression: g.value.expression })),
			use: g.node('UseDirective', g.opt({ expression: g.value.expression })),
			class: {
				node: 'ClassDirective',
				form: [{ expression: g.orArg(g.value.expression) }],
				unique: 'kind'
			},
			style: { node: 'StyleDirective', form: [{ value: g.value.raw }], unique: 'kind' },
			transition: g.node('TransitionDirective', g.opt(transition), {
				intro: g.literal(true),
				outro: g.literal(true)
			}),
			in: g.node('TransitionDirective', g.opt(transition), {
				intro: g.literal(true),
				outro: g.literal(false)
			}),
			out: g.node('TransitionDirective', g.opt(transition), {
				intro: g.literal(false),
				outro: g.literal(true)
			}),
			animate: g.node('AnimateDirective', g.opt({ expression: g.value.expression })),
			let: g.node('LetDirective', { expression: g.bind(g.orArg(g.value.pattern)) })
		}
	},

	constructs: {
		if: {
			node: 'IfBlock',
			open: {
				marker: ['{', '#if'],
				space: true,
				form: [{ test: g.js.expression }, '}', { consequent: g.content }]
			},
			branches: [
				{
					marker: ['{', ':else', 'if'],
					space: true,
					form: [{ test: g.js.expression }, '}', { consequent: g.content }],
					reopen: ['alternate', 'elseif']
				},
				{ marker: ['{', ':else'], form: ['}', { alternate: g.content }] }
			],
			close: { marker: ['{', '/if'], form: ['}'] }
		},
		each: {
			node: 'EachBlock',
			open: {
				marker: ['{', '#each'],
				space: true,
				form: [
					{ expression: g.js.expression },
					g.opt('as', { context: g.bind(g.js.pattern) }),
					g.opt(',', { index: g.optional(g.bind(g.js.identifier)) }),
					g.opt('(', { key: g.optional(g.js.expression) }, ')'),
					'}',
					{ body: g.content }
				]
			},
			branches: [{ marker: ['{', ':else'], form: ['}', { fallback: g.optional(g.content) }] }],
			close: { marker: ['{', '/each'], form: ['}'] }
		},
		await: {
			node: 'AwaitBlock',
			open: {
				marker: ['{', '#await'],
				space: true,
				form: [
					{ expression: g.js.expression },
					g.oneOf(
						['then', g.opt(value), '}', { then: g.content }],
						['catch', g.opt(error), '}', { catch: g.content }],
						['}', { pending: g.content }]
					)
				]
			},
			branches: [
				{ marker: ['{', ':then'], form: [g.opt(value), '}', { then: g.content }] },
				{ marker: ['{', ':catch'], form: [g.opt(error), '}', { catch: g.content }] }
			],
			close: { marker: ['{', '/await'], form: ['}'] }
		},
		key: {
			node: 'KeyBlock',
			open: {
				marker: ['{', '#key'],
				space: true,
				form: [{ expression: g.js.expression }, '}', { fragment: g.content }]
			},
			close: { marker: ['{', '/key'], form: ['}'] }
		},
		snippet: {
			node: 'SnippetBlock',
			open: {
				marker: ['{', '#snippet'],
				space: true,
				form: [
					{ expression: g.bind.outside(g.js.identifier) },
					g.opt({ typeParams: g.optional(g.js.typeParameters) }),
					{ parameters: g.bind(g.js.params) },
					'}',
					{ body: g.content }
				]
			},
			close: { marker: ['{', '/snippet'], form: ['}'] }
		},
		html: {
			node: 'HtmlTag',
			open: { marker: ['{', '@html'], space: true, form: [{ expression: g.js.expression }, '}'] }
		},
		debug: {
			node: 'DebugTag',
			open: { marker: ['{', '@debug'], form: [{ identifiers: g.js.identifiers }, '}'] }
		},
		const: {
			node: 'ConstTag',
			open: { marker: ['{', '@const'], space: true, form: [{ declaration: g.js.const }, '}'] }
		},
		render: {
			node: 'RenderTag',
			open: { marker: ['{', '@render'], space: true, form: [{ expression: g.js.expression }, '}'] }
		},
		attach: {
			node: 'AttachTag',
			in: ['attributes'],
			open: { marker: ['{', '@attach'], space: true, form: [{ expression: g.js.expression }, '}'] }
		},
		spread: {
			node: 'SpreadAttribute',
			in: ['attributes'],
			open: { marker: ['{', '...'], form: [{ expression: g.js.expression }, '}'] }
		},
		declaration: {
			node: 'DeclarationTag',
			open: { marker: ['{'], form: [{ declaration: g.js.statement }, '}'] }
		},
		expression: {
			node: 'ExpressionTag',
			in: ['content', 'value', 'rcdata'],
			open: { marker: ['{'], form: [{ expression: g.js.expression }, '}'] }
		}
	}
});
