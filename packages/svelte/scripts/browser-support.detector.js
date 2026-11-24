import ts from 'typescript';
import { features } from 'web-features';

/**
 * Maps compat-key suffixes under `javascript.operators` and
 * `javascript.statements` (and a few other `javascript.*` subtrees) to
 * detection callbacks. The callback receives a TS AST node and returns
 * true if that node represents the operator or statement.
 *
 * @type {Record<string, (node: ts.Node) => boolean>}
 */
const SYNTAX_PREDICATES = {
	nullish_coalescing: (node) =>
		ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken,
	nullish_coalescing_assignment: (node) =>
		ts.isBinaryExpression(node) &&
		node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionEqualsToken,
	logical_or_assignment: (node) =>
		ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.BarBarEqualsToken,
	logical_and_assignment: (node) =>
		ts.isBinaryExpression(node) &&
		node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandEqualsToken,
	optional_chaining: (node) =>
		(ts.isPropertyAccessExpression(node) ||
			ts.isElementAccessExpression(node) ||
			ts.isCallExpression(node)) &&
		node.questionDotToken !== undefined,
	spread: (node) => ts.isSpreadElement(node) || ts.isSpreadAssignment(node),
	destructuring: (node) => ts.isObjectBindingPattern(node) || ts.isArrayBindingPattern(node),
	arrow_functions: (node) => ts.isArrowFunction(node),
	try_catch_optional_binding: (node) =>
		ts.isCatchClause(node) && node.variableDeclaration === undefined,
	async_iteration: (node) => ts.isForOfStatement(node) && node.awaitModifier !== undefined,
	for_await: (node) => ts.isForOfStatement(node) && node.awaitModifier !== undefined,
	private_class_fields: (node) => ts.isPrivateIdentifier(node),
	async_generator_function: (node) =>
		(ts.isFunctionDeclaration(node) ||
			ts.isFunctionExpression(node) ||
			ts.isMethodDeclaration(node)) &&
		node.asteriskToken !== undefined &&
		(node.modifiers?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword) ?? false),
	generator_function: (node) =>
		(ts.isFunctionDeclaration(node) ||
			ts.isFunctionExpression(node) ||
			ts.isMethodDeclaration(node)) &&
		node.asteriskToken !== undefined &&
		!(node.modifiers?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword) ?? false),
	async_function: (node) =>
		(ts.isFunctionDeclaration(node) ||
			ts.isFunctionExpression(node) ||
			ts.isArrowFunction(node) ||
			ts.isMethodDeclaration(node)) &&
		(node.modifiers?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword) ?? false) &&
		node.asteriskToken === undefined,
	classes: (node) => ts.isClassDeclaration(node) || ts.isClassExpression(node),
	let_const: (node) =>
		ts.isVariableDeclarationList(node) &&
		((node.flags & ts.NodeFlags.Let) !== 0 || (node.flags & ts.NodeFlags.Const) !== 0),
	template_literals: (node) =>
		ts.isTemplateExpression(node) || ts.isNoSubstitutionTemplateLiteral(node)
};

/**
 * Walk `web-features` once and partition every `compat_features` path
 * into the lookup tables the AST walker uses.
 */
function build_detection_maps() {
	/** @type {Map<string, string>} identifier name → feature_id */
	const globals = new Map();
	/** @type {Map<string, Map<string, string>>} type → member → feature_id */
	const members = new Map();
	/** @type {Map<string, string>} string-literal value → feature_id */
	const string_literals = new Map();
	/** @type {Array<{ predicate: (n: ts.Node) => boolean, feature_id: string }>} */
	const syntax_predicates = [];

	const add_member = (
		/** @type {string} */ type,
		/** @type {string} */ member,
		/** @type {string} */ feature_id
	) => {
		let by_member = members.get(type);
		if (!by_member) {
			by_member = new Map();
			members.set(type, by_member);
		}
		// Only set if not already present — the first feature claiming a
		// (type, member) pair wins. (Multiple features can map to the same
		// pair via duplicated compat paths; we just need any.)
		if (!by_member.has(member)) by_member.set(member, feature_id);
	};

	for (const [feature_id, feature] of Object.entries(features)) {
		if (!('compat_features' in feature) || !feature.compat_features) continue;
		for (const path of feature.compat_features) {
			const parts = path.split('.');

			// `api.X` → global identifier (constructor or function), e.g.
			// `api.ResizeObserver`, `api.structuredClone`.
			if (parts[0] === 'api' && parts.length === 2) {
				globals.set(parts[1], feature_id);
				continue;
			}

			// `api.X.Y` → member access on type X. E.g.
			// `api.HTMLElement.inert`, `api.ResizeObserverEntry.contentBoxSize`.
			if (parts[0] === 'api' && parts.length === 3) {
				add_member(parts[1], parts[2], feature_id);
				continue;
			}

			// `javascript.builtins.X` → global like Promise, Symbol, Proxy.
			if (parts[0] === 'javascript' && parts[1] === 'builtins' && parts.length === 3) {
				globals.set(parts[2], feature_id);
				continue;
			}

			// `javascript.builtins.X.Y` → method/property on type X.
			// We also accept the `ArrayConstructor`-style mapping for static
			// methods: when the AST walker sees `Array.from(...)`, the
			// receiver type's symbol name is `ArrayConstructor`, not `Array`.
			if (parts[0] === 'javascript' && parts[1] === 'builtins' && parts.length === 4) {
				add_member(parts[2], parts[3], feature_id);
				add_member(`${parts[2]}Constructor`, parts[3], feature_id);
				continue;
			}

			// `javascript.*` syntax: try the second segment first (covers
			// `javascript.operators.X` and `javascript.statements.X`), then
			// the last segment (covers `javascript.classes.private_class_fields`
			// and similar).
			if (parts[0] === 'javascript' && parts.length >= 3) {
				const candidates = [parts[2], parts[parts.length - 1]];
				for (const key of candidates) {
					if (Object.hasOwn(SYNTAX_PREDICATES, key)) {
						syntax_predicates.push({ predicate: SYNTAX_PREDICATES[key], feature_id });
						break;
					}
				}
				continue;
			}
		}
	}

	return { globals, members, string_literals, syntax_predicates };
}

const MAPS = build_detection_maps();

/**
 * Versions and friendly names for synthetic feature IDs registered via
 * `register_extra_rules` — APIs the type-aware walker can see but that
 * `web-features` doesn't (yet) catalogue. `versions_for_feature` consults
 * this map before falling back to `web-features` lookups.
 *
 * @type {Map<string, { name: string, versions: Record<string, string | null>, baseline_year: number | null }>}
 */
const EXTRA_FEATURE_INFO = new Map();

/**
 * Register additional detection rules for APIs the `web-features` dataset
 * doesn't track yet. Two rule shapes are accepted:
 *
 *   - **Member access**: `{ receiver_type, member, ... }` — flags
 *     `expr.member` when `expr`'s type resolves to `receiver_type`.
 *     Equivalent to a `api.X.Y` rule auto-derived from web-features.
 *
 *   - **String literal**: `{ string_literal, ... }` — flags any
 *     occurrence of the literal value in source. Used for API options
 *     that are string-typed (e.g. `{ box: 'device-pixel-content-box' }`).
 *     The walker can be tightened later with a contextual-type check if
 *     false positives ever surface; for now an exact match is enough
 *     (these strings are too specific to occur incidentally).
 *
 * Each rule contributes its `feature_id`, per-browser versions,
 * baseline year, and display name to the shared lookup tables.
 *
 * @param {Array<{
 *   feature_id: string,
 *   name: string,
 *   baseline_year: number,
 *   versions: Record<string, string | null>,
 *   receiver_type?: string,
 *   member?: string,
 *   string_literal?: string
 * }>} rules
 */
export function register_extra_rules(rules) {
	for (const rule of rules) {
		if (rule.receiver_type && rule.member) {
			let by_member = MAPS.members.get(rule.receiver_type);
			if (!by_member) {
				by_member = new Map();
				MAPS.members.set(rule.receiver_type, by_member);
			}
			// Don't overwrite an existing web-features rule; that's canonical.
			if (!by_member.has(rule.member)) {
				by_member.set(rule.member, rule.feature_id);
			}
		} else if (rule.string_literal) {
			if (!MAPS.string_literals.has(rule.string_literal)) {
				MAPS.string_literals.set(rule.string_literal, rule.feature_id);
			}
		}
		EXTRA_FEATURE_INFO.set(rule.feature_id, {
			name: rule.name,
			baseline_year: rule.baseline_year,
			versions: rule.versions
		});
	}
}

/**
 * Compile bundle files into a single `ts.Program` so type-checking is
 * amortised across all of them.
 *
 * @param {string[]} files
 */
function build_program(files) {
	const program = ts.createProgram(files, {
		allowJs: true,
		checkJs: false,
		target: ts.ScriptTarget.ESNext,
		module: ts.ModuleKind.ESNext,
		moduleResolution: ts.ModuleResolutionKind.Bundler,
		lib: ['lib.esnext.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
		strict: false,
		noEmit: true,
		skipLibCheck: true,
		isolatedModules: true,
		noErrorTruncation: true
	});
	const checker = program.getTypeChecker();
	return { program, checker };
}

/**
 * Collect the names of a type and its base types so a `member` lookup
 * keyed on (say) `HTMLElement` matches a receiver typed as
 * `HTMLDivElement`. Also includes the apparent type to catch primitives
 * (`'foo'` apparent-types to `String`).
 *
 * @param {ts.Type} type
 * @param {ts.TypeChecker} checker
 */
function get_type_names(type, checker) {
	const names = new Set();
	const constituents = type.isUnionOrIntersection() ? type.types : [type];
	for (const t of constituents) {
		const symbol = t.getSymbol() ?? t.aliasSymbol;
		if (symbol) names.add(symbol.getName());
		for (const base of t.getBaseTypes?.() ?? []) {
			const base_symbol = base.getSymbol() ?? base.aliasSymbol;
			if (base_symbol) names.add(base_symbol.getName());
		}
		const apparent = checker.getApparentType(t);
		if (apparent && apparent !== t) {
			const apparent_symbol = apparent.getSymbol() ?? apparent.aliasSymbol;
			if (apparent_symbol) names.add(apparent_symbol.getName());
		}
	}
	return names;
}

/**
 * Cheap test for whether a symbol refers to a global binding (declared
 * in a lib.d.ts or ambient module) rather than a user-defined local.
 *
 * @param {ts.Symbol | undefined} symbol
 */
function is_global_binding(symbol) {
	if (!symbol) return true; // unresolved → assume global
	const declarations = symbol.getDeclarations() ?? [];
	if (declarations.length === 0) return true;
	for (const decl of declarations) {
		const file_name = decl.getSourceFile().fileName;
		if (file_name.includes('/lib.') && file_name.endsWith('.d.ts')) return true;
	}
	return false;
}

/**
 * Walk a TS source file emitting feature IDs as they're discovered.
 *
 * @param {ts.SourceFile} source
 * @param {ts.TypeChecker | null} checker
 *   When `null`, type-aware checks (member access) are skipped. Used for
 *   the compiler-output fixtures which are parsed without a Program.
 * @param {(feature_id: string) => void} emit
 */
function walk_source(source, checker, emit) {
	/** @param {ts.Node} node */
	function visit(node) {
		// Syntax predicates run regardless of whether we have a checker.
		for (const { predicate, feature_id } of MAPS.syntax_predicates) {
			if (predicate(node)) emit(feature_id);
		}

		// Global identifier detection.
		if (
			ts.isIdentifier(node) &&
			!(ts.isPropertyAccessExpression(node.parent) && node.parent.name === node) &&
			!ts.isPropertyAssignment(node.parent) &&
			!ts.isMethodDeclaration(node.parent) &&
			!ts.isPropertySignature(node.parent)
		) {
			const feature_id = MAPS.globals.get(node.text);
			if (feature_id) {
				if (!checker || is_global_binding(checker.getSymbolAtLocation(node))) {
					emit(feature_id);
				}
			}
		}

		// String-literal detection. The walker matches by value alone;
		// false positives are theoretically possible but the literal
		// values we care about (e.g. `'device-pixel-content-box'`) are
		// distinctive enough that one hasn't been observed.
		if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
			const feature_id = MAPS.string_literals.get(node.text);
			if (feature_id) emit(feature_id);
		}

		// Member access detection (requires the checker).
		if (checker && ts.isPropertyAccessExpression(node)) {
			const member_name = node.name.text;
			const receiver_type = checker.getTypeAtLocation(node.expression);
			const type_names = get_type_names(receiver_type, checker);
			for (const type_name of type_names) {
				const by_member = MAPS.members.get(type_name);
				if (!by_member) continue;
				const feature_id = by_member.get(member_name);
				if (feature_id) {
					emit(feature_id);
					break;
				}
			}
		}

		ts.forEachChild(node, visit);
	}

	visit(source);
}

/**
 * Detect features used in a set of bundle files. Returns the union of
 * web-features IDs flagged across all files.
 *
 * @param {string[]} bundle_files Absolute paths to JS/TS files.
 * @returns {Set<string>}
 */
export function detect_features(bundle_files) {
	const { program, checker } = build_program(bundle_files);
	const flagged = new Set();
	for (const file of bundle_files) {
		const source = program.getSourceFile(file);
		if (!source) continue;
		walk_source(source, checker, (id) => flagged.add(id));
	}
	return flagged;
}

/**
 * Detect features used in a single in-memory source string. No type
 * checker (so member-based rules silently skip) — useful for the
 * compiler-output fixtures, where syntax-level detection is sufficient.
 *
 * @param {string} source_text
 * @returns {Set<string>}
 */
export function detect_features_in_text(source_text) {
	const source = ts.createSourceFile(
		'fixture.js',
		source_text,
		ts.ScriptTarget.ESNext,
		true,
		ts.ScriptKind.JS
	);
	const flagged = new Set();
	walk_source(source, null, (id) => flagged.add(id));
	return flagged;
}

/**
 * Per-browser minimum versions for a feature ID. Consults
 * supplemental rules first (from `register_extra_rules`), then falls
 * back to `web-features`. Returns null when neither has data.
 *
 * @param {string} feature_id
 */
export function versions_for_feature(feature_id) {
	const extra = EXTRA_FEATURE_INFO.get(feature_id);
	if (extra) return extra.versions;
	const feature = features[feature_id];
	if (!feature || !('status' in feature)) return null;
	return /** @type {Record<string, string> | null} */ (
		/** @type {unknown} */ (feature.status.support)
	);
}

/**
 * Baseline year for a feature. Returns `null` for features without a
 * Baseline date (limited availability, supplemental rules without a
 * year, or absent from the dataset).
 *
 * @param {string} feature_id
 */
export function baseline_year_for_feature(feature_id) {
	const extra = EXTRA_FEATURE_INFO.get(feature_id);
	if (extra) return extra.baseline_year;
	const feature = features[feature_id];
	if (!feature || !('status' in feature)) return null;
	const status = /** @type {{ baseline_low_date?: string }} */ (feature.status);
	if (!status.baseline_low_date) return null;
	return Number(status.baseline_low_date.slice(0, 4));
}
