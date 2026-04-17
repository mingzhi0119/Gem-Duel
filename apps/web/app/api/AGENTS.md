# Web API Rules

- This directory is BFF only: request validation, translation, aggregation, proxying, and response shaping.
- Never resolve match state, Buff effects, score calculation, or winner determination here.
- If an endpoint needs gameplay truth, call an application-layer use case or an authority service instead.
