import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { tags as t } from '@lezer/highlight';

const ERROR_HUE = 0;
const WARNING_HUE = 40;

const WARNING_FG = `hsl(${WARNING_HUE} 100% 40%)`;
const WARNING_BG = `hsl(${WARNING_HUE} 100% 40% / 0.5)`;

const ERROR_FG = `hsl(${ERROR_HUE} 100% 40%)`;
const ERROR_BG = `hsl(${ERROR_HUE} 100% 40% / 0.5)`;

/**
 * @param {string} content
 * @param {string} attrs
 */
function svg(content, attrs = `viewBox="0 0 40 40"`) {
	return `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" ${attrs}>${encodeURIComponent(
		content
	)}</svg>')`;
}

/**
 * @param {string} color
 */
function underline(color) {
	return svg(
		`<path d="m0 3.5 l2 -1.5 l1 0 l2 1.5 l1 0" stroke="${color}" fill="none" stroke-width="1"/>`,
		`width="6" height="4"`
	);
}

const svelteThemeStyles = EditorView.theme(
	{
		'&': {
			color: 'var(--sk-code-base)',
			backgroundColor: 'transparent'
		},

		'.cm-content': {
			caretColor: 'var(--sk-theme-3)'
		},

		'.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--sk-theme-3)' },
		'&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
			{ backgroundColor: 'var(--sk-selection-color)' },

		'.cm-panels': { backgroundColor: 'var(--sk-back-2)', color: 'var(--sk-text-2)' },
		'.cm-panels.cm-panels-top': { borderBottom: '2px solid black' },
		'.cm-panels.cm-panels-bottom': { borderTop: '2px solid black' },

		'.cm-searchMatch': {
			backgroundColor: 'var(--sk-theme-2)'
			// outline: '1px solid #457dff',
		},
		'.cm-searchMatch.cm-searchMatch-selected': {
			backgroundColor: '#6199ff2f'
		},

		'.cm-activeLine': { backgroundColor: '#6699ff0b' },
		'.cm-selectionMatch': { backgroundColor: '#aafe661a' },

		'&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket': {
			backgroundColor: '#bad0f847'
		},

		'.cm-gutters': {
			backgroundColor: 'var(--sk-back-3)',
			border: 'none'
		},

		'.cm-activeLineGutter': {
			backgroundColor: 'var(--sk-back-4)'
		},

		'.cm-foldPlaceholder': {
			backgroundColor: 'transparent',
			border: 'none',
			color: '#ddd'
		},

		'.cm-tooltip': {
			border: 'none',
			backgroundColor: 'var(--sk-back-3)'
		},
		'.cm-diagnostic': {
			padding: '0.2em 0.4em',
			backgroundColor: 'var(--sk-back-3)',
			color: 'var(--sk-text-1)',
			border: 'none',
			borderRadius: '2px',
			position: 'relative',
			top: '2px',
			zIndex: 2
		},
		'.cm-diagnostic-error': {
			border: `1px solid ${ERROR_FG}`,
			filter: `drop-shadow(0px 0px 6px ${ERROR_BG})`
		},
		'.cm-diagnostic-warning': {
			border: `1px solid ${WARNING_FG}`,
			filter: `drop-shadow(0px 0px 6px ${WARNING_BG})`
		},
		// https://github.com/codemirror/lint/blob/271b35f5d31a7e3645eaccbfec608474022098e1/src/lint.ts#L620
		'.cm-lintRange': {
			backgroundPosition: 'left bottom',
			backgroundRepeat: 'repeat-x',
			paddingBottom: '4px'
		},
		'.cm-lintRange-error': {
			backgroundImage: underline(ERROR_FG)
		},
		'.cm-lintRange-warning': {
			backgroundImage: underline(WARNING_FG)
		},
		'.cm-tooltip .cm-tooltip-arrow:before': {
			borderTopColor: 'transparent',
			borderBottomColor: 'transparent'
		},
		'.cm-tooltip .cm-tooltip-arrow:after': {
			borderTopColor: 'var(--sk-back-3)',
			borderBottomColor: 'var(--sk-back-3)'
		},
		'.cm-tooltip-autocomplete': {
			color: 'var(--sk-text-2) !important',
			perspective: '1px',
			'& > ul > li[aria-selected]': {
				backgroundColor: 'var(--sk-back-4)',
				color: 'var(--sk-text-1) !important'
			}
		}
	},
	{ dark: true }
);

/// The highlighting style for code in the One Dark theme.
const svelteHighlightStyle = HighlightStyle.define([
	{ tag: t.keyword, color: 'var(--sk-code-keyword)' },
	{
		tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],
		color: 'var(--sk-code-base)'
	},
	{ tag: [t.function(t.variableName), t.labelName], color: 'var(--sk-code-tags)' },
	{ tag: [t.color, t.constant(t.name), t.standard(t.name)], color: 'var(--sk-code-base)' },
	{ tag: [t.definition(t.name), t.separator], color: 'var(--sk-code-base)' },
	{
		tag: [
			t.typeName,
			t.className,
			t.number,
			t.changed,
			t.annotation,
			t.modifier,
			t.self,
			t.namespace
		],
		color: 'var(--sk-code-tags)'
	},
	{
		tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)],
		color: 'var(--sk-code-base)'
	},
	{ tag: [t.meta, t.comment], color: 'var(--sk-code-comment)' },
	{ tag: t.strong, fontWeight: 'bold' },
	{ tag: t.emphasis, fontStyle: 'italic' },
	{ tag: t.strikethrough, textDecoration: 'line-through' },
	{ tag: t.link, color: 'var(--sk-code-base)', textDecoration: 'underline' },
	{ tag: t.heading, fontWeight: 'bold', color: 'var(--sk-text-1)' },
	{ tag: [t.atom, t.bool], color: 'var(--sk-code-atom)' },
	{ tag: [t.processingInstruction, t.string, t.inserted], color: 'var(--sk-code-string)' },
	{ tag: t.invalid, color: '#ff008c' }
]);

export const svelteTheme = [svelteThemeStyles, syntaxHighlighting(svelteHighlightStyle)];
