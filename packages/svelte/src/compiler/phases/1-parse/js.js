/** @import { Program } from 'estree' */
/** @import { AST } from '#compiler' */
import * as teasel from '@teasel/parser';
import * as e from '../../errors.js';
import { keep_tables } from '../../utils/ast.js';

/**
 * A standalone module, as `analyze_module` reads one.
 * @param {string} source
 * @param {AST.JSComment[]} comments
 * @param {boolean} typescript
 * @returns {Program}
 */
export function parse(source, comments, typescript) {
	let answer;
	try {
		answer = new teasel.Source(source, {
			sourceType: 'module',
			typescript,
			comments: true,
			locations: true,
			scopes: true
		}).parse();
	} catch (err) {
		return handle_parse_error(/** @type {teasel.ParseError} */ (err));
	}

	for (const comment of /** @type {teasel.Comment[]} */ (answer.comments)) {
		dedent(comment, source);
		comments.push(/** @type {AST.JSComment} */ (comment));
	}
	// a module read on its own is one piece: its program, in its own scope
	const scopes = /** @type {teasel.Scope[]} */ (answer.scopes);
	keep_tables(answer.node, {
		node: answer.node,
		scope: scopes[0],
		scopes: scopes.slice(1),
		bindings: /** @type {teasel.Binding[]} */ (answer.bindings),
		references: /** @type {teasel.Reference[]} */ (answer.references)
	});

	return answer.node;
}

/** What erasure leaves in place needs a compiler, not this one */
const UNSUPPORTED = {
	TSEnumDeclaration: 'enums',
	TSModuleDeclaration: 'namespaces with non-type nodes',
	TSParameterProperty: 'accessibility modifiers on constructor parameters',
	Decorator: 'decorators (related TSC proposal is not stage 4 yet)',
	AccessorProperty: 'accessor fields (related TSC proposal is not stage 4 yet)',
	TSExportAssignment: 'export assignments',
	TSImportEqualsDeclaration: 'import assignments'
};

/** @param {teasel.Kept[] | undefined} kept */
export function unsupported(kept) {
	const node = kept?.[0];
	if (node) {
		e.typescript_invalid_feature(
			node,
			UNSUPPORTED[/** @type {keyof typeof UNSUPPORTED} */ (node.type)] ?? node.type
		);
	}
}

/**
 * @param {teasel.ParseError} err
 * @returns {never}
 */
function handle_parse_error(err) {
	if (err.code === 'unexpected_eof') e.unexpected_eof(err.pos);
	e.js_parse_error(err.pos, sentence(err));
}

// the parser reports a code and what it is about; the words are this compiler's, `{}` taking the args in order
const SENTENCES = /** @type {Partial<Record<teasel.Code, string>>} */ ({
	unexpected_token: 'Unexpected token',
	expected: 'Expected {}',
	unclosed: '{} is not closed',
	unexpected_close: 'Unexpected closing {}',
	invalid_name: 'Invalid name {}',
	duplicate: 'Duplicate {}',
	placement: '{} is not allowed here',
	unexpected_eof: 'Unexpected end of input',
	unexpected_character: "Unexpected character '{}'",
	unexpected_keyword: "Unexpected keyword '{}'",
	reserved_word: "The keyword '{}' is reserved",
	escape_in_keyword: 'Escape sequence in keyword {}',
	nesting_depth: 'Maximum nesting depth exceeded',
	tree_size: 'Maximum tree size exceeded',
	not_typescript: 'TypeScript syntax in JavaScript',
	unterminated_comment: 'Unterminated comment',
	unterminated_string: 'Unterminated string constant',
	unterminated_template: 'Unterminated template',
	unterminated_regexp: 'Unterminated regular expression',
	invalid_regexp: 'Invalid regular expression: /{}/: {}',
	invalid_regexp_flag: 'Invalid regular expression flag',
	duplicate_regexp_flag: 'Duplicate regular expression flag',
	invalid_number: 'Invalid number',
	expected_number_in_radix: 'Expected number in radix {}',
	identifier_after_number: 'Identifier directly after number',
	numeric_separator_first: 'Numeric separator is not allowed at the first of digits',
	numeric_separator_last: 'Numeric separator is not allowed at the last of digits',
	numeric_separator_double: 'Numeric separator must be exactly one underscore',
	numeric_separator_legacy_octal:
		'Numeric separator is not allowed in legacy octal numeric literals',
	bad_character_escape: 'Bad character escape sequence',
	bad_template_escape: 'Bad escape sequence in untagged template literal',
	invalid_unicode_escape: 'Invalid Unicode escape',
	expected_unicode_escape: 'Expecting Unicode escape sequence \\uXXXX',
	code_point_out_of_bounds: 'Code point out of bounds',
	strict_with: "'with' in strict mode",
	strict_delete: 'Deleting local variable in strict mode',
	strict_directive_non_simple_params:
		"Illegal 'use strict' directive in function with non-simple parameter list",
	strict_binding: 'Binding or assigning to {} in strict mode',
	strict_octal: 'Octal literal in strict mode',
	strict_escape: 'Invalid escape sequence',
	let_as_binding: 'let is disallowed as a lexically bound name',
	redeclaration: "Identifier '{}' has already been declared",
	duplicate_label: "Label '{}' is already declared",
	duplicate_parameter: 'Argument name clash',
	duplicate_proto: 'Redefinition of __proto__ property',
	duplicate_default: 'Multiple default clauses',
	duplicate_export: "Duplicate export '{}'",
	undefined_export: "Export '{}' is not defined",
	string_export_without_from:
		'A string literal cannot be used as an exported binding without `from`',
	lone_surrogate_in_module_name: 'An export name cannot include a lone surrogate',
	duplicate_import_attribute: "Duplicate attribute key '{}'",
	import_export_in_script: "'import' and 'export' may appear only with 'sourceType: module'",
	import_export_not_top_level: "'import' and 'export' may only appear at the top level",
	import_meta_outside_module: "Cannot use 'import.meta' outside a module",
	import_meta_escaped: "'import.meta' must not contain escaped characters",
	invalid_import_meta: "The only valid meta property for import is 'import.meta'",
	invalid_new_target: "The only valid meta property for new is 'new.target'",
	new_target_escaped: "'new.target' must not contain escaped characters",
	new_target_outside_function: "'new.target' can only be used in functions and class static block",
	unsyntactic: 'Unsyntactic {}',
	return_outside_function: "'return' outside of function",
	newline_after_throw: 'Illegal newline after throw',
	missing_catch_or_finally: 'Missing catch or finally clause',
	for_in_of_initializer: '{} loop variable declaration may not have an initializer',
	for_of_let: "The left-hand side of a for-of loop may not start with 'let'",
	await_as_identifier: "Cannot use 'await' as identifier inside an async function",
	await_outside_async: "Cannot use keyword 'await' outside an async function",
	await_in_default_value: 'Await expression cannot be a default value',
	yield_as_identifier: "Cannot use 'yield' as identifier inside a generator",
	yield_in_default_value: 'Yield expression cannot be a default value',
	invalid_in_static_block: 'Cannot use {} in class static initialization block',
	arguments_in_field_initializer: "Cannot use 'arguments' in class field initializer",
	invalid_assignment_target: 'Assigning to rvalue',
	invalid_binding_target: 'Binding rvalue',
	binding_member_expression: 'Binding member expression',
	parenthesized_pattern: 'Parenthesized pattern',
	binding_parenthesized: 'Binding parenthesized expression',
	optional_chain_assignment: 'Optional chaining cannot appear in left-hand side',
	optional_chain_in_new: 'Optional chaining cannot appear in the callee of new expressions',
	optional_chain_in_tagged_template:
		'Optional chaining cannot appear in the tag of tagged template expressions',
	mixed_coalesce:
		'Logical expressions and coalesce expressions cannot be mixed. Wrap either by parentheses',
	private_name_outside_in: 'Private identifier can only be left side of binary expression',
	undeclared_private_name: "Private field '{}' must be declared in an enclosing class",
	delete_private: 'Private fields can not be deleted',
	invalid_super: "Invalid use of 'super'",
	super_outside_method: "'super' keyword outside a method",
	super_call_outside_constructor: 'super() call outside constructor of a subclass',
	comma_after_rest: 'Comma is not permitted after the rest element',
	rest_with_default: 'Rest elements cannot have a default value',
	accessor_in_pattern: "Object pattern can't contain getter or setter",
	shorthand_assignment: 'Shorthand property assignments are valid only in destructuring patterns',
	pattern_without_initializer: 'Complex binding patterns require an initialization value',
	using_pattern: "'{}' declarations may not have binding patterns",
	using_without_initializer: 'Missing initializer in {} declaration',
	using_in_for_in: 'The left-hand side of a for-in loop may not be a {} declaration',
	using_outside_block:
		'A {} declaration at the top level of a script or in a case clause must be inside a block',
	invalid_default_operator: "Only '=' operator can be used for specifying default value",
	getter_params: 'getter should have no params',
	setter_params: 'setter should have exactly one param',
	setter_rest_param: 'Setter cannot use rest params',
	generator_constructor: "Constructor can't be a generator",
	async_constructor: "Constructor can't be an async method",
	accessor_constructor: "Constructor can't have get/set modifier",
	duplicate_constructor: 'Duplicate constructor in the same class',
	constructor_field: "Classes can't have a field named 'constructor'",
	private_constructor: "Classes can't have an element named '#constructor'",
	static_prototype: "Classes can't have a static field named 'prototype'",
	abstract_outside_abstract_class: 'Abstract methods can only appear within an abstract class',
	abstract_with_implementation:
		"Method '{}' cannot have an implementation because it is marked abstract",
	abstract_with_initializer:
		"Property '{}' cannot have an initializer because it is marked abstract",
	duplicate_accessibility: 'Accessibility modifier already seen',
	duplicate_modifier: "Duplicate modifier: '{}'",
	conflicting_modifiers: "'{}' modifier cannot be used with '{}' modifier",
	modifier_order: "'{}' modifier must precede '{}' modifier",
	declare_on_method: "Class methods cannot have the 'declare' modifier",
	readonly_on_method: "Class methods cannot have the 'readonly' modifier",
	readonly_placement:
		"'readonly' modifier can only appear on a property declaration or index signature",
	readonly_type_operand:
		"'readonly' type modifier is only permitted on array and tuple literal types",
	override_without_extends:
		"This member cannot have an 'override' modifier because its containing class does not extend another class",
	index_signature_modifier: "Index signatures cannot have the '{}' modifier",
	private_modifier: "Private elements cannot have the '{}' modifier",
	static_block_modifier: 'Static class blocks cannot have any modifier',
	accessor_type_parameters: 'An accessor cannot have type parameters',
	constructor_type_parameters: 'Type parameters cannot appear on a constructor declaration',
	setter_return_type: "A 'set' accessor cannot have a return type annotation",
	decorator_placement:
		"Decorators must be attached to a class or a class element, and must all precede 'export' or all follow it",
	decorator_on_constructor:
		"Decorators can't be used with a constructor. Did you mean '@dec class { ... }'?",
	decorator_without_body: 'A decorator can only decorate a method or accessor with a body',
	this_parameter_modifiers: "Neither decorators nor modifiers may be applied to 'this' parameters",
	optional_with_initializer: 'Parameter cannot have question mark and initializer',
	required_after_optional: 'A required parameter or element cannot follow an optional one',
	optional_rest: 'A rest parameter cannot be optional',
	setter_optional_parameter: "A 'set' accessor cannot have an optional parameter",
	setter_parameter_initializer: "A 'set' accessor parameter cannot have an initializer",
	constructor_return_type: 'Type annotation cannot appear on a constructor declaration',
	constructor_modifier: "'{}' modifier cannot appear on a constructor declaration",
	index_signature_type: 'An index signature must have a type annotation',
	predicate_placement:
		'A type predicate is only allowed in return type position for functions and methods',
	infer_placement:
		"'infer' declarations are only permitted in the 'extends' clause of a conditional type",
	const_assertion_target:
		"A 'const' assertion can only be applied to references to enum members, or string, number, boolean, array, or object literals",
	catch_clause_type:
		"Catch clause variable type annotation must be 'any' or 'unknown' if specified",
	abstract_placement:
		"'abstract' modifier can only appear on a class, method, or property declaration",
	export_assignment_in_namespace: 'An export assignment cannot be used in a namespace',
	quoted_module_name: 'Only ambient modules can use quoted names',
	implementation_in_ambient: 'An implementation cannot be declared in ambient contexts',
	initializer_in_ambient: 'Initializers are not allowed in ambient contexts',
	ambient_const_initializer:
		"A 'const' initializer in an ambient context must be a string or numeric literal or literal enum reference",
	export_declare_without_declaration: "'export declare' must be followed by an ambient declaration",
	interface_without_name: "'interface' declarations must be followed by an identifier",
	type_redeclaration: "type '{}' has already been declared",
	import_type_alias: "An import alias can not use 'import type'",
	type_import_argument: 'Argument in a type import must be a string literal',
	type_import_default_and_named:
		'A type-only import can specify a default import or named bindings, but not both',
	type_modifier_in_type_import:
		"The 'type' modifier cannot be used on a name of an 'import type' or 'export type' statement",
	unexpected_type_annotation: 'Did not expect a type annotation here',
	type_annotation_after_default:
		'Type annotations must come before default assignments, e.g. instead of `age = 25: number` use `age: number = 25`',
	empty_type_arguments: 'Type argument list cannot be empty',
	empty_type_parameters: 'Type parameter list cannot be empty',
	empty_list: "'{}' list cannot be empty",
	type_member_modifier: "'{}' modifier cannot appear on a type member",
	type_parameter_modifier: "'{}' modifier cannot appear on this type parameter",
	invalid_const: "Cannot find name 'const'",
	tuple_label: 'Tuple members must be labeled with a simple identifier',
	optional_pattern_parameter:
		'A binding pattern parameter cannot be optional in an implementation signature',
	parameter_property_pattern: 'A parameter property may not be declared using a binding pattern',
	signature_parameter_default:
		'Name in a signature must be an Identifier, ObjectPattern or ArrayPattern, instead got AssignmentPattern',
	definite_with_initializer:
		'Declarations with initializers cannot also have definite assignment assertions',
	generator_in_ambient: 'Generators are not allowed in an ambient context',
	generator_signature: 'An overload signature cannot be declared as a generator',
	declare_in_ambient: "A 'declare' modifier cannot be used in an already ambient context",
	statement_in_ambient: 'Statements are not allowed in ambient contexts',
	using_in_ambient: "'{}' declarations are not allowed in ambient contexts",
	property_after_instantiation:
		'Invalid property access after an instantiation expression. You can either wrap the instantiation expression in parentheses, or delete the type arguments'
});

/**
 * The sentence for a parser error, as `js_parse_error` shows it.
 * @param {teasel.ParseError} error
 */
export function sentence({ code, args, message }) {
	let i = 0;
	return SENTENCES[code]?.replace(/\{\}/g, () => args[i++]) ?? message;
}

/**
 * Comments are needed in order to support `svelte-ignore` comments in JS code and so that
 * `prettier-plugin-svelte` doesn't remove all comments when formatting. A block comment loses
 * the indentation of the line it starts on.
 * @param {teasel.Comment} comment
 * @param {string} source
 */
export function dedent(comment, source) {
	if (comment.type === 'Block' && comment.value.includes('\n')) {
		let a = comment.start;
		while (a > 0 && source[a - 1] !== '\n') a -= 1;

		let b = a;
		while (/[ \t]/.test(source[b])) b += 1;

		const indentation = source.slice(a, b);
		comment.value = comment.value.replace(new RegExp(`^${indentation}`, 'gm'), '');
	}
}

/**
 * The index of the first comment at or after `start`.
 * @param {AST.JSComment[]} comments in source order
 * @param {number} start
 */
export function first_from(comments, start) {
	let low = 0;
	let high = comments.length;
	while (low < high) {
		const middle = (low + high) >>> 1;
		if (comments[middle].start < start) low = middle + 1;
		else high = middle;
	}
	return low;
}
