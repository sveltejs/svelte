export * from './index.js';
export type {
	MarkupPreprocessor,
	Preprocessor,
	PreprocessorGroup,
	Processed
} from './preprocess/public';
export type {
	CompileError,
	CompileOptions,
	ModuleCompileOptions,
	CompileResult,
	Warning
} from './types/index';

export type {
	AnimateDirective,
	Attribute,
	AwaitBlock,
	BindDirective,
	ClassDirective,
	Comment,
	Component,
	ConstTag,
	DebugTag,
	EachBlock,
	ExpressionTag,
	Fragment,
	HtmlTag,
	IfBlock,
	KeyBlock,
	LetDirective,
	OnDirective,
	RegularElement,
	RenderTag,
	Root,
	Script,
	SlotElement,
	StyleDirective,
	SvelteBody,
	SvelteComponent,
	SvelteDocument,
	SvelteElement,
	SvelteFragment,
	SvelteHead,
	SvelteWindow,
	SvelteSelf,
	SnippetBlock,
	SpreadAttribute,
	Text,
	TitleElement,
	TransitionDirective,
	UseDirective
} from './types/template';
