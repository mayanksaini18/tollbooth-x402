# Project Brief — Tollbooth

**Who is the agent?** A research agent answering a question from published sources.

**What does it need?** Article text that publishers currently block crawlers from reading.

**What does it pay for?** Per-article access at $0.001 — priced, not gated.

**Why does x402 make it possible?** A publisher cannot onboard a million crawlers into
contracts, but it can price a URL. Discovery, appraisal and payment collapse into one
HTTP round trip: the 402 carries a free preview and a price, and the retry carries the
money.

**Where does Algorand fit?** Sub-cent fees mean a $0.001 sale nets $0.001 rather than a
loss; ~3s finality lets settlement happen inside the request; the facilitator sponsors
the transaction fee so the crawler needs almost no ALGO.
