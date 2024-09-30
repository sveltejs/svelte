use std::rc::Rc;

use gloo_utils::format::JsValueSerdeExt;
use swc_common::{BytePos, FileName, FilePathMapping, SourceFile, SourceMap};
// use swc_core::base::Compiler;
use swc_ecma_ast::EsVersion;
use swc_ecma_parser::{lexer::Lexer, EsSyntax, Parser, StringInput, Syntax, TsSyntax};
use swc_estree_ast::flavor::Flavor;
use swc_estree_compat::babelify::{Babelify, Context};
use swc_node_comments::SwcComments;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
	#[wasm_bindgen(js_namespace = console)]
	fn log(s: &str);
}

macro_rules! console_log {
	// Note that this is using the `log` function imported above during
	// `bare_bones`
	($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[wasm_bindgen]
pub fn parse_expression_at(source: js_sys::JsString, index: usize, typescript: bool) -> JsValue {
	console_error_panic_hook::set_once();
	let cm = Rc::new(SourceMap::new(FilePathMapping::empty()));

	// We need to slice the JS string at the correct byte position given the weird utf-16 encoding javascript does
	let mut byte_position = 0usize;
	let mut i = 0usize;
	while i < index {
		let char = source.char_code_at(i as u32) as u16;
		if char <= 0x7f {
			byte_position += 1;
		} else if char <= 0x7ff {
			byte_position += 2;
		} else if (0xD800..=0xDBFF).contains(&char) {
			byte_position += 4;
			i += 1;
		} else {
			byte_position += 3;
		}
		i += 1;
	}

	let source = source.as_string().expect("Invalid UTF-16 string");

	let partial_file = SourceFile::new(
		FileName::Anon.into(),
		false,
		FileName::Anon.into(),
		source[byte_position..].to_string(),
		BytePos(byte_position as u32),
	);
	let syntax = if typescript {
		Syntax::Typescript(TsSyntax::default())
	} else {
		Syntax::Es(EsSyntax::default())
	};

	let comments = SwcComments::default();

	let input = StringInput::from(&partial_file);

	let lexer = Lexer::new(syntax, EsVersion::Es2022, input, Some(&comments));
	let mut parser = Parser::new_from(lexer);

	for e in parser.take_errors() {
		// todo: handle errors
	}
	let expr = parser.parse_expr().unwrap_or_else(|e| {
		panic!(
			"failed to parse expression `{}`: {e:?}",
			&source[byte_position..]
		)
	});

	Flavor::Acorn {
		extra_comments: false,
	}
	.with(|| {
		// Needs to be the full source to get correct line/col numbers
		let file = SourceFile::new(
			FileName::Anon.into(),
			false,
			FileName::Anon.into(),
			source,
			BytePos(0),
		);
		let ctx = Context {
			comments,
			fm: file.into(),
			cm,
		};

		let ast = expr.babelify(&ctx);
		JsValue::from_serde(&ast).unwrap()
	})
}
