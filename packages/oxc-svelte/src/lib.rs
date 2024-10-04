#![deny(clippy::all)]

#[macro_use]
extern crate napi_derive;

use oxc_allocator::Allocator;
use oxc_ast::{CommentKind, Trivias};
use oxc_diagnostics::OxcDiagnostic;
use oxc_parser::Parser;
use oxc_span::SourceType;
use serde_json::json;

#[napi(js_name = "parse_expression_at")]
pub fn parse_expression_at(source: String, index: u32, typescript: bool) -> String {
	let byte_position = index;

	let allocator = Allocator::default();
	let source_type = if typescript {
		SourceType::ts()
	} else {
		SourceType::mjs()
	};
	let source_text = source[(byte_position as usize)..].to_string();

	let ret = Parser::new(&allocator, &source_text, source_type)
		.svelte_parse_expression()
		.unwrap();
	serde_json::to_string(&ret.0).unwrap()
}

#[napi(js_name = "parse_pattern_at")]
pub fn parse_pattern_at(
	source: String,
	index: u32,
	typescript: bool,
	allow_type_annotation: bool,
) -> String {
	let byte_position = index;

	let allocator = Allocator::default();
	let source_type = if typescript {
		SourceType::ts()
	} else {
		SourceType::mjs()
	};
	let source_text = source[(byte_position as usize)..].to_string();

	let ret = Parser::new(&allocator, &source_text, source_type)
		.svelte_parse_pattern(typescript && allow_type_annotation)
		.unwrap();
	serde_json::to_string(&ret.0).unwrap()
}

#[napi]
pub fn parse(source: String, typescript: bool) -> ParseReturn {
	let allocator = Allocator::default();
	let source_type = if typescript {
		SourceType::ts()
	} else {
		SourceType::mjs()
	};

	let ret = Parser::new(&allocator, &source, source_type).parse();
	ParseReturn::new(ret.program, ret.errors, ret.trivias)
}

#[napi(object)]
pub struct ParseReturn {
	pub ast: String,
	pub errors: Vec<String>,
	pub comments: String,
}
impl ParseReturn {
	fn new<T>(ast: T, errors: Vec<OxcDiagnostic>, comments: Trivias) -> Self
	where
		T: serde::Serialize,
	{
		let comments = comments
			.comments()
			.map(|c| {
				json!({
					"type": match c.kind {
						CommentKind::Line => "Line",
						CommentKind::Block => "Block",
					},
					"start": c.span.start,
					"end": c.span.end,
				})
			})
			.collect::<Vec<_>>();
		ParseReturn {
			ast: serde_json::to_string(&ast).unwrap(),
			errors: errors.into_iter().map(|e| e.to_string()).collect(),
			comments: serde_json::to_string(&comments).unwrap(),
		}
	}
}
