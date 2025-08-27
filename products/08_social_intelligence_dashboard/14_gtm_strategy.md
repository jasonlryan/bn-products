# Social Intelligence Dashboard • Gtm Strategy

Implementation Playbook — Social Intelligence Dashboard
Audience: GTM, Sales, Delivery, Partnerships, Marketing, Leadership (Brilliant Noise)

Assumption (baseline for all plans)
- Current state (assumed): Product launched, 3 paid pilot customers, annual revenue from product ≈ £500k (avg deal value £50k). Delivery team: 4 FTEs (1 PM, 2 analysts/data-scientists, 1 engineer). Sales support: 1 AE + 1 SDR (part-time). Use these as starting capacity unless you provide different baseline. All timelines measured from project kick-off (Month 0).

High-level goal
- 10x revenue to £5M ARR within 36 months while maintaining B‑Corp values and consultancy-quality delivery.

1) Channel Strategy (primary / secondary with rationale)
Primary channels (focus, highest ROI vs ICP)
- Enterprise Direct Sales (Account-Based Marketing + field sales)
  - Rationale: Target buyers (CMOs, CDOs, Heads of Product) require relationships, trust and consultative selling. High ACV is suited to direct enterprise model.
  - Tactics: Named account ABM (top 50 OEMs & tier-1 suppliers), executive briefings, bespoke pilots.
- Strategic Partnerships & Referrals (consultancies, systems integrators, OEM networks)
  - Rationale: Partners provide market access, credibility and complementary services (system integration, product development) and accelerate sales cycles.
  - Tactics: Co-sell agreements, revenue share referral programs, joint case studies.
- Industry Events & Thought Leadership (conferences, research)
  - Rationale: Automotive/motorcycle decision makers attend sector events; strong platform for positioning predictive foresight and proof-of-performance.

Secondary channels (support, scale)
- Content & Performance Marketing (LinkedIn Ads, targeted search)
  - Rationale: Lead generation for mid-funnel and to nurture accounts; scalable once messaging is proven.
- PR & Trade Press (Autocar, Automotive News, Motorcyclist)
  - Rationale: Credibility and brand awareness within verticals.
- Community & Developer Outreach (OEM innovation labs, university partnerships)
  - Rationale: Long-term pipeline and access to research/data sources.

Quick wins (channel actions 0–6 months)
- Launch ABM pilot for 20 named accounts with tailored collateral.
- Seal 2 strategic partner MOUs (one consultancy and one data provider).
- Secure speaking slot at 2 relevant industry events in next 6–9 months.

2) Scalability Roadmap (path to 10x revenue; capacity constraints, milestones, timeline)
Phasing and targets
- Phase A — Stabilize & Repeatable (Months 0–6)
  - Goal: Validate repeatable sale → delivery process. ARR target: £0.5M → £1.2M.
  - Capacity constraint: Existing delivery team can handle ~6 simultaneous engagements (8–12 weeks each) or approx 12 projects per year at current efficiency.
  - Milestones:
    - M1 (M1–M2): Formalize delivery playbook and SOW templates.
    - M2 (M3–M6): Close 6 new paying clients (avg £50k), develop 3 case studies.
  - Actions: Hire 1 AE, 1 dedicated Customer Success; invest in ETL connectors.
- Phase B — Scale & Automate (Months 6–18)
  - Goal: 3x capacity via automation and hires. ARR target: £1.2M → £3M.
  - Capacity improvements: Template library + automated ETL + dashboard provisioning reduce implementation time by 40%. One delivery pod can handle ~9 projects/year.
  - Milestones:
    - M3 (M6–M9): Deliver automated pipeline and templates for 3 core markets.
    - M4 (M9–M12): Launch multi-market package pricing & productized pilot.
    - M5 (M12–18): Establish 5 partner channels delivering 20% of revenue.
  - Actions: Hire 2 data engineers, 2 analysts, 1 Product Manager, scale SDRs to 2.
- Phase C — Productize & Expand (Months 18–36)
  - Goal: Move toward SaaS/self-service tier + expand geography. ARR target: £3M → £5M+.
  - Capacity: SaaS tier handles SMB/mid-market leads; consultative enterprise focus supported by smaller delivery team, allowing 10x revenue without linear headcount growth.
  - Milestones:
    - M6 (M18–24): Launch SaaS self-serve "Insight Lite" for single-market monitoring (£15k annual equivalent).
    - M7 (M24–36): Integrate with major data platforms (Snowflake, Databricks) and launch reseller program.
    - M8 (M30–36): Reach £5M ARR with ~50% enterprise / 30% self-serve / 20% partner revenue mix.
  - Actions: Hire platform engineer(s), SaaS product lead, additional AEs focused on enterprise expansion.

KPIs per phase (sample)
- Phase A: Close rate 18–25%, Sales cycle 12 weeks, NPS >8, Time-to-value 8–12 weeks.
- Phase B: Close rate 22–30% (with ABM), Time-to-value 5–8 weeks, delivery throughput +2.5x.
- Phase C: Gross margin >60% (SaaS uplift), CAC payback <12 months.

3) Operational Model (delivery process, quality control, resource requirements)
Delivery process (standard 8–12 week enterprise implementation; faster for productized pilot)
- Step 0 — Sales Handoff: Sales + AE deliver executive kickoff packet (objectives, KPIs, sample dashboard).
- Step 1 — Discovery (Week 0–1): 2‑hour stakeholder workshop, confirm success metrics.
- Step 2 — Data Intake & Mapping (Week 1–2): List sources, connectors, legal/data access. Data engineer creates ETL plan.
- Step 3 — Ingest & Clean (Week 2–4): Ingest 50+ sources per market, apply governance, store in project workspace.
- Step 4 — Signal Modelling & RRI (Week 3–6): Data scientist runs weighting, trains models, backtests signals.
- Step 5 — Dashboard Build & Validation (Week 5–8): UX dev + analyst build interactive dashboard; Client validation sessions.
- Step 6 — Training & Handover (Week 8–10): Admin training, playbooks, 30/60/90 day monitoring plan.
- Step 7 — Ongoing Monitoring & Insights (Post-launch): Monthly insights pack, quarterly strategic review.

Quality control & governance
- Data governance checklist for each market (source validation, freshness, privacy).
- Model validation: backtest signal accuracy vs historical product outcomes; publish model performance dashboard.
- Release checklist & peer review for each delivery (data scientist + QA + PM signoff).
- SLAs: Data freshness (daily/weekly), dashboard uptime (>99%), response time for incidents (4 business hours).
- Security & compliance: PII redaction, vendor contracts, ISO-aligned practices (or SOC2 roadmap).

Resource profile per enterprise engagement (typical)
- Engagement length: 8–12 weeks.
- Core team (per engagement):
  - 0.8 Engagement Manager (EM)
  - 1.2 Data Scientist / Analyst
  - 0.5 Data Engineer (if bespoke connectors needed)
  - 0.5 UX/BI Developer
  - 0.2 AI Engineer (for model tweaks)
- Total billable hours per engagement: ~420–600 hours.
- Utilization target: 70% for analysts/engineers; no individual should own more than 3 concurrent implementations.

Operational constraints & mitigation
- Constraint: Manual ETL and bespoke dashboards are the throughput bottleneck.
  - Mitigation: Prioritize building connectors and dashboard templates (Q1–Q2).
- Constraint: Sales runway for large OEM cycles (long procurement).
  - Mitigation: Offer paid short pilots to shorten decision-making and prove ROI.

4) Partnership Framework (referral programs, strategic partnerships)
Partner tiers & roles
- Referral Partners (low enablement, 10–20% referral fee)
  - Ideal: industry consultants, agencies in non-competing verticals.
  - Offer: co-branded case study, 10–15% referral fee on first-year revenue.
- Integration/Resell Partners (medium enablement, margin share)
  - Ideal: data platforms (Snowflake partners), BI resellers, regional consultancies.
  - Offer: 20–30% revenue share or discounted license + implementation fee for partners to resell.
- Strategic Alliances (high enablement, co-development)
  - Ideal: Tier-1 OEM consultancies, systems integrators, data providers (GDELT, CrowdTangle equivalents).
  - Offer: joint go-to-market, shared case studies, co-funded pilots, preferred partner status.

Partner enablement & governance
- Onboarding kit: Sales playbook, technical integration guide, 1‑day enablement workshop, 6-week sandbox access.
- Quarterly Partner Advisory Board: performance reviews, co-selling pipeline, roadmap input.
- KPIs: partner-sourced pipeline, conversion rate, time-to-close, co-marketing leads.
- Contract templates: Referral agreement, reseller MSA, Co-sell SLA.

Action items (0–6 months)
- Identify & sign 3 anchor partners (1 consultancy, 1 data provider, 1 regional systems integrator).
- Build partner portal: assets, demo tenant, certification path (Bronze/Silver/Gold).
- Run first partner co-sell pilot and publish results.

5) Marketing Engine (channel priorities, content strategy, lead generation)
Channel priorities (by phase)
- Phase A: ABM + Thought Leadership + Events (to close enterprise pilots)
- Phase B: Scaled Content + Paid LinkedIn + Webinars + PR
- Phase C: Product-led growth content, SEO for self-serve, partner co-marketing

Content strategy (pillar plan)
- Pillar 1 — Evidence & Proof (case studies, back-test reports showing 6-month lead indicator)
- Pillar 2 — ROI & Risk Reduction (playbook: typical £500K mistake avoided; ROI calculator)
- Pillar 3 — The Tech POV (explain Weighted Resonance Index, data sources, AI rigor)
- Pillar 4 — Market-specific Insight Packs (automotive EV trends, motorcycle rider preferences)
Formats
- Executive one-pagers, whitepapers, long-form POVs, webinars, short videos (2–4 mins), LinkedIn carousel posts, demo recordings.
- Build 6 enterprise case studies in 12 months (must include hard ROI metrics).

Lead generation tactics & targets
- ABM program: 50 named accounts per quarter (target list mapping, 3-touch personalized campaign).
- SDR outbound: 100–150 targeted outreach sequences per month; target response rate 8–12%.
- Paid LinkedIn: promote executive content + webinar invites; CPL target £150–£300.
- Webinars: 6 per year featuring clients and partners; goal 40–80 qualified attendees each.

Marketing ops & KPIs
- Funnel metrics: MQL → SQL conversion, pipeline generated, CAC, CAC payback, Marketing influenced ARR.
- KPI targets for Year 1: Generate pipeline equivalent to 6x target revenue; MQL to SQL 25–30%.

Action items (0–90 days)
- Build ABM account playbooks for top 50 accounts.
- Launch ROI calculator and landing page.
- Produce 3 proof-driven case studies / POVs.
- Schedule 2 webinars with industry partners.

6) Sales Process (qualification, conversion, onboarding)
Qualification framework (Bespoke for ICP)
- Mandatory filters: Industry match (automotive/motorcycle), revenue ≥ €50M, product/strategy remit for buyer, mult i-market ambition (3+ markets preferred).
- Qualification script: Budget (£15k–£50k+), Authority (CDO/CMO/Product VP), Need (launch/expansion planning), Timeline (6–12 months), KPI (what success looks like).
- Scorecard: fit score (0–100), deals >70 proceed to AE discovery.

Commercial motions & packaging
- Packages:
  - Insight Starter (£15k): Single-market diagnostic, 4-week analysis.
  - Multi-Market Package (£35k+): 3-market package, standard dashboard.
  - Full Implementation & Training (£50k+): End-to-end implementation, custom integrations, training + 12-month monitoring.
- Pilot offer: Paid, fixed-scope 6–8 week "Market Signal Pilot" priced at 30–40% of full implementation to accelerate decision-making.
- Pricing guidance: Use value-based pricing — lead with price range, escalate with market count and custom integration complexity.

Sales stages & timelines
- Discovery (1–2 weeks) → Proposal & Pilot (1–3 weeks) → Pilot execution (6–8 weeks) → Executive review & contract negotiation (2–6 weeks) → Delivery ramp (8–12 weeks).
- Typical enterprise sales cycle: 12–24 weeks; pilot reduces to 8–12 weeks for closing.

Onboarding & CS
- Onboarding checklist: stakeholder map, data access, KPI dashboard, training schedule.
- Customer success 30/60/90 plan with defined outcomes (first insight, tactical decision, strategic roadmap).
- Expansion playbook: quarterly business reviews, cross-sell to product teams, packaged add-ons (custom dashboards, API access).

Sales KPIs
- Target AE quota: £800k–£1M ARR per senior AE (enterprise).
- SDR KPIs: 60 outbound connects/month, 6 SQLs/month.
- Conversion targets: Pilot → Paid enterprise: 40–60%.

Action items (0–3 months)
- Build pilot product kit (template SOW, deliverables, price).
- Train AEs & SDRs on ICP script and ROI messaging.
- Implement CRM sales stages, dashboards and pipeline hygiene rules.

7) Growth Levers (automation, productization path, team expansion plan)
Automation opportunities (impact & timeline)
- Automated ETL/connectors for top 10 data sources (GDELT, Twitter/X, Reddit, industry forums) — reduce manual work by 30–50% (Timeline: Q1–Q6).
- Dashboard templating & provisioning engine — 40% faster delivery (Q3–Q9).
- Auto-generated insight summaries (NLP reports) — reduces analyst hours for recurring reports (Q6–Q12).
- Alerts & anomaly detection for clients — product value-add and retention lever (Q9–Q15).

Productization path (3-tier model)
- Tier 1 — Insight Lite (SaaS, self-serve): Single market monitoring, template dashboards, monthly reports. Price: £15k/year or equivalent.
- Tier 2 — Insight Pro (Productized & Managed): Multi-market (3), configurable dashboards, quarterly strategy review. Price: £35k–£60k.
- Tier 3 — Insight Enterprise (Consultative): Custom integrations, bespoke modelling, on-site workshops, SLA. Price: £50k+.

Roadmap & revenue effects
- Deliver Insight Lite to 20+ accounts by Year 2 to capture mid-market and generate recurring revenue and referrals; increases gross margin and lowers CAC per £ revenue.
- Enterprise motion continues to provide high-margin, strategic work and references.

Team expansion plan (headcount by phase; hires prioritized)
- Phase A hires (Months 0–6):
  - +1 AE (enterprise), +1 SDR (full-time), +1 Customer Success Manager, +1 Data Engineer (part-time).
- Phase B hires (Months 6–18):
  - +2 Data Engineers, +2 Analysts/Data Scientists, +1 Product Manager (platform), +1 UX/BI Developer, +1 Marketing Ops (ABM), +1 Partnerships Lead.
- Phase C hires (Months 18–36):
  - +2 Platform Engineers, +1 SaaS Product Lead, +2 Enterprise AEs, +1 Legal/Compliance resource, scale Customer Success to 3 FTEs.
- Example capacity math (after Phase B automation):
  - 1 Delivery Pod = 1 EM + 2 Analysts + 1 Data Engineer + 0.5 UX = ~9–12 projects/year.
  - With 6 pods (post-hiring and automation) → ~60–72 projects/year; at avg £50k = £3–3.6M (matching Phase B target).

Team enablement & culture
- Hire for blend of AI technical capability + sector experience (automotive).
- Maintain B‑Corp values in hiring, vendor selection and partnerships.

Specific action items & owners (0–90 / 180 / 365 days)
0–30 days (immediate)
- Leadership: Approve baseline assumptions & 36-month target.
- Sales: Create pilot SOW, price list, negotiation playbook. (Owner: Head of Sales)
- Delivery: Document delivery playbook + 3 templates (discovery, RRI model, dashboard config). (Owner: Head of Delivery)
- Marketing: Launch ABM target list top 50 + build ROI calculator landing page. (Owner: Head of Marketing)

31–90 days (build & initial scale)
- Hire AE + SDR + CSM. (Owner: People Ops)
- Sign 2 anchor partners (referral & data provider). (Owner: Partnerships Lead)
- Produce 3 case studies and run first partner webinar. (Owner: Marketing)
- Begin building top-10 connectors roadmap and prioritize one quick-win connector. (Owner: Product/Eng)

91–180 days (automation & scale)
- Deploy automated ETL for 3 sources; measure delivery time reduction. (Owner: Data Engineering)
- Launch productized multi-market package and pilot priced offers. (Owner: Product & Sales)
- Expand ABM to 100 accounts; measure pipeline velocity. (Owner: Marketing & Sales Ops)

180–365 days (productization & partners)
- Launch Insight Lite MVP (self-serve) to 10 beta customers. (Owner: Product)
- Sign 3 resellers/integration partners and publish co-sell case study. (Owner: Partnerships)
- Achieve ARR target for Year 1 plan; ready Phase B hiring plan for Year 2.

Risks & mitigation
- Long enterprise sales cycles → Mitigate with paid pilots and partner-sourced leads.
- Delivery quality dilution with scale → Mitigate via automation, playbooks, peer reviews, client success ratio limits.
- Data source changes/regulatory risk → Mitigate with diversified source list, legal signoffs, privacy-first architecture.

Metrics dashboard to track monthly
- Revenue (ARR), New ARR, Churn, Customer NPS
- Number of pilots started → conversion to paid
- Delivery throughput (projects completed / quarter)
- Average time-to-value
- CAC, CAC payback, LTV:CAC
- Partner-sourced pipeline and revenue

Closing summary (one-line)
- Execute a 3-phase plan: stabilize repeatable enterprise sales and delivery, invest in automation & partners to scale throughput, then productize into a SaaS/self-serve tier — each phase with specific hires, automation builds and partner plays to reach £5M ARR in 36 months while preserving consultancy-quality output.

If you want, I can:
- Convert the above into a 12–18 month Gantt with owner-level timelines and hiring dates.
- Produce templated SOW, pilot contract, partner MOU, and sales scripts tailored to CMOs/Heads of Product.
