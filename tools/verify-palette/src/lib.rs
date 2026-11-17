//! The `mzizi-tokens` palette as data: the one place the crate's 21 constants are listed.

/// The crate's 21 families as (name, dark, light).
pub const CRATE: [(&str, &str, &str); 21] = {
    use mzizi_tokens::*;
    [
        ("cobalt", COBALT_DARK, COBALT_LIGHT),
        ("tanzanite", TANZANITE_DARK, TANZANITE_LIGHT),
        ("malachite", MALACHITE_DARK, MALACHITE_LIGHT),
        ("gold", GOLD_DARK, GOLD_LIGHT),
        ("terracotta", TERRACOTTA_DARK, TERRACOTTA_LIGHT),
        ("sodalite", SODALITE_DARK, SODALITE_LIGHT),
        ("copper", COPPER_DARK, COPPER_LIGHT),
        ("indigo", INDIGO_DARK, INDIGO_LIGHT),
        ("savanna", SAVANNA_DARK, SAVANNA_LIGHT),
        ("baobab", BAOBAB_DARK, BAOBAB_LIGHT),
        ("sunset", SUNSET_DARK, SUNSET_LIGHT),
        ("river", RIVER_DARK, RIVER_LIGHT),
        ("hematite", HEMATITE_DARK, HEMATITE_LIGHT),
        ("kalahari", KALAHARI_DARK, KALAHARI_LIGHT),
        ("ember", EMBER_DARK, EMBER_LIGHT),
        ("acacia", ACACIA_DARK, ACACIA_LIGHT),
        ("fern", FERN_DARK, FERN_LIGHT),
        ("lagoon", LAGOON_DARK, LAGOON_LIGHT),
        ("storm", STORM_DARK, STORM_LIGHT),
        ("dusk", DUSK_DARK, DUSK_LIGHT),
        ("protea", PROTEA_DARK, PROTEA_LIGHT),
    ]
};
