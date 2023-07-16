import { AssignmentExpression, Node, Program } from 'estree';
import { SourceMap } from 'magic-string';

interface BaseNode {
	start: number;
	end: number;
	type: string;
	children?: TemplateNode[];
	[prop_name: string]: any;
}

export interface Fragment extends BaseNode {
	type: 'Fragment';
	children: TemplateNode[];
}

export interface Text extends BaseNode {
	type: 'Text';
	data: string;
}

export interface MustacheTag extends BaseNode {
	type: 'MustacheTag' | 'RawMustacheTag';
	expression: Node;
}

export interface Comment extends BaseNode {
	type: 'Comment';
	data: string;
	ignores: string[];
}

export interface ConstTag extends BaseNode {
	type: 'ConstTag';
	expression: AssignmentExpression;
}

interface DebugTag extends BaseNode {
	type: 'DebugTag';
	identifiers: Node[];
}

export type DirectiveType =
	| 'Action'
	| 'Animation'
	| 'Binding'
	| 'Class'
	| 'StyleDirective'
	| 'EventHandler'
	| 'Let'
	| 'Ref'
	| 'Transition';

export interface BaseDirective extends BaseNode {
	type: DirectiveType;
	name: string;
}

interface BaseExpressionDirective extends BaseDirective {
	type: DirectiveType;
	expression: null | Node;
	name: string;
	modifiers: string[];
}

export interface Element extends BaseNode {
	type:
		| 'InlineComponent'
		| 'SlotTemplate'
		| 'Title'
		| 'Slot'
		| 'Element'
		| 'Head'
		| 'Options'
		| 'Window'
		| 'Document'
		| 'Body';
	attributes: Array<BaseDirective | Attribute | SpreadAttribute>;
	name: string;
}

export interface Attribute extends BaseNode {
	type: 'Attribute';
	name: string;
	value: any[];
}

export interface SpreadAttribute extends BaseNode {
	type: 'Spread';
	expression: Node;
}

export interface Transition extends BaseExpressionDirective {
	type: 'Transition';
	intro: boolean;
	outro: boolean;
}

export type Directive = BaseDirective | BaseExpressionDirective | Transition;

export type TemplateNode =
	| Text
	| ConstTag
	| DebugTag
	| MustacheTag
	| BaseNode
	| Element
	| Attribute
	| SpreadAttribute
	| Directive
	| Transition
	| Comment;

export interface Parser {
	readonly template: string;
	readonly filename?: string;

	index: number;
	stack: Node[];

	html: Node;
	css: Node;
	js: Node;
	meta_tags: {};
}

export interface Script extends BaseNode {
	type: 'Script';
	context: string;
	content: Program;
}

export interface Style extends BaseNode {
	type: 'Style';
	attributes: any[]; // TODO
	children: any[]; // TODO add CSS node types
	content: {
		start: number;
		end: number;
		styles: string;
	};
}

export interface Ast {
	html: TemplateNode;
	css?: Style;
	instance?: Script;
	module?: Script;
}

export interface Warning {
	start?: { line: number; column: number; pos?: number };
	end?: { line: number; column: number };
	pos?: number;
	code: string;
	message: string;
	filename?: string;
	frame?: string;
	toString: () => string;
}

export type EnableSourcemap = boolean | { js: boolean; css: boolean };

export type CssHashGetter = (args: {
	name: string;
	filename: string | undefined;
	css: string;
	hash: (input: string) => string;
}) => string;

export interface CompileOptions {
	/**
	 * définit le nom de la classe JavaScript généré (bien que le compilateur la renomera si son nom entre en conflit avec une autre variable).
	 * Il est normalement inféré à partir l'option `filename`.
	 *
	 * @default 'Component'
	 */
	name?: string;

	/**
	 * utilisée pour les conseils de déboggage et les <span class="vo">[sourcemaps](/docs/web#sourcemap)</span>.
	 * Le <span class="vo">[plugin](/docs/development#plugin)</span> du <span class="vo">[bundler](/docs/web#bundler-packager)</span> la définit automatiquement.
	 *
	 * @default null
	 */
	filename?: string;

	/**
	 * Si `"dom"`: Svelte émet une classe JavaScript pour monter le composant dans le <span class="vo">[DOM](/docs/web#dom)</span>.
	 *
	 * Si `"ssr"`: Svelte émet un objet avec une méthode `render`, appropriée pour les rendus côté serveur.
	 *
	 * Si `false`: aucun JavaScript ni CSS n'est émis, seules les <span class="vo">[metadata](/docs/web#metadata)</span> sont retournées.
	 *
	 * @default 'dom'
	 */
	generate?: 'dom' | 'ssr' | false;

	/**
	 * Si `"throw"`: Svelte lève une exception lorsqu'il rencontre une erreur de compilation.
	 *
	 * Si `"warn"`: Svelte traitera les erreurs comme des <span class="vo">[warnings](/docs/development#warning)</span> et les ajoutera au rapport de <span class="vo">[warnings](/docs/development#warning)</span>.
	 *
	 * @default 'throw'
	 */
	errorMode?: 'throw' | 'warn';

	/**
	 * Si `"strict"`: Svelte retourne un rapport de variables ne contenant que celles qui ne sont ni globales (_globals_) ni internes (_internals_).
	 *
	 * Si `"full"`: Svelte retourne un rapport de variables avec toutes les variables détectées.
	 *
	 * Si `false`: aucun rapport n'est retourné.
	 *
	 * @default 'strict'
	 */
	varsReport?: 'full' | 'strict' | false;

	/**
	 * Une <span class="vo">[sourcemap](/docs/web#sourcemap)</span> initiale qui sera fusionnée dans la sourcemap finale.
	 * C'est souvent la sourcemap du pré-processeur.
	 *
	 * @default null
	 */
	sourcemap?: object | string;

	/**
	 * Si `true`, Svelte génère des <span class="vo">[sourcemaps](/docs/web#sourcemap)</span> pour les composants.
	 * Utilisez un objet avec `js` ou `css` pour un contrôle plus fin de la génération des sourcemaps. Par défaut, l'option est à `true`.
	 *
	 * @default true
	 */
	enableSourcemap?: EnableSourcemap;

	/**
	 * Nom de fichier utilisé pour les <span class="vo">[sourcemaps](/docs/web#sourcemap)</span> JavaScript.
	 *
	 * @default null
	 */
	outputFilename?: string;

	/**
	 * Nom de fichier utilisé pour les <span class="vo">[sourcemaps](/docs/web#sourcemap)</span> CSS.
	 *
	 * @default null
	 */
	cssOutputFilename?: string;

	/**
	 * L'emplacement de la librairie `svelte`.
	 * Tous les imports à `svelte` ou `svelte/[module]` seront modifiés en conséquence.
	 *
	 * @default 'svelte'
	 */
	sveltePath?: string;

	/**
	 * If `true`, entraîne l'ajout de code supplémentaire dans les composants pour effectuer des vérifications à <span class="vo">[runtime](/docs/development#runtime)</span> et fournir des informations de déboggage pendant les développements.
	 *
	 * @default false
	 */
	dev?: boolean;

	/**
	 * Si `true`, des <span class="vo">[getters et setters](/docs/development#getter-setter)</span> seront générés pour les <span class="vo">[props](/docs/sveltejs#props)</span> des composants. Si `false`, ils ne seront créés que pour les valeurs exportées en lecture seules (c'est-à-dire celles déclarées avec `const`, `class` et `function`). Activer l'option de compilation `customElement: true` changera la valeur par défaut de `accessors` à `true`.
	 *
	 * @default false
	 */
	accessors?: boolean;

	/**
	 * Si `true`, indique au compilateur que vous vous engagez à ne pas muter d'objets.
	 * Cela permet au compilateur d'être moins conservatif lorsqu'il vérifie si une valeur a changé.
	 *
	 * @default false
	 */
	immutable?: boolean;

	/**
	 * Si `true`, lors de la génération du code <span class="vo">[DOM](/docs/web#dom)</span>, autorise l'option de <span class="vo">[runtime](/docs/development#runtime)</span> `hydrate: true`, qui permet à un composant de mettre à jour le DOM existant sans avoir à créer un nouveau noeud.
	 * Lors de la génération de code côté serveur (<span class="vo">[SSR](/docs/web#server-side-rendering)</span>), cela ajoute des marqueurs à la section `<head>` pour identifier quels éléments hydrater.
	 *
	 * @default false
	 */
	hydratable?: boolean;

	/**
	 * Si `true`, génère du code compatible avec IE9 et IE10, navigateurs qui ne supportent pas par exemple : `element.dataset`.
	 *
	 * @default false
	 */
	legacy?: boolean;

	/**
	 * Si `true`, indique au compilateur de générer un constructeur de <span class="vo">[custom element](/docs/web#web-component)</span> à la place d'un composant Svelte traditionnel.
	 *
	 * @default false
	 */
	customElement?: boolean;

	/**
	 * Une `string` qui indique à Svelte le nom à donner au <span class="vo">[custom element](/docs/web#web-component)</span>.
	 * Ce doit être une chaîne composée de caractères alphanumériques avec au moins un tiret, par exemple `"mon-element"`.
	 *
	 * @default null
	 */
	tag?: string;

	/**
	 * - `'injected'` (anciennement `true`): le style sera inclus dans les classes JavaScript et injecté au <span class="vo">[runtime](/docs/development#runtime)</span> pour les composants réellement rendus.
	 * - `'external'` (anciennement `false`): le style sera renvoyé dans la propriété `css` du résultat de la compilation. La plupart des <span class="vo">[plugins](/docs/development#plugin)</span> Svelte de <span class="vo">[bundler](/docs/web#bundler-packager)</span> définiront cette option à `'external'` et utiliseront le CSS généré statiquement. Cela permet d'atteindre de meilleures performances, puisque les <span class="vo">[bundles](/docs/web#bundler-packager)</span> JavaScript seront plus petits et le style généré sous forme de fichiers `.css` pourra être mis en cache.
	 * - `'none'`: le style sera complètement ignoré et aucun CSS ne sera généré.
	 */
	css?: 'injected' | 'external' | 'none' | boolean;

	/**
	 * Un `number` qui indique à Svelte d'arrêter une boucle si elle bloque le <span class="vo">[thread](/docs/development#thread)</span> durant plus de `loopGuardTimeout` ms. Utile pour éviter les boucles infinies.
	 * **Uniquement disponible lorsque `dev: true`**
	 *
	 * @default 0
	 */
	loopGuardTimeout?: number;

	/**
	 * Le <span class="vo">[namespace](/docs/development#namespace)</span> de l'élément; par exemple, `"mathml"`, `"svg"`, `"foreign"`.
	 *
	 * @default 'html'
	 */
	namespace?: string;

	/**
	 * Une fonction qui prend comme arguments `{ hash, css, name, filename }` et retourne un nom de classe utilisé pour le css <span class="vo">[scopé](/docs/development#scope)</span>.
	 * La fonction par défaut retourne `svelte-${hash(css)}`.
	 *
	 * @default undefined
	 */
	cssHash?: CssHashGetter;

	/**
	 * Si `true`, les commentaires HTML seront conservés au cours du rendu côté serveur.
	 * Par défault, ils sont supprimés.
	 *
	 * @default false
	 */
	preserveComments?: boolean;

	/**
	 *  Si `true`, les caractères blancs (espaces, tabulations, ...) seront gardés tels quels, plutôt que supprimés ou fusionnés lorsque c'est possible.
	 *
	 * @default false
	 */
	preserveWhitespace?: boolean;
	/**
	 *  Si `true`, expose la version majeure de Svelte dans l'objet global `window` du navigateur.
	 *
	 * @default true
	 */
	discloseVersion?: boolean;
}

export interface ParserOptions {
	filename?: string;
	customElement?: boolean;
	css?: 'injected' | 'external' | 'none' | boolean;
}

export interface Visitor {
	enter: (node: Node) => void;
	leave?: (node: Node) => void;
}

export interface AppendTarget {
	slots: Record<string, string>;
	slot_stack: string[];
}

export interface Var {
	name: string;
	/** le `bar` dans `export { foo as bar }` ou `export let bar` */
	export_name?: string;
	/** `true` si une valeur par défaut booléenne lui est assignée (`export let foo = true`) */
	is_boolean?: boolean;
	injected?: boolean;
	module?: boolean;
	mutated?: boolean;
	reassigned?: boolean;
	referenced?: boolean; // référencé dans le contexte du <span class="vo">[template](/docs/development#template)</span>
	referenced_from_script?: boolean; // référencé dans le script
	writable?: boolean;

	// utilisé en interne, mais pas exposé
	global?: boolean;
	internal?: boolean; // gestionnaires d'évènement, <span class="vo">[bindings](/docs/sveltejs#bindings)</span>
	initialised?: boolean;
	hoistable?: boolean;
	subscribable?: boolean;
	is_reactive_dependency?: boolean;
	imported?: boolean;
}

export interface CssResult {
	code: string;
	map: SourceMap;
}

/** La forme de ce que renvoie `compile` du `svelte/compiler` */
export interface CompileResult {
	/** Le code JavaScript généré après compilation du composant */
	js: {
		/** Code en tant que `string` */
		code: string;
		/** Une <span class="vo">[sourcemap](/docs/web#sourcemap)</span> */
		map: any;
	};
	/** Le code CSS généré après compilation du composant */
	css: CssResult;
	/** L'arbre <span class="vo">[AST](/docs/development#ast)</span> représentant la structure du composant */
	ast: Ast;
	/**
	 * Un tableau de <span class="vo">[warnings](/docs/development#warning)</span> générés pendant la compilation. Chaque <span class="vo">[warning](/docs/development#warning)</span> possède les attributs suivants :
	 * - `code` : une `string` identifiant la catégorie du <span class="vo">[warning](/docs/development#warning)</span>
	 * - `message` : décrit le problème de manière intelligible
	 * - `start` et `end` : si le <span class="vo">[warning](/docs/development#warning)</span> est relevé à un endroit particulier, ce sont des objets avec les propriétés `line`, `column` et `character`
	 * - `frame` : si pertinent, correspond à du texte précisant l'emplacement du code concerné, avec le numéro de ligne
	 * */
	warnings: Warning[];

	/** Un tableau reprenant les objets déclarés dans le composant et utilisés par l'écosystème (comme le <span class="vo">[plugin](/docs/development#plugin)</span> Svelte ESLint) pour inféré plus d'informations */
	vars: Var[];
	/** Objet utilisé par l'équipe de développement de Svelte pour diagnostiquer le compilateur. Évitez de vous en servir car il pourrait changer à tout moment ! */
	stats: {
		timings: {
			total: number;
		};
	};
}
