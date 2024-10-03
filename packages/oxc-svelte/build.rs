use std::path::PathBuf;
use std::{fs, io::ErrorKind};

use anyhow::Result;
use cargo::sources::SourceConfigMap;
use cargo::util::cache_lock::CacheLockMode::DownloadExclusive;
use cargo::{
	core::{
		package::{Package, PackageSet},
		registry::PackageRegistry,
		resolver::{features::CliFeatures, HasDevUnits},
		shell::Verbosity,
		Resolve, Workspace,
	},
	ops::{get_resolved_packages, load_pkg_lockfile, resolve_with_previous},
	util::important_paths::find_root_manifest_for_wd,
	GlobalContext,
};
use fs_extra::dir::{copy, CopyOptions};

pub fn main() {
	println!("cargo:rerun-if-changed=src/oxc_inject.rs");

	patch().expect("Failed to patch oxc");
}

fn apply_patch(path: PathBuf) {
	let lib = path.join("src/lib.rs");
	fs::write(
		&lib,
		fs::read_to_string(&lib)
			.expect("Failed to read lib.rs")
			.replacen(
				"\nmod parser_parse {",
				&format!(
					"\nmod parser_parse {{\n\n{}",
					include_str!("src/oxc_inject.rs")
				),
				1,
			),
	)
	.expect("Failed to write lib.rs");

	let injected = path.join("src/svelte.rs");
	fs::write(&injected, include_str!("src/oxc_inject.rs")).expect("Failed to write svelte.rs");
}

fn patch() -> Result<()> {
	clear_patch_folder()?;

	let gctx = GlobalContext::default()?;
	gctx.shell().set_verbosity(Verbosity::Quiet);
	let _lock = gctx.acquire_package_cache_lock(DownloadExclusive)?;
	let workspace_path = find_root_manifest_for_wd(&fs::canonicalize(".")?)?;
	let workspace = Workspace::new(&workspace_path, &gctx)?;
	let (pkg_set, resolve) = resolve_ws(&workspace)?;

	let oxc_id = resolve
		.iter()
		.find(|dep| dep.name().as_str() == "oxc_parser")
		.expect("oxc_parser dependency not found");

	let package = pkg_set
		.get_one(oxc_id)
		.expect("oxc_parser package not found");
	let path = copy_package(package);

	apply_patch(path);
	Ok(())
}

fn clear_patch_folder() -> Result<()> {
	match fs::remove_dir_all("target/patch") {
		Ok(_) => Ok(()),
		Err(err) => match err.kind() {
			ErrorKind::NotFound => Ok(()),
			_ => Err(err.into()),
		},
	}
}

fn copy_package(pkg: &Package) -> PathBuf {
	fs::create_dir_all("target/patch/").expect("Failed to create target/patch");
	let options = CopyOptions::new();

	copy(pkg.root(), "target/patch/", &options).expect("Failed to copy package");

	PathBuf::from("target/patch/")
		.join(pkg.root().file_name().unwrap())
		.canonicalize()
		.unwrap()
}

fn resolve_ws<'a>(ws: &Workspace<'a>) -> Result<(PackageSet<'a>, Resolve)> {
	let scm = SourceConfigMap::new(ws.gctx())?;
	let mut registry = PackageRegistry::new_with_source_config(ws.gctx(), scm)?;

	registry.lock_patches();
	let resolve = {
		let prev = load_pkg_lockfile(ws)?;
		let resolve: Resolve = resolve_with_previous(
			&mut registry,
			ws,
			&CliFeatures::new_all(true),
			HasDevUnits::No,
			prev.as_ref(),
			None,
			&[],
			false,
		)?;
		resolve
	};
	let packages = get_resolved_packages(&resolve, registry)?;
	Ok((packages, resolve))
}
