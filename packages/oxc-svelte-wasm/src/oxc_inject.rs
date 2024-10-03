impl<'a> Parser<'a> {
	pub fn svelte_parse_expression(
		self,
	) -> std::result::Result<(Expression<'a>, Trivias), Vec<OxcDiagnostic>> {
		let unique = UniquePromise::new();
		let parser = ParserImpl::new(
			self.allocator,
			self.source_text,
			self.source_type,
			self.options,
			unique,
		);
		parser.svelte_parse_expression()
	}

	pub fn svelte_parse_pattern(
		self,
		allow_type_annotation: bool,
	) -> std::result::Result<(oxc_ast::ast::BindingPattern<'a>, Trivias), Vec<OxcDiagnostic>> {
		let unique = UniquePromise::new();
		let parser = ParserImpl::new(
			self.allocator,
			self.source_text,
			self.source_type,
			self.options,
			unique,
		);
		parser.svelte_parse_pattern(allow_type_annotation)
	}
}

impl<'a> ParserImpl<'a> {
	pub fn svelte_parse_expression(
		mut self,
	) -> std::result::Result<(Expression<'a>, Trivias), Vec<OxcDiagnostic>> {
		// initialize cur_token and prev_token by moving onto the first token
		self.bump_any();
		let expr = self.parse_expr().map_err(|diagnostic| vec![diagnostic])?;
		let errors = self
			.lexer
			.errors
			.into_iter()
			.chain(self.errors)
			.collect::<Vec<_>>();
		if !errors.is_empty() {
			return Err(errors);
		}
		let trivias = self.lexer.trivia_builder.build();
		Ok((expr, trivias))
	}
	pub fn svelte_parse_pattern(
		mut self,
		allow_type_annotation: bool,
	) -> std::result::Result<(oxc_ast::ast::BindingPattern<'a>, Trivias), Vec<OxcDiagnostic>> {
		// initialize cur_token and prev_token by moving onto the first token
		self.bump_any();
		let expr = self
			.svelte_parse_pattern_inner(allow_type_annotation)
			.map_err(|diagnostic| vec![diagnostic])?;
		let errors = self
			.lexer
			.errors
			.into_iter()
			.chain(self.errors)
			.collect::<Vec<_>>();
		if !errors.is_empty() {
			return Err(errors);
		}
		let trivias = self.lexer.trivia_builder.build();
		Ok((expr, trivias))
	}
	fn svelte_parse_pattern_inner(
		&mut self,
		allow_type_annotation: bool,
	) -> oxc_diagnostics::Result<oxc_ast::ast::BindingPattern<'a>> {
		let span = self.start_span();

		let mut binding_kind = self.parse_binding_pattern_kind()?;
		let type_annotation = if allow_type_annotation && self.ts_enabled() {
			let type_annotation = self.parse_ts_type_annotation()?;
			if let Some(type_annotation) = &type_annotation {
				Self::extend_binding_pattern_span_end_(type_annotation.span, &mut binding_kind);
			}
			type_annotation
		} else {
			None
		};

		Ok(self
			.ast
			.binding_pattern(binding_kind, type_annotation, false))
	}

	fn extend_binding_pattern_span_end_(
		span: Span,
		kind: &mut oxc_ast::ast::BindingPatternKind<'a>,
	) {
		let pat_span = match kind {
			oxc_ast::ast::BindingPatternKind::BindingIdentifier(pat) => &mut pat.span,
			oxc_ast::ast::BindingPatternKind::ObjectPattern(pat) => &mut pat.span,
			oxc_ast::ast::BindingPatternKind::ArrayPattern(pat) => &mut pat.span,
			oxc_ast::ast::BindingPatternKind::AssignmentPattern(pat) => &mut pat.span,
		};
		pat_span.end = span.end;
	}
}
