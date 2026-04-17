# Classic Golden Replay Example Note

Use a note like this beside a fixture or in a PR summary:

- Scenario: classic match with buy-chain into royal reward
- Why it exists: protects chained ability order and final-state determinism
- Expected metadata: `schemaVersion`, `rulesetVersion`, `engineVersion`, `seed`
- Expected validation: replay verifies and `finalStateHash` stays unchanged unless the semantic update is intentional
