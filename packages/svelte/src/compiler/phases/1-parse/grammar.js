import * as g from '@teasel/parser/grammar';

const value = { value: g.bind(g.js.pattern) };
const error = { error: g.bind(g.js.pattern) };
const resolved = g.seq(g.opt(value), { then: g.content });
const rejected = g.seq(g.opt(error), { catch: g.content });
const transition = { expression: g.value.expression };

/** The template language, as the parser reads it: the delimiters, the elements and their fields, the directives and the blocks. */
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
	delimiters: ['{', '}'],
	attributes: { expressions: true, shorthand: true },
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
			'svelte:element': g.element(g.node('SvelteElement')),
			'svelte:component': g.element(g.node('SvelteComponent', { expression: g.element.this })),
			'svelte:self': g.element(g.node('SvelteSelf')),
			'svelte:window': g.element(g.node('SvelteWindow'), { root: true, once: true }),
			'svelte:document': g.element(g.node('SvelteDocument'), { root: true, once: true }),
			'svelte:body': g.element(g.node('SvelteBody'), { root: true, once: true }),
			'svelte:head': g.element(g.node('SvelteHead'), { root: true, once: true }),
			'svelte:options': g.element(g.node('SvelteOptions'), { root: true, once: true }),
			'svelte:fragment': g.element(g.node('SvelteFragment')),
			'svelte:boundary': g.element(g.node('SvelteBoundary')),
			title: g.element(g.node('TitleElement'), { inside: 'svelte:head' }),
			slot: g.element(g.node('SlotElement'), { outside: 'shadowrootmode' }),
			textarea: g.element(g.node('RegularElement'), { content: 'rcdata' }),
			script: g.element(g.node('RegularElement'), { content: 'raw' }),
			style: g.element(g.node('RegularElement'), { content: 'raw' })
		},
		component: g.element(g.node('Component')),
		other: g.element(g.node('RegularElement'))
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
			bind: g.directive(g.node('BindDirective', { expression: g.orArg(g.value.expression) }), {
				unique: 'attributes'
			}),
			on: g.directive(g.node('OnDirective', g.opt({ expression: g.value.expression }))),
			use: g.directive(g.node('UseDirective', g.opt({ expression: g.value.expression }))),
			class: g.directive(g.node('ClassDirective', { expression: g.orArg(g.value.expression) }), {
				unique: 'kind'
			}),
			style: g.directive(g.node('StyleDirective', { value: g.value.raw }), { unique: 'kind' }),
			transition: g.directive(
				g.node('TransitionDirective', g.opt(transition), {
					intro: g.literal(true),
					outro: g.literal(true)
				})
			),
			in: g.directive(
				g.node('TransitionDirective', g.opt(transition), {
					intro: g.literal(true),
					outro: g.literal(false)
				})
			),
			out: g.directive(
				g.node('TransitionDirective', g.opt(transition), {
					intro: g.literal(false),
					outro: g.literal(true)
				})
			),
			animate: g.directive(g.node('AnimateDirective', g.opt({ expression: g.value.expression }))),
			let: g.directive(g.node('LetDirective', { expression: g.bind(g.orArg(g.value.pattern)) }))
		}
	},
	spread: 'SpreadAttribute',

	sigils: {
		open: '#',
		branch: ':',
		close: '/',
		tag: '@',
		blocks: {
			if: g.block(g.node('IfBlock', { test: g.js.expression }, { consequent: g.content }), {
				branches: {
					'else if': g.reopen('alternate', 'elseif'),
					else: [{ alternate: g.content }]
				}
			}),
			each: g.block(
				g.node(
					'EachBlock',
					{ expression: g.js.expression },
					g.opt('as', { context: g.bind(g.js.pattern) }),
					g.opt(',', { index: g.optional(g.bind(g.js.identifier)) }),
					g.opt('(', { key: g.optional(g.js.expression) }, ')'),
					{ body: g.content }
				),
				{ branches: { else: [{ fallback: g.optional(g.content) }] } }
			),
			await: g.block(
				g.node(
					'AwaitBlock',
					{ expression: g.js.expression },
					g.oneOf(['then', ...resolved], ['catch', ...rejected], [{ pending: g.content }])
				),
				{ branches: { then: resolved, catch: rejected } }
			),
			key: g.block(g.node('KeyBlock', { expression: g.js.expression }, { fragment: g.content })),
			snippet: g.block(
				g.node(
					'SnippetBlock',
					{ expression: g.bind.outside(g.js.identifier) },
					g.opt({ typeParams: g.optional(g.js.typeParameters) }),
					{ parameters: g.bind(g.js.params) },
					{ body: g.content }
				)
			)
		},
		tags: {
			html: g.tag(g.node('HtmlTag', { expression: g.js.expression })),
			debug: g.tag(g.node('DebugTag', { identifiers: g.js.identifiers })),
			const: g.tag(g.node('ConstTag', { declaration: g.js.const })),
			render: g.tag(g.node('RenderTag', { expression: g.js.expression })),
			attach: g.tag(g.node('AttachTag', { expression: g.js.expression }), { among: 'attributes' })
		}
	},
	declaration: g.node('DeclarationTag', { declaration: g.js.statement }),
	expression: g.node('ExpressionTag', { expression: g.js.expression })
});
