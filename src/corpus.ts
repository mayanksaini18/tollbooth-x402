/**
 * The Meridian's archive. 40 articles, of which roughly a dozen actually bear on
 * the demo question. The rest are decoys — the agent has to tell them apart from
 * previews alone, before it has paid for a single word of body text.
 */
export interface Article {
  id: string;
  title: string;
  date: string;
  section: string;
  body: string;
}

const A = (id: string, section: string, date: string, title: string, body: string): Article =>
  ({ id, section, date, title, body });

export const ARTICLES: Article[] = [
  // ---- relevant to: health effects of microplastics in humans ----
  A("mp-blood", "Health", "2026-08-14", "Microplastic particles found in 80% of human blood samples in Dutch cohort",
    "Researchers analysing blood from 312 healthy adults detected polymer particles in four out of five samples, with polyethylene terephthalate and polystyrene the most common. Concentrations averaged 1.6 micrograms per millilitre, though the team cautions that detection does not by itself establish harm. The study is the largest of its kind and gives epidemiologists a baseline exposure figure they have lacked."),
  A("mp-placenta", "Health", "2026-07-02", "Plastic fragments detected on both sides of the placental barrier",
    "A team in Bologna reported polymer fragments in 17 of 22 placentas donated after uncomplicated births, appearing on both the maternal and foetal sides. Particle sizes clustered between 5 and 10 micrometres, small enough to cross membranes that block larger debris. The authors stop short of claiming developmental effects, calling instead for cohort studies that follow the children."),
  A("mp-lungs", "Health", "2026-06-19", "Airborne microplastics lodge deep in lung tissue, surgical study finds",
    "Tissue taken during 13 lung operations contained polypropylene and PET fibres in 11 cases, including in the lower lobes where clearance is slowest. Inhalation, not ingestion, may be the dominant exposure route for adults in urban environments. The researchers measured indoor air at the same patients' homes and found fibre counts three times higher than outdoor readings."),
  A("mp-cardio", "Health", "2026-05-30", "Plaque containing microplastics linked to higher cardiac event rate",
    "In a 257-patient follow-up, those whose carotid plaque contained detectable polyethylene had a substantially elevated rate of heart attack, stroke or death over 34 months. The association survived adjustment for smoking, cholesterol and diabetes. Cardiologists not involved in the work called the result striking but stressed it is observational and cannot yet establish causation."),
  A("mp-inflam", "Science", "2026-04-11", "How the immune system reacts to polystyrene at realistic doses",
    "Macrophages exposed to polystyrene beads at concentrations matching human tissue burdens released elevated interleukin-6 and tumour necrosis factor alpha. The response scaled with particle surface area rather than mass, which may explain why smaller fragments appear disproportionately active. Effects were measured in cell culture and have not been reproduced in living animals."),
  A("mp-dose", "Science", "2026-03-22", "The dose-response problem that keeps microplastics research inconclusive",
    "Most toxicology to date has used particle concentrations orders of magnitude above anything measured in human tissue, making the results hard to interpret. A growing group of researchers argues the field must standardise on environmentally realistic doses before drawing conclusions. Without that, they warn, the literature will keep producing alarming findings that do not generalise."),
  A("mp-water", "Health", "2026-02-08", "Bottled water contains far more nanoplastic than previously estimated",
    "A new imaging technique counted roughly 240,000 detectable plastic fragments per litre in popular bottled brands, most of them under one micrometre and previously invisible to standard methods. Around 90% were nanoplastics rather than the larger microplastics earlier surveys captured. Tap water sampled in the same cities contained substantially fewer."),
  A("mp-seafood", "Health", "2026-01-17", "Shellfish remain the largest dietary source of ingested plastic",
    "Because bivalves are eaten whole, including the digestive tract, they deliver more polymer per serving than any other common food. Estimated annual intake for regular shellfish eaters reached 11,000 particles. The authors note that cooking does not remove the fragments and that intake varies enormously by diet."),
  A("mp-gut", "Science", "2025-12-05", "Gut microbiome shifts observed in mice fed environmentally realistic plastic doses",
    "Mice consuming polyethylene at doses calibrated to human exposure showed reduced microbial diversity and thinning of the intestinal mucus layer after twelve weeks. Changes appeared before any weight or behavioural differences emerged. Whether the same happens in humans, whose gut communities are far more variable, is unresolved."),
  A("mp-kids", "Health", "2025-11-14", "Infant faeces contain ten times the microplastic load of adults",
    "Sampling from 16 infants and 10 adults found markedly higher PET concentrations in the infants, likely from bottles, teethers and floor dust. Crawling and mouthing behaviour puts small children in sustained contact with degraded plastic surfaces. Paediatricians called for exposure guidance aimed specifically at the first two years."),
  A("mp-policy", "Politics", "2025-10-21", "Global plastics treaty stalls over production caps",
    "Negotiators adjourned without agreement after a bloc of petrochemical-producing states rejected binding limits on primary polymer production. Health researchers had lobbied for exposure-reduction language citing the accumulating human tissue evidence. Talks resume next spring with the health annex unresolved."),
  A("mp-methods", "Science", "2025-09-09", "Why two labs analysing the same sample report different plastic counts",
    "An inter-laboratory comparison sent identical water samples to nine research groups and got counts varying by more than an order of magnitude. Differences in filter pore size, spectroscopic threshold and contamination control explained most of the spread. The authors propose a reference protocol, arguing the field cannot pool results until measurement is comparable."),

  // ---- decoys ----
  A("d01", "Sport", "2026-08-30", "City edge derby with stoppage-time header", "A deflected corner in the 94th minute settled a bad-tempered derby that produced eight bookings. The result lifts City to third."),
  A("d02", "Business", "2026-08-28", "Chipmaker beats forecasts on data-centre demand", "Quarterly revenue rose 34% year on year, driven almost entirely by accelerator sales. Shares climbed 6% in after-hours trading."),
  A("d03", "Politics", "2026-08-25", "Coalition talks enter third week without agreement", "Negotiators remain divided over energy subsidies and the deficit target. A caretaker government continues in the meantime."),
  A("d04", "Culture", "2026-08-22", "The novelist who spent eleven years on a single sentence", "Her second book runs to 700 pages and one unbroken clause. Critics are divided; readers, mostly delighted."),
  A("d05", "Science", "2026-08-20", "Webb telescope resolves atmospheric bands on a distant super-Earth", "Spectroscopy suggests a thick carbon dioxide envelope. The planet orbits a quiet M-dwarf 41 light years away."),
  A("d06", "Health", "2026-08-18", "Sleep apnoea underdiagnosed in women, review finds", "Symptom presentation differs from the classic male pattern, leading to missed referrals. Reviewers urge revised screening questions."),
  A("d07", "Business", "2026-08-15", "Freight rates fall as new container capacity comes online", "Spot rates on Asia-Europe routes dropped 18% this month. Carriers are idling ships to defend pricing."),
  A("d08", "Sport", "2026-08-12", "Marathon record falls by 27 seconds in Berlin", "Near-perfect conditions and aggressive early pacing produced the fastest time ever recorded over the distance."),
  A("d09", "Technology", "2026-08-10", "Open-source model matches proprietary rivals on reasoning benchmarks", "The release is permissively licensed and small enough to run on consumer hardware."),
  A("d10", "Politics", "2026-08-07", "Municipal elections deliver record low turnout", "Fewer than one in three registered voters participated. Analysts point to ballot fatigue after three national votes in two years."),
  A("d11", "Culture", "2026-08-05", "Restored silent film screens for first time in ninety years", "A single surviving print was found in a Prague archive and painstakingly digitised frame by frame."),
  A("d12", "Science", "2026-08-02", "Antarctic sea ice hits second-lowest maximum on record", "The maximum fell 1.1 million square kilometres below the long-term average. Researchers link the shortfall to ocean heat."),
  A("d13", "Business", "2026-07-29", "Central bank holds rates, signals patience", "Policymakers voted 7-2 to hold. The statement dropped previous language about further tightening."),
  A("d14", "Health", "2026-07-26", "Measles cases climb in under-vaccinated districts", "Public health teams report 240 confirmed cases this quarter, concentrated in four districts with coverage below 85%."),
  A("d15", "Technology", "2026-07-23", "Undersea cable cut slows traffic across three countries", "Repair vessels expect a ten-day fix. Operators rerouted traffic, adding latency but avoiding outages."),
  A("d16", "Sport", "2026-07-20", "Teenage swimmer takes third national title", "She has now broken her own junior record in consecutive meets and qualifies for the world championships."),
  A("d17", "Culture", "2026-07-18", "Museum returns bronzes after decade-long negotiation", "Twelve objects will be transferred next month under a long-term partnership agreement."),
  A("d18", "Science", "2026-07-15", "Fungal network mapping reveals unexpected carbon storage", "Mycorrhizal networks may hold considerably more soil carbon than current climate models assume."),
  A("d19", "Business", "2026-07-12", "Grocery chain trials dynamic shelf pricing", "Electronic labels update several times daily. Consumer groups have raised concerns about surge pricing on staples."),
  A("d20", "Politics", "2026-07-09", "Court strikes down surveillance provision", "The judgment found bulk retention disproportionate. The government has eight months to rewrite the statute."),
  A("d21", "Technology", "2026-07-06", "Battery chemistry breakthrough claims 900-cycle durability", "The sodium-ion design avoids lithium entirely, though energy density remains below incumbent cells."),
  A("d22", "Health", "2026-07-03", "Walking pace predicts outcomes better than step count", "In a 60,000-person cohort, brisk walking associated more strongly with cardiovascular outcomes than total daily steps."),
  A("d23", "Culture", "2026-06-30", "Jazz festival returns after four-year hiatus", "Organisers have programmed 60 acts across nine venues, with half the schedule free to attend."),
  A("d24", "Sport", "2026-06-27", "Cycling team disqualified over equipment infringement", "Commissaires found a non-compliant frame depth during post-stage inspection."),
  A("d25", "Business", "2026-06-24", "Office vacancy rates plateau after three-year slide", "Letting activity picked up in the second quarter, though rents remain well below their 2022 peak."),
  A("d26", "Science", "2026-06-21", "Ancient DNA rewrites timeline of horse domestication", "Genomes from 200 archaeological specimens push the date back roughly 800 years."),
  A("d27", "Technology", "2026-06-18", "Regulator opens inquiry into app store billing terms", "The investigation focuses on whether commission rates foreclose competing payment providers."),
  A("d28", "Politics", "2026-06-15", "Border agreement signed after eighteen months of talks", "The deal establishes a joint monitoring commission and phased tariff reductions."),
];

/** What a non-paying caller is allowed to see. This is the appraisal surface. */
export const PREVIEW_CHARS = 220;
export const previewOf = (a: Article) =>
  a.body.length <= PREVIEW_CHARS ? a.body : a.body.slice(0, PREVIEW_CHARS).replace(/\s+\S*$/, "") + "…";

export const byId = new Map(ARTICLES.map((a) => [a.id, a]));
