# Domain Rules

- Keep this package pure, framework-free, and deterministic.
- Own value objects, enums, ruleset metadata, and domain error categories here.
- Do not add host APIs, random sources, clocks, transport code, or persistence code.
- If a rule cannot be expressed without side effects, push the side effect to a port in a higher layer.
