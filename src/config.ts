/* BeadFactory Pro — site content.
 * Schema: src/types.ts. Runtime checks: src/lib/validateConfig.ts.
 */
import type { SiteConfig } from './types'

const img = (src: string, alt: string, position?: string) => ({ src, alt, ...(position ? { position } : {}) })

export const config: SiteConfig = {
  locale: 'en',
  siteTitle: 'BeadFactory Pro — Smart Color Formulation & Production Management',
  siteDescription:
    'BeadFactory Pro manages raw material inventory, color formulation recipes, production feasibility and customer pricing for plastic bead manufacturers — on the floor and on the phone.',
  brandName: 'BEADFACTORY PRO',

  theme: {
    canvas: '#0a0c0e',
    surface: '#14181d',
    ink: '#f2efe7',
    menuBg: '#f0ede4',
    menuInk: '#15181c',
    menuLine: 'rgba(21, 24, 28, 0.14)',
    accent: '#f2a33c',
    glow: '#f2a33c',
    muted: '#8b9096',
    faint: '#5b6066',
    /* "scroll = descent": from the bright loading dock down to the night shift */
    depthZones: {
      surface: '#e9e6db',
      drift: '#a09a8c',
      twilight: '#3f4045',
      deep: '#15181d',
      abyss: '#05070a',
    },
  },

  depthGauge: { enabled: true, maxDepthM: 1200 },

  menu: {
    brandMark: 'B·P',
    email: 'hello@beadfactory.pro',
    homeLabel: 'HOME',
    openAria: 'Open menu',
    closeAria: 'Close menu',
    mailAria: 'Send us an email',
    form: 'dock',
    layout: 'ledger',
    rows: [
      {
        id: 'home',
        label: 'HOME',
        subLabel: '( INDEX )',
        href: '/',
        thumbs: [img('/media/bf-beads-macro.jpg', 'Glossy plastic beads macro'), img('/media/bf-spiral.jpg', 'Bead color spiral')],
      },
      {
        id: 'about',
        label: 'ABOUT',
        subLabel: '( FACTORY )',
        href: '/about',
        thumbs: [img('/media/bf-floor.jpg', 'Manufacturing floor'), img('/media/bf-qc.jpg', 'Bead quality check')],
      },
      {
        id: 'work',
        label: 'MODULES',
        subLabel: '( SYSTEM )',
        href: '/work',
        thumbs: [img('/media/bf-lab-bench.jpg', 'Formulation bench'), img('/media/bf-sorting.jpg', 'Sorted bead trays')],
      },
      {
        id: 'lab',
        label: 'COLOR LAB',
        subLabel: '( TRIALS )',
        href: '/lab',
        thumbs: [img('/media/bf-extrusion.jpg', 'Extrusion line'), img('/media/bf-pellets.jpg', 'Amber pellets')],
      },
      {
        id: 'blog',
        label: 'NOTES',
        subLabel: '( FLOOR LOG )',
        href: '/blog',
        thumbs: [img('/media/bf-hopper.jpg', 'Resin hopper'), img('/media/bf-hand.jpg', 'Handful of beads')],
      },
      {
        id: 'contact',
        label: 'CONTACT',
        subLabel: '( GET A QUOTE )',
        href: '/contact',
        thumbs: [img('/media/bf-jars.jpg', 'Jars of sorted beads'), img('/media/bf-molding.jpg', 'Molding machines')],
      },
      {
        id: 'app',
        label: 'OPEN APP',
        subLabel: '( LOGIN )',
        href: '/login',
        thumbs: [img('/media/bf-qc.jpg', 'Quality control lens'), img('/media/bf-beads-macro.jpg', 'Finished beads')],
      },
    ],
  },

  cursor: {
    enabled: true,
    magnetStrength: 0.22,
    defaultLabel: 'EXPLORE',
    trail: true,
  },

  noise: {
    enabled: true,
    opacity: 0.06,
    density: 0.7,
    fps: 25,
    fpsHold: 12,
  },

  footer: {
    marqueeWords: ['RUN THE LINE'],
    email: 'hello@beadfactory.pro',
    phone: '+91 98200 12345',
    address: 'Plot 14, Industrial Estate Phase II',
    socials: [
      { label: 'Instagram', href: 'https://example.com/instagram' },
      { label: 'LinkedIn', href: 'https://example.com/linkedin' },
      { label: 'WhatsApp', href: 'https://example.com/whatsapp' },
      { label: 'Open App', href: '/login' },
    ],
    backToTopLabel: 'BACK TO SURFACE ↑',
    copyright: '© 2026 BEADFACTORY PRO — smart color formulation',
    watermark: '©',
    videoTag: 'FLOOR REEL — LOOP 01',
    cta: { label: 'Open the app', href: '/login' },
    ctaKicker: 'YOU HAVE REACHED THE FACTORY FLOOR — FIRE UP THE LINE',
  },

  home: {
    loader: { enabled: true, letters: ['B', 'P'], holdMs: 2700, dismissMs: 3200 },
    hero: {
      kicker: 'SMART COLOR FORMULATION × PRODUCTION MANAGEMENT',
      brandWord: 'Bead',
      brandWordOutline: 'factory',
      subLine: 'Raw materials, color recipes, feasibility checks and customer pricing — one system, on the floor and on the phone.',
      composition: 'ledger',
      titleVw: 17,
      wave: [
        img('/media/bf-beads-macro.jpg', 'Finished plastic beads'),
        img('/media/bf-sorting.jpg', 'Color-sorted bead trays'),
        img('/media/bf-molding.jpg', 'Injection molding line'),
        img('/media/bf-lab-bench.jpg', 'Color formulation bench'),
        img('/media/bf-extrusion.jpg', 'Extrusion line'),
      ],
      waveDrift: true,
      fluid: { enabled: true, speed: 1, strength: 0.65, mouse: true },
    },
    marquee: {
      direction: -1,
      items: [
        { text: 'RAW MATERIALS', label: '( STOCK )' },
        { text: 'COLOR FORMULAS', label: '( RECIPES )' },
        { text: 'FEASIBILITY', label: '( SHORTAGES )' },
        { text: 'COSTING', label: '( QUOTES )' },
      ],
    },
    cube: {
      faces: [
        img('/media/bf-spiral.jpg', 'Bead color spiral — front'),
        img('/media/bf-floor.jpg', 'Factory floor — right'),
        img('/media/bf-qc.jpg', 'Quality control — back'),
        img('/media/bf-pellets.jpg', 'Amber pellets — left'),
        img('/media/bf-sq5.jpg', 'Beads macro — top'),
        img('/media/bf-sq6.jpg', 'Sorting trays — bottom'),
      ],
      zoom: { vw: 0.44, vh: 0.72, scale: 0.9 },
    },
    statement: {
      heightPx: 4633,
      groups: [],
      manifesto: {
        lines: [
          { text: 'Every bead begins as a ratio.', em: 'ratio' },
          { text: 'Resin, pigment, masterbatch —' },
          { text: 'weighed to the gram.', em: 'gram' },
          { text: 'The recipe is the asset.', em: 'recipe' },
          { text: 'Stock answers before the line asks.' },
          { text: 'Feasibility is a formula,', em: 'formula' },
          { text: 'not a feeling.' },
          { text: 'Cost it right,' },
          { text: 'quote it once.', em: 'quote' },
          { text: 'From hopper to handset,', em: 'hopper' },
          { text: 'the floor fits in your pocket.', em: 'pocket' },
        ],
      },
      statusLines: [
        { text: 'MIXER 02 RUNNING', pos: 'left', offsetY: -40 },
        { text: 'BATCH 1147 SCALED', pos: 'q1', offsetY: -24 },
        { text: 'STOCK LEVELS SYNCED', pos: 'left', offsetY: -40 },
        { text: 'QUOTE QUEUE RENDERING', pos: 'q1', offsetY: -24 },
      ],
      readout: ['12T_MONTHLY_OUTPUT', '240+_COLOR_RECIPES', 'EST_2016'],
      spotlight: { baseOpacity: 0.6, farBlurPx: 2, scramble: true },
    },
    capabilities: {
      heading: 'CORE CAPABILITIES',
      items: [
        { index: '01', title: 'Inventory Tracking', body: 'Every resin, pigment and additive on record — quantity, unit and live stock value, searchable in seconds.' },
        { index: '02', title: 'Formula Management', body: 'Color recipes with Standard, Premium and Economy variants, each a precise material ratio per batch.' },
        { index: '03', title: 'Cost Estimation', body: 'Feasibility and costing in one tap: scale the ratios, flag shortages, price the order with your margin.' },
        { index: '04', title: 'PWA Ready', body: 'Installs on any phone or laptop, works offline with last-fetched data, big touch targets on the floor.' },
      ],
    },
    gallery: {
      heading: 'FROM THE FLOOR',
      heightPx: 4709,
      card: { minPx: 420, vw: 45, maxPx: 648, aspect: '4 / 3' },
      images: [
        img('/media/bf-beads-macro.jpg', 'Fragment 01'),
        img('/media/bf-sorting.jpg', 'Fragment 02'),
        img('/media/bf-extrusion.jpg', 'Fragment 03'),
        img('/media/bf-molding.jpg', 'Fragment 04'),
        img('/media/bf-hand.jpg', 'Fragment 05'),
        img('/media/bf-jars.jpg', 'Fragment 06'),
      ],
    },
  },

  about: {
    marqueeWords: ['BEADFACTORY', 'RESIN', 'PIGMENT', 'PROOF', 'PRICE'],
    showreel: {
      video: { src: '/media/bf-factory.mp4', poster: '/media/bf-floor.jpg' },
      label: 'FLOOR REEL — 8 SECONDS',
      heightPx: 1800,
    },
    years: { from: 2016, to: 2026, label: 'YEARS IN PRODUCTION' },
    cube: {
      faces: [
        { title: 'RAW MATERIALS', subTitle: '( STOCK )', icon: '◈' },
        { title: 'COLOR FORMULAS', subTitle: '( RECIPES )', icon: '◉' },
        { title: 'FEASIBILITY', subTitle: '( CHECKS )', icon: '◎' },
        { title: 'COSTING', subTitle: '( QUOTES )', icon: '◍' },
        { title: 'PRODUCTION', subTitle: '( HISTORY )', icon: '◐' },
        { title: 'PWA READY', subTitle: '( OFFLINE )', icon: '◑' },
      ],
    },
    roster: {
      heading: 'WHAT WE RUN',
      clients: [
        { name: 'PET Pellets', note: 'Base resin', image: img('/media/bf-pellets.jpg', 'PET pellets') },
        { name: 'PP Granules', note: 'Base resin', image: img('/media/bf-hopper.jpg', 'PP granules') },
        { name: 'Candy Amber', note: 'Signature color', image: img('/media/bf-beads-macro.jpg', 'Candy amber beads') },
        { name: 'Deep Ocean Teal', note: 'Signature color', image: img('/media/bf-spiral.jpg', 'Teal beads') },
        { name: 'UV Stabilizers', note: 'Additive', image: img('/media/bf-lab-bench.jpg', 'Additive bench') },
        { name: 'Metallic Gold', note: 'Masterbatch', image: img('/media/bf-sorting.jpg', 'Gold masterbatch') },
      ],
    },
    awards: {
      heading: 'PROOF OF FLOOR',
      items: [
        { year: '2026', title: 'ISO 9001:2015 — Quality Management', org: 'Certified Plant' },
        { year: '2025', title: 'Zero-Defect Supplier of the Year', org: 'Regional Sourcing Guild' },
        { year: '2025', title: '100% Batch Traceability Audit', org: 'Independent QC Review' },
        { year: '2024', title: 'Exporter Excellence — Components', org: 'Trade Council' },
      ],
    },
  },

  work: {
    hero: {
      left: 'System',
      right: 'Modules',
      desc: 'FOUR MODULES,\nONE PRODUCTION BRAIN',
      metaLeft: '©2024—2026',
      metaCenter: '( WHAT THE APP DOES )',
      metaRight: 'STOCK | RECIPES | COSTING',
    },
    previewLabel: 'PREVIEW',
    stagger: true,
    projects: [
      {
        id: 'inventory', slug: 'inventory', index: '01', title: 'INVENTORY CONTROL',
        subTitle: 'Raw material stock, live', tags: ['STOCK', 'UNITS'], year: '2026',
        cover: img('/media/bf-hopper.jpg', 'Inventory cover'),
        hero: img('/media/bf-floor.jpg', 'Inventory hero'),
        images: [img('/media/bf-pellets.jpg', 'Inventory detail 01'), img('/media/bf-jars.jpg', 'Inventory detail 02'), img('/media/bf-sq5.jpg', 'Inventory detail 03')],
        overview: {
          heading: 'Every kilogram accounted for, before the mixer asks.',
          body: 'Add resins, pigments and additives with unit, quantity and price per unit. The table shows live stock value — quantity times price — and search finds any material in a keystroke. Negative entries are rejected at the form, not discovered at the mixer. Edit or retire materials inline, and every formula that uses them stays in sync.',
          meta: [{ label: 'MODULE', value: 'MATERIALS' }, { label: 'UNITS', value: 'KG · G · LITRE · ML' }, { label: 'ACCESS', value: 'MOBILE + DESKTOP' }],
        },
        prevLabel: 'PREV', nextLabel: 'NEXT',
      },
      {
        id: 'formula-lab', slug: 'formula-lab', index: '02', title: 'FORMULA LAB',
        subTitle: 'Color recipes & variants', tags: ['RECIPES', 'RATIOS'], year: '2026',
        cover: img('/media/bf-lab-bench.jpg', 'Formula lab cover'),
        hero: img('/media/bf-sorting.jpg', 'Formula lab hero'),
        images: [img('/media/bf-spiral.jpg', 'Formula detail 01'), img('/media/bf-hand.jpg', 'Formula detail 02'), img('/media/bf-beads-macro.jpg', 'Formula detail 03')],
        overview: {
          heading: 'A color is a recipe. A recipe is a ratio.',
          body: 'Group colors by name, then hang variants off them — Standard, Premium, Economy. Each variant is a dynamic list of materials with a ratio per batch, units auto-filled from inventory. Edit a variant in place, delete a single variant, or retire a whole color with its variants. The ratios you save here drive every feasibility check downstream.',
          meta: [{ label: 'MODULE', value: 'FORMULAS' }, { label: 'STRUCTURE', value: 'COLOR → VARIANTS → ITEMS' }, { label: 'EDITING', value: 'INLINE + PRE-FILLED' }],
        },
        prevLabel: 'PREV', nextLabel: 'NEXT',
      },
      {
        id: 'feasibility', slug: 'feasibility', index: '03', title: 'FEASIBILITY ENGINE',
        subTitle: 'Can we produce it?', tags: ['RATIOS', 'SHORTAGES'], year: '2026',
        cover: img('/media/bf-extrusion.jpg', 'Feasibility cover'),
        hero: img('/media/bf-molding.jpg', 'Feasibility hero'),
        images: [img('/media/bf-sq6.jpg', 'Feasibility detail 01'), img('/media/bf-floor.jpg', 'Feasibility detail 02'), img('/media/bf-qc.jpg', 'Feasibility detail 03')],
        overview: {
          heading: 'Green means run it. Red means buy first.',
          body: 'Pick a color, pick a variant, enter the required kilograms. The engine scales the formula — required quantity divided by the sum of ratios — and compares every needed material against live stock. Any shortfall flips the verdict to CANNOT PRODUCE and lists exactly what is missing, down to the gram. No order is saved until you say so.',
          meta: [{ label: 'MODULE', value: 'PRODUCTION' }, { label: 'LOGIC', value: 'SCALE → COMPARE → VERDICT' }, { label: 'OUTPUT', value: 'SHORTAGE LIST' }],
        },
        prevLabel: 'PREV', nextLabel: 'NEXT',
      },
      {
        id: 'costing', slug: 'costing', index: '04', title: 'COSTING & QUOTES',
        subTitle: 'From ratios to a customer price', tags: ['COST', 'MARGIN'], year: '2026',
        cover: img('/media/bf-beads-macro.jpg', 'Costing cover'),
        hero: img('/media/bf-lab-bench.jpg', 'Costing hero'),
        images: [img('/media/bf-jars.jpg', 'Costing detail 01'), img('/media/bf-pellets.jpg', 'Costing detail 02'), img('/media/bf-sorting.jpg', 'Costing detail 03')],
        overview: {
          heading: 'Quote once. Quote right.',
          body: 'Material cost sums every scaled line at its price per unit. Fixed production cost is required kilograms times your per-kg rate from settings. Margin applies on top — and the customer estimate lands on a single highlighted card. Save the analysis to history, filter past orders by date, color or feasibility, and export everything as JSON from settings.',
          meta: [{ label: 'MODULE', value: 'COSTING' }, { label: 'FORMULA', value: 'MATERIAL + FIXED + MARGIN' }, { label: 'CURRENCY', value: '₹ ROUNDED 2DP' }],
        },
        prevLabel: 'PREV', nextLabel: 'NEXT',
      },
    ],
  },

  lab: {
    hero: {
      left: 'Color',
      right: 'Lab',
      desc: 'TRIALS FROM THE\nFORMULATION BENCH',
      metaLeft: '©2024—2026',
      metaCenter: '( EXPERIMENT LOG )',
      metaRight: 'COLOR | PROCESS | QC',
    },
    allLabel: 'ALL',
    categories: ['COLOR TRIALS', 'PROCESS', 'QUALITY'],
    experiments: [
      { id: 'e01', title: 'Candy Amber — Trial 12', date: '2026.06', tags: ['MASTERBATCH', '2.4%'], category: 'COLOR TRIALS', image: img('/media/bf-pellets.jpg', 'Candy Amber trial') },
      { id: 'e02', title: 'Deep Ocean Teal', date: '2026.06', tags: ['PIGMENT', 'TWO-PASS'], category: 'COLOR TRIALS', image: img('/media/bf-spiral.jpg', 'Deep Ocean Teal') },
      { id: 'e03', title: 'Metallic Gold Dispersion', date: '2026.05', tags: ['FLAKE', 'DISPERSION'], category: 'COLOR TRIALS', image: img('/media/bf-beads-macro.jpg', 'Metallic gold') },
      { id: 'e04', title: 'Mixer Drum — Ambient Loop', date: '2026.05', tags: ['FILM', 'LOOP'], category: 'PROCESS', image: img('/media/bf-floor.jpg', 'Mixer drum loop'), video: { src: '/media/bf-factory.mp4', poster: '/media/bf-floor.jpg' } },
      { id: 'e05', title: 'Extrusion Window Study', date: '2026.05', tags: ['TEMP', 'THROUGHPUT'], category: 'PROCESS', image: img('/media/bf-extrusion.jpg', 'Extrusion window') },
      { id: 'e06', title: 'Hopper Flow Angles', date: '2026.04', tags: ['FLOW', 'BRIDGING'], category: 'PROCESS', image: img('/media/bf-hopper.jpg', 'Hopper flow') },
      { id: 'e07', title: 'Bead Roundness Index', date: '2026.04', tags: ['METROLOGY'], category: 'QUALITY', image: img('/media/bf-qc.jpg', 'Roundness index') },
      { id: 'e08', title: 'Gloss Under Amber Light', date: '2026.03', tags: ['FINISH', 'VISUAL'], category: 'QUALITY', image: img('/media/bf-hand.jpg', 'Gloss study') },
      { id: 'e09', title: 'Jar Clarity vs. Resin Grade', date: '2026.02', tags: ['CLARITY', 'GRADE'], category: 'QUALITY', image: img('/media/bf-jars.jpg', 'Jar clarity') },
    ],
    lightbox: {
      playAria: 'Play or pause the video',
      muteAria: 'Mute or unmute the video',
      closeAria: 'Close the player',
      toastText: 'Playback is a local demo asset',
    },
  },

  blog: {
    hero: {
      left: 'Floor',
      right: 'Notes',
      desc: 'PROCESS, BATCHES\n& OCCASIONAL REGRIND',
      metaLeft: '©2026',
      metaCenter: '( FLOOR LOG )',
      metaRight: '2026',
    },
    fetchDelayMs: 700,
    loadingLabel: 'LOADING…',
    emptyLabel: 'No entries yet — the logbook is open.',
    errorLabel: (status) => `Load error: server responded ${status}. Please retry in a moment.`,
    skeletonRows: 8,
    backLabel: '← ALL NOTES',
    posts: [
      {
        slug: 'weigh-ratios-not-scoops', date: '2026.06.12', title: 'Why we weigh ratios, not scoops',
        excerpt: 'A scoop of pigment is a weather report. A ratio is a contract.',
        image: img('/media/bf-lab-bench.jpg', 'Weighing ratios'),
        body: [
          'Every recipe in the formula lab is stored as parts per batch, not grams per run. When a customer asks for 40 kg instead of 12 kg, the app multiplies the ratios by a scale factor and the color stays identical. Scoops drift with humidity, operator habit and the phase of the moon; ratios do not.',
          'The second win is costing. Because every line of a formula carries a price per unit, scaling the recipe also scales the cost — exactly. The quote you send at 9am survives contact with the 6pm batch.',
        ],
      },
      {
        slug: 'reading-shortage-report', date: '2026.05.28', title: 'Reading a shortage report at 7am',
        excerpt: 'The red CANNOT PRODUCE banner is not bad news. It is a shopping list.',
        image: img('/media/bf-sorting.jpg', 'Shortage report'),
        body: [
          'When the feasibility check flips red, it lists each missing material and the exact shortfall — short by 1.8 kg of amber masterbatch, short by 300 ml of solvent. That is a purchase order written for you, before the mixer was ever charged.',
          'The discipline is checking before promising. A two-minute feasibility run beats a two-week apology to a customer whose beads are stuck waiting on one pigment.',
        ],
      },
      {
        slug: 'true-cost-of-a-kilogram', date: '2026.05.09', title: 'The true cost of a kilogram',
        excerpt: 'Resin is not the cost. Resin plus the line plus the lights is the cost.',
        image: img('/media/bf-molding.jpg', 'Kilogram cost'),
        body: [
          'Material cost is the honest part: sum of needed quantity times price per unit, line by line. The part factories forget is fixed cost — power, labor, machine time — which is why settings carry a per-kg rate that multiplies with every order.',
          'Margin sits on top of the total, not on the materials. Quote against total cost and the profit line survives small orders; quote against materials and the small orders quietly eat the factory.',
        ],
      },
      {
        slug: 'quoting-without-regret', date: '2026.04.17', title: 'Quoting without regret',
        excerpt: 'Save every analysis. Future-you will want the receipts.',
        image: img('/media/bf-beads-macro.jpg', 'Quote history'),
        body: [
          'Every feasibility check can be saved to production history with its full breakdown — required, available, status and cost per material. When a customer returns in three months asking for the same teal, the answer is a filter away, not a memory test.',
          'And when the numbers need to leave the building, settings export the whole dataset — materials, formulas, orders — as one JSON file. Your data, portable, no negotiations.',
        ],
      },
    ],
  },

  contact: {
    hero: {
      left: 'Get a',
      right: 'quote',
      desc: 'CUSTOM COLORS,\nBULK RUNS & SAMPLES',
      metaLeft: '©2026',
      metaCenter: '( GET IN TOUCH )',
      metaRight: 'REPLIES IN 24H',
    },
    marqueeWords: ['GET A QUOTE'],
    form: {
      fields: [
        { id: 'name', label: 'Name', placeholder: 'Your Name', required: true, errorText: 'Your name is required.', type: 'text' },
        { id: 'email', label: 'Email', placeholder: '...@example.com', required: true, errorText: 'A valid email is required.', type: 'email' },
        { id: 'phone', label: 'Phone', placeholder: '+91 ...', required: true, errorText: 'A contact number is required.', type: 'tel' },
        { id: 'company', label: 'Company', placeholder: 'Company name', required: false, optionalTag: '(optional)', errorText: '', type: 'text' },
        { id: 'message', label: 'Requirement', placeholder: 'Color, quantity, timeline — a few lines is enough...', required: false, errorText: 'A few lines about the requirement helps.', type: 'textarea' },
      ],
      servicesLabel: 'REQUIREMENT (MULTI-SELECT)',
      services: [
        { id: 'custom-color', label: 'Custom color run', prices: ['₹ 50K — 2L', '₹ 2L — 5L', '₹ 5L+'] },
        { id: 'bulk', label: 'Bulk bead supply', prices: ['₹ 1L — 5L', '₹ 5L — 15L', '₹ 15L+'] },
        { id: 'sample', label: 'Sample batch', prices: ['₹ 5K — 15K', '₹ 15K — 30K', '₹ 30K+'] },
        { id: 'consult', label: 'Formula consult', prices: ['₹ 10K — 25K', '₹ 25K — 50K', '₹ 50K+'] },
      ],
      priceLabel: 'ORDER SIZE',
      selectedLabel: 'SELECTED',
      captchaLabel: 'Captcha',
      captchaError: 'Wrong sum — try again.',
      submitLabel: 'Submit',
      sendingLabel: 'SENDING…',
      successTitle: 'REQUEST RECEIVED',
      successBody: 'Thanks for writing — we will reply within one working day.',
      resetLabel: 'SEND ANOTHER',
    },
  },

  notFound: {
    heading: 'ERROR 404: OFF THE LINE',
    messages: [
      'This batch never made it to the mixer.',
      'Our runner below knows the way back.',
      'Press SPACE — jumping helps everyone.',
    ],
    ctaLabel: 'BACK TO THE FACTORY',
    ctaHref: '/',
    hiScoreLabel: 'HI',
  },

  copy: {
    ui: {
      skipLink: 'Skip to content',
      cubeCaption: 'SCROLL TO ROTATE — SIX SIDES OF THE FACTORY',
      galleryFragmentLabel: 'FRAGMENT',
      notFoundHint: 'SPACE / TAP — RUN WITH THE RUNNER',
      notFoundGameOver: 'GAME OVER — SPACE TO RESTART',
      playPrefix: 'Play',
      removePrefix: 'Remove',
      caseImagesSuffix: 'module images',
    },
    a11y: {
      loading: 'Loading',
      menuNav: 'Primary',
      socials: 'Social links',
      cube: 'Factory cube',
      showreel: 'Floor reel',
      capabilities: 'Capabilities',
      capabilityNav: 'Capability navigation',
      workGrid: 'System modules',
      moreProjects: 'More modules',
      labTabs: 'Experiment categories',
      labBoard: 'Experiments',
      playbackProgress: 'Playback progress',
    },
    cursor: {
      home: 'HOME',
      contact: 'CONTACT',
      open: 'OPEN',
      top: 'TOP',
      view: 'VIEW',
      preview: 'PREVIEW',
      back: 'BACK',
      prev: 'PREV',
      next: 'NEXT',
      video: 'VIDEO',
    },
  },
}
