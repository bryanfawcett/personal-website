//! Print the TypeScript declarations for every registered component.
//! `pnpm rust:wasm` writes this to `src/integrations/rust/components.d.ts`.

fn main() {
    print!("{}", components_wasm::typings());
}
