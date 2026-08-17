/**
 * Every word of copy and every link on the site lives here.
 *
 * Client revisions and the pending LinkedIn/asset paste-ins should never
 * require touching a component. Lines marked `CONFIRM:` are drafted
 * language awaiting Jelani's sign-off; `PENDING:` marks a slot waiting on
 * an asset or URL. Client names appear only in this file, so any of them
 * can be pulled in seconds.
 */

export type WorkKind = 'video' | 'short' | 'photo'

export interface WorkItem {
  id: string
  title: string
  /** Client or outlet shown above the title. Omit for personal work. */
  client?: string
  kind: WorkKind
  /** YouTube ID. Null renders the card in its "linking soon" state. */
  ytId: string | null
  /** Path under /media. Null falls back to a generated gradient plate. */
  poster: string | null
  /**
   * Silent looping clip played over the poster while the card is on screen.
   * Built by scripts/media/build-previews.mjs. Absent = the poster stands
   * alone, which is the case for work published on a client's own channel.
   */
  preview?: string
  /** One short line of context. Not rendered at rest — hover only. */
  note?: string
}

export interface WorkGroup {
  id: string
  eyebrow: string
  title: string
  blurb?: string
  layout: 'featured' | 'grid' | 'row' | 'gallery' | 'beauty'
  items: WorkItem[]
}

export const site = {
  meta: {
    name: 'Jelani-Issa Woods',
    brand: 'JelaniWoodsTV',
    role: 'Director of Photography',
    location: 'Toronto / GTA',
    email: 'jelaniwoods@gmail.com',
    instagram: 'https://www.instagram.com/jelaniwoodstv/',
    studioInstagram: 'https://www.instagram.com/studioimpetus/',
    linkedin: 'https://www.linkedin.com/in/jelaniwoods',
    youtube: 'https://www.youtube.com/@jelaniwoodstv',
    // PENDING: booking link. Until it lands, the CTA card is the only ask.
    bookingUrl: null as string | null,
  },

  nav: {
    links: [
      { label: 'Work', href: '#work' },
      { label: 'Services', href: '#services' },
      { label: 'About', href: '#about' },
    ],
    cta: 'Book a call',
  },

  hero: {
    eyebrow: 'Jelani-Issa Woods · Director of Photography · GTA',
    /**
     * Rewritten 2026-08-17 from the Studio Impetus 30-day playbook, signed
     * off by James — this supersedes the "fixed by the brief" note that sat
     * on the old line ("Fast-turnaround creative for brand events."). That
     * line described the service; this one states the buyer's problem and
     * the promise in the same breath. Two sentences on purpose: the layout
     * is free to break them across lines.
     */
    headline: "Your activation is over in six hours. Your content shouldn't take three weeks.",
    sub: 'I shoot brand activations, launches, and influencer events across the GTA — and get you a finished recap in 48–72 hours, stills the same day, and vertical cuts built for paid from the start.',
    /**
     * Small-type proof line under the sub. It rides the hero's CSS entrance
     * with the rest of panel 1, so it paints with the prerendered markup and
     * never waits on hydration.
     * CONFIRM: public naming of Soluna, Canergy, and Reset Studio is the same
     * sign-off the marquee below is waiting on. Bioderma, Camp Dreamwood, and
     * Sportsnet are already public.
     */
    proof: 'Bioderma · Soluna · Canergy · Reset Studio · Camp Dreamwood · Featured on Sportsnet',
    primary: 'Book a call',
    secondary: 'See the work',
    /**
     * The hero loop — Jelani's own footage, playing muted on its own while
     * scroll moves through the panels below. Built by build-reel.mjs from
     * the Soluna recap. Null falls back to the ambient-light backdrop.
     */
    reel: '/media/reel.mp4' as string | null,
    reelPoster: '/media/reel-poster.webp' as string | null,
    /**
     * Information panels staged across the pinned hero. Panel 1 is the
     * prerendered first paint and carries the LCP headline; 2 and 3 arrive
     * on scroll. Under reduced motion only panel 1 shows.
     * CONFIRM: panels 2 and 3 are drafted — see CONTENT-INTAKE.md §2.
     */
    stages: [
      { id: 'deliver', line: 'Event recaps in 48–72 hours. Stills the same day. Vertical cuts ready for paid.' },
      // Reframed 2026-08-17 to the playbook's credibility strip — the same
      // three facts, but stated as what he has done rather than as a badge.
      { id: 'proof', line: 'Toronto + GTA · Founder, Studio Impetus · Former agency DP & project manager' },
    ],
  },

  /**
   * The problem section — added 2026-08-17 from the playbook. It sits
   * between the marquee and the work gallery because the page's job at that
   * point is to name the thing the buyer has already lived through, before
   * it starts showing off.
   */
  problem: {
    eyebrow: 'The problem',
    title: 'Most event content never runs.',
    body: [
      "You spend the budget. The room looks incredible. Then the footage sits in an edit queue, the recap lands two or three weeks later, and by the time it's ready the campaign has moved on.",
      "The problem usually isn't the shooter. It's that nobody scoped the edit, nobody planned for vertical, and nobody was working to a deadline that matched how fast the moment actually expires.",
      'I work backwards from the post date. Stills the same night, recap in 48–72 hours, vertical delivered alongside the horizontal — not as an afterthought when someone asks a week later.',
    ],
  },

  /**
   * Why me — added 2026-08-17 from the playbook, as its own block above
   * About rather than a rewrite of About's opening. About is the bio; this
   * is the argument, and the two do different jobs on the page.
   */
  whyMe: {
    eyebrow: 'Why me',
    title: 'A DP who came up as a project manager.',
    body: [
      "Toronto has no shortage of good shooters. What's harder to find is someone who scopes a job honestly, shows up early, and doesn't need managing on the day.",
      "I came up through agency production at Visual Smugglers as a project manager and a DP — so I've sat on both sides of the brief. I know what it costs an agency when a freelancer over-promises, goes quiet, and delivers late. I built how I work around not being that person.",
      'You get a written brief before the shoot. A real timeline, and I hit it. Horizontal and vertical from the same shoot, not a change order. And you can hand me a job and stop thinking about it.',
    ],
  },

  /** Marquee: real credits interleaved with capabilities. */
  // CONFIRM: public naming of Socliq, Canergy, Reset Studio, and Soluna
  // awaits Jelani's sign-off — each is one line to pull. Kilani was signed
  // off via Discord 2026-08-05.
  marquee: [
    'Sportsnet',
    'Event recaps',
    'Visual Smugglers',
    'Second shooter',
    'Soluna',
    'Same-week edits',
    'Bioderma',
    'Photo coverage',
    'Studio Impetus',
    'Brand campaigns',
    'Canergy',
    'Camp Dreamwood',
    'Reset Studio',
    // BeeVibe Juicery removed 2026-08-05 with its card — the marquee should
    // only name clients whose work the page can actually show.
    'Kilani',
  ],

  services: {
    eyebrow: 'Services',
    title: 'What I shoot, and how fast you get it back.',
    blurb:
      'Four ways brands and agencies bring me in. Every one of them ends with usable footage in your hands, not a project that drags.',
    // Reframed 2026-08-17 per the playbook: each card now leads with what
    // the buyer ends up with, not with what happens on the day.
    items: [
      {
        n: '01',
        title: 'Event video recaps',
        body: 'The recap your team can actually run. Cut so it works as paid, not just as a nice post.',
        // CONFIRM: turnaround commitments below are drafted, not yet approved by Jelani.
        promise: '48–72 hours',
      },
      {
        n: '02',
        title: 'Photo coverage',
        // Revised per Jelani (Discord, 2026-08-05): the free-BTS bundle is
        // retired ("behind the scenes film would incur a cost"), and one
        // operator cannot shoot photo and video at once ("if I'm on photo
        // there's nobody on video") — same-day both means a second shooter.
        // The scoping caveat survives the 2026-08-17 reframe: it is the one
        // sentence here that stops a booking being mis-sold.
        body: "A stills library that lasts the quarter. Social, PR, and paid can all pull from it, so you're not re-shooting product in October. Photo and video on the same day is a two-shooter booking — one camera cannot cover both — so it is scoped with a second shooter up front.",
        promise: 'Gallery in 72 hours',
      },
      {
        n: '03',
        title: 'Second shooting',
        body: "A second camera that matches your lead shooter, arrives early, and doesn't need briefing twice.",
        promise: 'Day rate, GTA-wide',
      },
      {
        n: '04',
        title: 'Quick-turnaround editing',
        // The pointer to "ten or twenty edits, $100 each" came off with the
        // per-unit pricing on 2026-08-17 — see the pricing block below for
        // why the page no longer names a per-edit figure.
        body: "You shot it, I'll finish it. Real story, pacing, sound and colour — not a trim and a LUT.",
        promise: 'Same week',
      },
    ],
  },

  about: {
    eyebrow: 'About',
    title: 'A director of photography who thinks like a marketer.',
    // CONFIRM: bio is drafted from verified public credits. Replace/expand once
    // Jelani sends his LinkedIn About text.
    body: [
      "I'm Jelani-Issa Woods — a director of photography, editor, and the founder of Studio Impetus, a Toronto media-creator studio. I shoot and cut content for brands and agencies across the GTA: event recaps, campaign work, product stills, and the short-form that comes out of both.",
      'Most of my work starts at an event and ends as a set of assets your team can actually run — a hero cut, a stills gallery, and vertical versions ready for paid. I came up through agency production as a project manager and DP at Visual Smugglers, so I know what a client deadline and a shot list are worth.',
      // Corrected per Jelani (Discord, 2026-08-05): over a decade in customer
      // retention, not "four years in sales" — known for keeping clients and
      // minimizing churn.
      'Before all of this I spent over a decade in customer retention — the side of sales where the job is keeping clients, not closing them. It shows in how I work: I ask what the content is for, scope it honestly, and deliver so the next booking is the easy part.',
    ],
    // PENDING: headshot. Until it arrives the portrait frame renders as a gold-rule plate.
    portrait: null as string | null,
    portraitCaption: 'Toronto / GTA · Available for bookings',
  },

  proof: {
    eyebrow: 'Experience',
    title: 'Where the work has been.',
    entries: [
      {
        org: 'Studio Impetus',
        role: 'Founder',
        detail:
          'Toronto media-creator studio building campaign content for brands — reels, apparel campaigns, and product photography.',
      },
      {
        org: 'Visual Smugglers',
        role: 'Project Manager & Director of Photography',
        // CONFIRM: exact dates/title pending Jelani's LinkedIn text.
        detail:
          'Toronto video production agency. Ran productions end to end and shot social, event, and brand content for commercial clients.',
      },
      {
        org: 'Kilani',
        role: 'Project Management & Photography',
        // Added per Jelani's sign-off (Discord, 2026-08-05): "Kilani is a big
        // one to have on there" — 3-month contract, Raptors home games.
        detail:
          'Three-month brand contract — project management and photography, including coverage at Toronto Raptors home games.',
      },
      {
        org: 'Sportsnet',
        role: 'Featured credit',
        detail:
          '"Duane Notice\'s Battle Back From Injury" — a Black History Month feature for the national broadcaster.',
      },
      {
        org: 'JelaniWoodsTV',
        role: 'Director of Photography & Editor',
        detail:
          'Independent client work: storytelling, production, and social media strategy for brands, creators, and events.',
      },
    ],
    toolset: {
      label: 'Toolset',
      items: [
        'Adobe Premiere Pro',
        'DaVinci Resolve',
        'Lightroom',
        'Photoshop',
        'Cinematography',
        'Colour correction',
      ],
    },
    /**
     * PENDING: real quotes from the Studio Impetus "Testimonials" highlight,
     * with permission to attribute. The block stays hidden while this is
     * empty — never fabricate a testimonial.
     */
    testimonials: [] as { quote: string; attribution: string }[],
  },

  work: {
    eyebrow: 'Selected work',
    title: 'The work.',
    blurb:
      'Broadcast features, brand campaigns, event recaps, and the short-form that comes out of them.',
    // PENDING: YouTube IDs for every item — all live on youtube.com/@jelaniwoodstv.
    // Paste the 11-character ID into `ytId` and the card wires itself up.
    groups: [
      {
        id: 'featured',
        eyebrow: 'Featured · Sportsnet',
        title: "Duane Notice's Battle Back From Injury",
        // Group blurbs were cut in the Phase 7 minimal pass: against a grid
        // of moving work they read as filler. Eyebrow + title carry it.
        layout: 'featured',
        items: [
          {
            id: 'sportsnet-duane-notice',
            title: "Duane Notice's Battle Back From Injury",
            client: 'Sportsnet',
            kind: 'video',
            ytId: 'CavSj2reqa4',
            poster: '/media/yt-CavSj2reqa4.webp',
            note: 'Black History Month feature',
          },
        ],
      },
      /**
       * REMOVED 2026-08-05 — the "Reels" group (Cinematography Reel,
       * Editors Reel 2020, Editors Reel — Part 2), pulled at James's
       * direction.
       *
       * The showreels were the weakest thing on a page selling brand event
       * work: two were dated, and Part 2 opened on gameplay capture, which
       * reads as a different job entirely to a brand buyer. The featured
       * Sportsnet piece and the event recaps below carry the same proof
       * without the mismatch.
       *
       * Restoring is this block plus the three items' posters, previews,
       * and YouTube IDs (0BmqVLkam-g, 42abljCvlbc, rTFInFnpJa8) — recover
       * them from git history rather than re-downloading.
       */
      {
        id: 'events',
        eyebrow: 'Events & recaps',
        title: 'Shot on the day, delivered while it matters.',
        layout: 'grid',
        items: [
          {
            id: 'soluna',
            title: 'Soluna — Event Recap',
            // CONFIRM: public naming pending Jelani's sign-off.
            client: 'Soluna',
            kind: 'video',
            ytId: null,
            poster: '/media/soluna-poster.webp',
            preview: '/media/previews/soluna.mp4',
            note: 'Nightlife event, shot and cut for the feed',
          },
          {
            id: 'bioderma',
            title: 'Bioderma — Event Recap',
            client: 'Bioderma',
            kind: 'video',
            ytId: null,
            poster: '/media/bioderma-poster.webp',
            preview: '/media/previews/bioderma.mp4',
            note: 'Influencer event coverage — with Socliq',
          },
          {
            id: 'camp-dreamwood',
            title: 'Camp Dreamwood — Weekly Recap',
            client: 'Camp Dreamwood',
            kind: 'video',
            ytId: 'MhNHciOVE1w',
            poster: '/media/yt-MhNHciOVE1w.webp',
            note: 'Recurring weekly recap series, summer 2021',
          },
        ],
      },
      {
        id: 'campaigns',
        eyebrow: 'Campaigns & activations',
        title: 'Brand campaigns and product.',
        items: [
          {
            id: 'canergy-activation',
            title: 'Canergy — Studio Activation',
            // CONFIRM: public naming of Canergy pending Jelani's sign-off.
            client: 'Canergy',
            kind: 'photo',
            ytId: null,
            poster: '/media/photos/campaign-canergy.webp',
            note: 'Brand activation stills — with Socliq',
          },
          {
            id: 'reset-activation',
            title: 'Reset Studio — Event Coverage',
            // CONFIRM: public naming of Reset Studio pending Jelani's sign-off.
            client: 'Reset Studio',
            kind: 'photo',
            ytId: null,
            poster: '/media/photos/campaign-reset.webp',
            note: 'Wellness event coverage — with Socliq',
          },
          /**
           * REMOVED 2026-08-05 — "BeeVibe Juicery — Product".
           *
           * The card never had artwork. `poster: null` fell back to the
           * generated gradient plate, so it sat in a row of real
           * photography as an empty tile with a caption — the one thing on
           * the page advertising work it could not show. It was carried
           * pending original product exports from Jelani that never came.
           *
           * If the exports arrive, this is a new card, not a revert: drop
           * the file in /public/media/photos and add the item back with a
           * real poster. Never restore it with poster: null.
           */
        ],
        layout: 'grid',
      },
      {
        id: 'shorts',
        eyebrow: 'Short-form & UGC',
        title: 'Built for the feed.',
        layout: 'row',
        items: [
          {
            id: 'luxury-short',
            title: 'Luxury Villa UGC',
            kind: 'short',
            ytId: 'agP4vz_HjYw',
            poster: '/media/yt-agP4vz_HjYw.webp',
            preview: '/media/previews/luxury-short.mp4',
          },
          {
            id: 'cinematic-short',
            title: 'Cinematic Short',
            kind: 'short',
            ytId: 'IRGQXQKWEek',
            poster: '/media/yt-IRGQXQKWEek.webp',
            preview: '/media/previews/cinematic-short.mp4',
          },
          /**
           * REMOVED 2026-08-02 — "Promise" (LTD6Zqn1vq0).
           *
           * The card was approved in Phase 1 from a title alone. Reviewing
           * the actual footage for a preview loop showed it is gym content
           * end to end — shot in a fitness club, body-focused framing,
           * motivational overlay text on every beat. That is the material
           * HANDOFF.md §1 keeps off this site ("no fitness/bodybuilding
           * content anywhere"), and it is not the allowed exception either:
           * the carve-out covers commissioned campaigns for wellness
           * brands, not personal fitness-motivation pieces.
           *
           * Pulled rather than re-cropped because no compliant 4s window
           * exists. Restoring is this block plus its poster/preview files —
           * needs James's or Jelani's call, not a silent revert.
           */
          {
            id: 'star-v',
            title: 'Star Villas Costa Rica',
            kind: 'short',
            ytId: 'VdbsVKasgBI',
            poster: '/media/yt-VdbsVKasgBI.webp',
            preview: '/media/previews/star-v.mp4',
          },
        ],
      },
      {
        id: 'photography',
        eyebrow: 'Photography',
        title: 'Shot in the room, graded for the brand.',
        blurb:
          'Stills from live brand activations — the gallery a team pulls from long after the event wraps.',
        layout: 'gallery',
        // Selects from the Socliq x Canergy and Socliq x Reset Studio shoots,
        // curated by scripts/media/build-stills.mjs (event-coverage frames over
        // posed portraiture). The beauty/editorial set returns when Jelani
        // sends original exports.
        items: [
          { id: 'photo-1', title: 'Activation stills — group at the studio', kind: 'photo', ytId: null, poster: '/media/photos/photo-01.webp' },
          { id: 'photo-2', title: 'Event coverage — content being captured', kind: 'photo', ytId: null, poster: '/media/photos/photo-02.webp' },
          { id: 'photo-3', title: 'Brand activation — product in hand', kind: 'photo', ytId: null, poster: '/media/photos/photo-03.webp' },
          { id: 'photo-4', title: 'Event coverage — candid', kind: 'photo', ytId: null, poster: '/media/photos/photo-04.webp' },
          { id: 'photo-5', title: 'Activation stills — in the room', kind: 'photo', ytId: null, poster: '/media/photos/photo-05.webp' },
          { id: 'photo-6', title: 'Event coverage — the class in session', kind: 'photo', ytId: null, poster: '/media/photos/photo-06.webp' },
          { id: 'photo-7', title: 'Brand activation — portrait', kind: 'photo', ytId: null, poster: '/media/photos/photo-07.webp' },
          { id: 'photo-8', title: 'Event coverage — warm light', kind: 'photo', ytId: null, poster: '/media/photos/photo-08.webp' },
          { id: 'photo-9', title: 'Activation stills — the room at work', kind: 'photo', ytId: null, poster: '/media/photos/photo-09.webp' },
          { id: 'photo-10', title: 'Event coverage — closing energy', kind: 'photo', ytId: null, poster: '/media/photos/photo-10.webp' },
        ],
      },
      {
        id: 'beauty',
        eyebrow: 'Beauty & editorial',
        title: 'Portraiture, when the brief is the face.',
        layout: 'beauty',
        // The four originals from his previous site, alternating monochrome
        // and colour by design. The B&W frames are the photographer's grade —
        // never "unify" the set.
        items: [
          { id: 'beauty-1', title: 'Editorial — form and light', kind: 'photo', ytId: null, poster: '/media/photos/beauty-01.webp' },
          { id: 'beauty-2', title: 'Golden hour portrait', kind: 'photo', ytId: null, poster: '/media/photos/beauty-02.webp' },
          { id: 'beauty-3', title: 'Beauty — studio', kind: 'photo', ytId: null, poster: '/media/photos/beauty-03.webp' },
          { id: 'beauty-4', title: 'Duo portrait', kind: 'photo', ytId: null, poster: '/media/photos/beauty-04.webp' },
        ],
      },
    ] as WorkGroup[],
  },

  process: {
    eyebrow: 'Process',
    title: 'From first call to final cut.',
    blurb:
      'Every engagement runs the same four steps — so you know what happens next before you have paid for anything.',
    steps: [
      {
        n: '01',
        title: 'Book a call',
        body: 'Twenty minutes on what the event is, who the content is for, and where it will run.',
      },
      {
        n: '02',
        title: 'Creative brief',
        body: 'Before the shoot, you get a written brief — goal, roles, locations, talent, budget — so the day is planned, not improvised.',
      },
      {
        n: '03',
        title: 'Shoot day',
        body: 'I show up early, shoot the plan, and stay on the lookout for the moments the plan could not predict.',
      },
      {
        n: '04',
        title: 'Fast delivery',
        body: 'Recaps in days, not weeks — horizontal and vertical cuts from the same shoot, ready to run.',
      },
    ],
    /**
     * REMOVED 2026-08-05 — the evidence block under the steps: the Kilani
     * creative-brief page (`brief`), the four shoot-day phone shots
     * (`bts`), and the behind-the-scenes bundle line (`bundleNote`).
     *
     * Pulled at James's direction as sloppy, and it was: the brief page is
     * a near-empty white sheet with one line of body text, unreadable at
     * the size it rendered, and the four phone frames were the same room
     * from four almost identical angles. The four steps say it better.
     *
     * Note this took the last mention of behind-the-scenes films off the
     * site. The offer still stands — it lives in WORKING-AGREEMENT.md as a
     * quoted add-on. If it should sell on the page, it wants a line in the
     * Services card, not a photo strip.
     */
  },

  /**
   * Pricing, restructured 2026-08-17 per the playbook.
   *
   * REMOVED — the per-unit anchor: the "$100 an edit" title, the 10- and
   * 20-edit tiers, and their "$100 per edit" feet. A page that opens on
   * $100 teaches the buyer to price the work by the unit, and every
   * conversation after that is an argument about how many units. The tiers
   * below anchor on the engagement instead. The $100 figure is not gone
   * from the business — it is a closing tool on a call, where it lands as a
   * concession rather than as the headline number. Do not put it back on
   * the page without James's call.
   *
   * The house rules are unchanged and still load-bearing: no discounts, no
   * in-between quantities, and the quarterly partner includes the quarter's
   * strategy complimentary precisely so the work keeps being charged at
   * full worth. Never add a discount badge, a crossed-out price, or a "most
   * popular" label here.
   */
  pricing: {
    eyebrow: 'Pricing',
    title: 'Three ways to book me.',
    blurb:
      'Fixed packages — no discounts, no in-between quantities, no negotiation theatre. Where a job needs scoping, it gets scoped on the call before anyone talks money.',
    tiers: [
      {
        id: 'coverage',
        name: 'Event coverage',
        price: 'From $2,000 / day',
        body: 'Video, photo, or both. Recap in 48–72 hours, stills same day. Vertical included, not extra.',
        foot: 'Per shoot day',
        featured: false,
      },
      {
        id: 'package',
        name: 'Content package',
        price: 'From $1,000',
        body: 'A block of finished cuts from footage you already have.',
        foot: 'From your footage',
        featured: false,
      },
      {
        id: 'quarterly',
        name: 'Quarterly partner',
        price: 'From $3,000 / quarter',
        body: "10+ videos a month, priority booking on event dates, strategy included. For teams who've stopped wanting to re-scope this every time.",
        foot: 'Strategy included',
        featured: true,
      },
    ],
    cta: 'Start with this',
    // CONFIRM: currency presentation (assumed CAD, Toronto client base).
    footnote:
      'Prices in CAD. Event coverage is quoted per project once the date, location, and deliverables are known.',
  },

  cta: {
    eyebrow: "Let's talk",
    title: 'Have an event coming up?',
    sub: 'Four quick questions and I will come back to you with availability and a quote.',
    steps: [
      {
        id: 'need',
        question: 'What do you need?',
        options: ['Event recap', 'Photo coverage', 'Video + Photo bundle', 'Second shooter', 'Editing support'],
      },
      {
        // Added 2026-08-17 per the playbook. The answer is what makes a
        // quote possible before the call: paid and organic are not the same
        // edit, and PR is not the same shot list.
        id: 'for',
        question: "What's the content for?",
        options: ['Paid ads', 'Organic social', 'PR', 'Internal', 'Sales'],
      },
      {
        id: 'when',
        question: 'When do you need it?',
        options: ['This month', 'Next month', 'Just exploring'],
      },
    ],
    final: {
      question: 'Where can I reach you?',
      emailLabel: 'Your email',
      emailPlaceholder: 'you@company.com',
      noteLabel: 'Anything else? (optional)',
      notePlaceholder: 'Event date, location, what you have in mind…',
      submit: 'Send it',
    },
    success: {
      title: "Got it — I'll be in touch.",
      body: 'Your note is on its way to my inbox. Expect a reply within one business day.',
    },
    /**
     * Shown only when the send genuinely failed. The card used to fire the
     * mailto and then claim success anyway, which on a phone meant the
     * visitor saw a tick while nothing had been sent and nothing had
     * opened. It still tries the mail client — that works on desktop — but
     * it says what happened and leaves the answers on screen.
     */
    failure: {
      title: "Couldn't send automatically.",
      body: 'Your mail app should have opened with this filled in. If it did not, email me directly — copy the answers below straight into it.',
      answersLabel: 'What you told me',
    },
    fallbackNote: 'Prefer email?',
  },

  footer: {
    tagline: 'Video and photo for brands and agencies.',
    location: 'Toronto / GTA',
  },
} as const

/**
 * Where the enquiry card posts. This is our own server route (server/
 * enquiry.js), not a third party — no account, no per-submission quota, and
 * the visitor's details never leave our infrastructure.
 *
 * It needs no configuration: the route always relays through FormSubmit,
 * so a deployment with no environment variables at all still delivers.
 * `ENQUIRY_WEBHOOK_URL` and `RESEND_API_KEY` + `ENQUIRY_TO` are upgrades
 * that run alongside it — see README §Enquiries.
 *
 * On any non-OK response the card still tries the visitor's mail client,
 * but it shows its failure state rather than a success it did not earn.
 */
export const FORM_ENDPOINT: string | null = '/api/enquiry'
