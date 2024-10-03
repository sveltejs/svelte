#![deny(clippy::all)]

#[macro_use]
extern crate napi_derive;

use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;

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
pub fn parse(source: String, typescript: bool) -> String {
	let allocator = Allocator::default();
	let source_type = if typescript {
		SourceType::ts()
	} else {
		SourceType::mjs()
	};

	let ret = Parser::new(&allocator, &source, source_type).parse();
	serde_json::to_string(&ret.program).unwrap()
}
