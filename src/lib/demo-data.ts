// Static, read-only sample research used by the public /demo experience.
// It never touches the database, so it cannot read or change anyone's saved work.

export const demoSearch = {
  topic: "How are cities cutting heat in dense neighbourhoods?",
  domain: "",
  keywords: ["urban heat island", "cool roofs", "tree canopy", "heat action plan"],
  dateFrom: "2024-01-01",
  dateTo: "2026-06-30",
  createdAt: "2026-06-18",
  synthesis: `### The problem is getting measurably worse
Dense neighbourhoods now run 4–8 °C hotter than nearby green areas during summer nights, and the gap has widened as building density and air-conditioning use have grown. Night-time heat, not the afternoon peak, is what drives most heat-related hospital admissions.

### What actually works
Three interventions show consistent, measurable results across cities: expanding tree canopy above roughly 30% coverage on a street, coating roofs and pavements with high-reflectance materials, and adding shaded water and rest points along everyday walking routes. Canopy delivers the largest cooling per euro over a ten-year horizon, but takes five to eight years to mature; reflective surfaces cool immediately and are the standard first move.

### Governance is the bottleneck
Cities that appointed a single heat officer with budget authority moved roughly three times faster than those coordinating through existing climate committees. Most published heat action plans still lack a funded maintenance line for watering young trees — the single most common cause of failed canopy programmes.

### What to watch next
Cooling-centre networks are shifting from emergency shelters to everyday public places such as libraries and transit stations, and several cities are beginning to write shade requirements directly into street design standards rather than treating them as climate add-ons.`,
  highlights: [
    "Night-time temperatures, not afternoon peaks, drive most heat-related hospital admissions.",
    "Street tree canopy above ~30% coverage gives the best long-run cooling per euro spent.",
    "Reflective roofs and pavements cool immediately, making them the usual first intervention.",
    "Cities with a dedicated heat officer moved about three times faster than committee-led cities.",
    "Missing maintenance budgets are the top cause of failed tree-planting programmes.",
    "Cooling centres are moving into everyday places like libraries and transit stations.",
    "Shade rules are starting to appear inside ordinary street design standards.",
  ],
  images: [
    {
      url: "https://images.unsplash.com/photo-1470723710355-95304d8aece4?w=800&q=70",
      caption: "Tree-lined street shading a dense block",
    },
    {
      url: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=800&q=70",
      caption: "Mature canopy cover over a residential district",
    },
    {
      url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=70",
      caption: "Dense city core with limited green space",
    },
    {
      url: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=800&q=70",
      caption: "White reflective roof surfaces on apartment blocks",
    },
    {
      url: "https://images.unsplash.com/photo-1444927714506-8492d94b4e3d?w=800&q=70",
      caption: "Public square with shade structures and water",
    },
    {
      url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=70",
      caption: "Urban park acting as a cooling refuge",
    },
  ],
  sources: [
    {
      id: "demo-1",
      title: "Urban heat islands: measurement and mitigation — city climate review",
      url: "https://example-research.org/urban-heat-island-review",
      snippet:
        "The most complete measurement dataset in the set, with night-time temperature series across 42 cities.",
      relevance: 96,
    },
    {
      id: "demo-2",
      title: "Cool roofs and reflective pavements: a five-year outcome study",
      url: "https://example-research.org/cool-roofs-outcomes",
      snippet: "Quantifies immediate surface cooling and the maintenance costs cities underestimate.",
      relevance: 92,
    },
    {
      id: "demo-3",
      title: "Street tree canopy targets and health outcomes",
      url: "https://example-research.org/canopy-health-outcomes",
      snippet: "Links canopy coverage above 30% to lower heat-related emergency admissions.",
      relevance: 89,
    },
    {
      id: "demo-4",
      title: "City heat action plans: what the first generation got wrong",
      url: "https://example-research.org/heat-action-plans",
      snippet: "Reviews 60 published plans and finds maintenance funding missing from most of them.",
      relevance: 84,
    },
    {
      id: "demo-5",
      title: "Appointing a chief heat officer: early governance lessons",
      url: "https://example-research.org/chief-heat-officer",
      snippet: "Compares delivery speed between dedicated heat roles and committee structures.",
      relevance: 78,
    },
    {
      id: "demo-6",
      title: "Cooling centres as everyday infrastructure",
      url: "https://example-research.org/cooling-centres",
      snippet: "Describes the shift from emergency shelters to libraries, transit hubs and pools.",
      relevance: 71,
    },
    {
      id: "demo-7",
      title: "Shade requirements in street design standards",
      url: "https://example-research.org/shade-standards",
      snippet: "Early examples of shade written into ordinary road and pavement codes.",
      relevance: 64,
    },
  ],
  messages: [
    {
      id: "demo-m1",
      role: "user",
      content: "If a mid-sized city could only fund one intervention next year, which should it be?",
    },
    {
      id: "demo-m2",
      role: "assistant",
      content:
        "**Reflective roofs and pavements** on the hottest few blocks [2]. They cool immediately, need no growing season, and are the cheapest per square metre to deploy in a single budget year.\n\nTree canopy [3] gives more cooling over ten years, but only if planting comes with a funded watering and maintenance line — the most common failure point in reviewed plans [4]. If the city can commit to that maintenance, split the budget: reflective surfaces now, canopy started in parallel.",
    },
    {
      id: "demo-m3",
      role: "user",
      content: "How should they decide which blocks come first?",
    },
    {
      id: "demo-m4",
      role: "assistant",
      content:
        "Rank blocks on three overlapping layers rather than temperature alone [1]:\n\n- **Night-time heat**, since overnight temperatures track health impact most closely.\n- **Resident vulnerability** — age, chronic illness and lack of home cooling.\n- **Existing shade**, so you spend where canopy and awnings are thinnest.\n\nBlocks scoring high on all three usually make up a small share of the city, which keeps a first-year programme affordable and gives measurable results [4].",
    },
  ],
};
