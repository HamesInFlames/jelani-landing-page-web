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
  /** One short line of context under the title. */
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
    // Fixed by the brief — do not rewrite without sign-off.
    headline: 'Fast-turnaround creative for brand events.',
    sub: 'I help brands and agencies turn events into content — recaps delivered while the moment still matters.',
    primary: 'Book a call',
    secondary: 'See the work',
    /**
     * PENDING: Jelani's showreel loop (muted, 10–20s, <4MB, 1080p max).
     * Drop the file at /media/reel.mp4 and set both fields — the hero
     * mounts the video layer automatically. Until then it renders an
     * animated ambient backdrop rather than a placeholder clip.
     */
    reel: null as string | null,
    reelPoster: null as string | null,
    /**
     * The scroll-scrubbed hero: his own footage, frame by frame, under the
     * visitor's thumb. Frames are built by scripts/media/build-sequence.mjs
     * from the Soluna event recap (62.95s–66.45s, one unbroken shot).
     * Takes precedence over `reel`; set to null to fall back to the
     * ambient-light hero. Reduced-motion visitors get the poster.
     */
    sequence: {
      base: '/sequence',
      frameCount: 105,
      baseSm: '/sequence-sm',
      frameCountSm: 53,
      poster: '/media/hero-poster.webp',
      posterSm: '/media/hero-poster-sm.webp',
    } as {
      base: string
      frameCount: number
      baseSm?: string
      frameCountSm?: number
      poster: string
      posterSm?: string
    } | null,
  },

  /** Marquee: real credits interleaved with capabilities. */
  // CONFIRM: public naming of Socliq, Canergy, Reset Studio, Soluna, and
  // Kilani awaits Jelani's sign-off — each is one line to pull.
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
    'BeeVibe Juicery',
    'Kilani',
  ],

  services: {
    eyebrow: 'Services',
    title: 'What I shoot, and how fast you get it back.',
    blurb:
      'Four ways brands and agencies bring me in. Every one of them ends with usable footage in your hands, not a project that drags.',
    items: [
      {
        n: '01',
        title: 'Event video recaps',
        body: 'A full recap cut from your activation, launch, or influencer event — shot, edited, and colour-graded to run as paid or organic.',
        // CONFIRM: turnaround commitments below are drafted, not yet approved by Jelani.
        promise: '48–72 hour turnaround',
      },
      {
        n: '02',
        title: 'Photo coverage',
        // CONFIRM: the BTS-film bundle wording is drafted from Jelani's
        // standing offer ("for brand transparency") — not yet signed off.
        body: 'Stills captured alongside the video on the same day, retouched and delivered as a gallery your team can pull from all quarter. Book photo and video together and a behind-the-scenes film is included, free.',
        promise: 'Edited gallery in 72 hours',
      },
      {
        n: '03',
        title: 'Second shooting',
        body: 'Overflow support for agencies and in-house teams — a second camera that matches your lead shooter and needs no hand-holding on the day.',
        promise: 'Day rate, GTA-wide',
      },
      {
        n: '04',
        title: 'Quick-turnaround editing',
        // CONFIRM: package pointer reflects the 2026-08-02 pricing drop.
        body: 'Send me the footage and get back a finished cut: story, pacing, sound, colour. Vertical and horizontal versions from one edit. Fixed packages below — ten or twenty edits, $100 each.',
        promise: 'Same-week delivery',
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
      'Before all of this I spent four years in sales, which is a strange line on a creative résumé until you have sat in a kickoff and watched a shoot get scoped without anyone asking what the content is for. I ask.',
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
        blurb: 'A Black History Month feature produced for Sportsnet.',
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
      {
        id: 'reels',
        eyebrow: 'Reels',
        title: 'Shooting and cutting, in ninety seconds.',
        layout: 'grid',
        items: [
          {
            id: 'cinematography-reel',
            title: 'Cinematography Reel',
            kind: 'video',
            ytId: '0BmqVLkam-g',
            poster: '/media/yt-0BmqVLkam-g.webp',
            note: 'Camera work across events, brand, and lifestyle',
          },
          {
            id: 'editors-reel-2020',
            title: 'Editors Reel 2020',
            kind: 'video',
            ytId: '42abljCvlbc',
            poster: '/media/yt-42abljCvlbc.webp',
            note: 'Pacing, sound design, colour',
          },
          {
            // Titled "Editors Reel | ANOTHA ONE" on YouTube; the site keeps
            // "Part 2" — clearer to a buyer scanning a row of three reels.
            id: 'editors-reel-pt2',
            title: 'Editors Reel — Part 2',
            kind: 'video',
            ytId: 'rTFInFnpJa8',
            poster: '/media/yt-rTFInFnpJa8.webp',
            note: 'Second selection of edit work',
          },
        ],
      },
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
            note: 'Nightlife event, shot and cut for the feed',
          },
          {
            id: 'bioderma',
            title: 'Bioderma — Event Recap',
            client: 'Bioderma',
            kind: 'video',
            ytId: null,
            poster: '/media/bioderma-poster.webp',
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
        blurb: 'Activation coverage and campaign stills for brands and the agencies that book them.',
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
          {
            id: 'beevibe',
            title: 'BeeVibe Juicery — Product',
            client: 'BeeVibe Juicery',
            kind: 'photo',
            ytId: null,
            poster: null,
            note: 'Product photography',
          },
        ],
        layout: 'grid',
      },
      {
        id: 'shorts',
        eyebrow: 'Short-form & UGC',
        title: 'Built for the feed.',
        blurb: 'Vertical work — the format most of my clients are buying right now.',
        layout: 'row',
        items: [
          {
            id: 'luxury-short',
            title: 'Luxury Villa UGC',
            kind: 'short',
            ytId: 'agP4vz_HjYw',
            poster: '/media/yt-agP4vz_HjYw.webp',
          },
          {
            id: 'cinematic-short',
            title: 'Cinematic Short',
            kind: 'short',
            ytId: 'IRGQXQKWEek',
            poster: '/media/yt-IRGQXQKWEek.webp',
          },
          {
            id: 'promise',
            title: 'Promise',
            kind: 'short',
            ytId: 'LTD6Zqn1vq0',
            poster: '/media/yt-LTD6Zqn1vq0.webp',
          },
          {
            id: 'star-v',
            title: 'Star Villas Costa Rica',
            kind: 'short',
            ytId: 'VdbsVKasgBI',
            poster: '/media/yt-VdbsVKasgBI.webp',
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
        blurb: 'Studio and location portrait work — beauty, fashion, editorial.',
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
    brief: {
      image: '/media/brief-page.webp',
      // CONFIRM: naming Kilani publicly pending Jelani's sign-off.
      caption: 'An actual page from a client creative brief — Kilani campaign.',
      alt: 'A page from a real creative brief titled "The Goal", describing strategic studio photography for a brand partnership.',
    },
    bts: {
      images: [
        { src: '/media/photos/bts-01.webp', alt: 'Behind the scenes — a reformer pilates class being filmed' },
        { src: '/media/photos/bts-02.webp', alt: 'Behind the scenes — event coverage in progress at a studio' },
        { src: '/media/photos/bts-03.webp', alt: 'Behind the scenes — the room mid-shoot' },
        { src: '/media/photos/bts-04.webp', alt: 'Behind the scenes — setting up a shot on the studio floor' },
      ],
      caption: 'Phone shots from a live shoot day.',
    },
    // CONFIRM: bundle wording drafted from Jelani's standing offer.
    bundleNote:
      'Book photo and video together and a behind-the-scenes film like this comes free — brand transparency, on the house.',
  },

  /**
   * Video-editing pricing, supplied by Jelani via James 2026-08-02.
   * The model's rules are strict and load-bearing: two fixed tiers, no
   * discounts, no in-between quantities; the quarterly package includes
   * the quarter's branding strategy complimentary, precisely so the
   * editing keeps being charged at full worth. Never add a discount
   * badge, a crossed-out price, or a "most popular" label here.
   * Coverage work (recaps, photo, second shooting) stays quote-per-project.
   */
  pricing: {
    eyebrow: 'Pricing',
    title: "An edit costs $100. That's the whole model.",
    blurb:
      'Video editing runs on fixed packages — no discounts, no in-between quantities, no negotiation theatre. Event coverage and photography are scoped per project through the card below.',
    tiers: [
      {
        id: 'ten',
        name: '10 edits',
        price: '$1,000',
        body: 'For a launch, a campaign burst, or a month of consistent posting.',
        foot: '$100 per edit',
        featured: false,
      },
      {
        id: 'twenty',
        name: '20 edits',
        price: '$2,000',
        body: 'The same $100 an edit, doubled — for teams feeding more than one channel.',
        foot: '$100 per edit',
        featured: false,
      },
      {
        id: 'quarterly',
        name: 'Quarterly',
        price: 'From $3,000 / quarter',
        body: 'Ten-plus videos a month with room to scale — and the quarter’s branding strategy comes with it, complimentary.',
        foot: 'Strategy included',
        featured: true,
      },
    ],
    cta: 'Start with this',
    // CONFIRM: currency presentation (assumed CAD, Toronto client base).
    footnote:
      'Prices in CAD. Event recaps, photo coverage, and second shooting are quoted per project.',
  },

  cta: {
    eyebrow: "Let's talk",
    title: 'Have an event coming up?',
    sub: 'Three quick questions and I will come back to you with availability and a quote.',
    steps: [
      {
        id: 'need',
        question: 'What do you need?',
        options: ['Event recap', 'Photo coverage', 'Video + Photo bundle', 'Second shooter', 'Editing support'],
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
    fallbackNote: 'Prefer email?',
  },

  footer: {
    tagline: 'Video and photo for brands and agencies.',
    location: 'Toronto / GTA',
  },
} as const

/**
 * Formspree-class relay endpoint for the CTA card.
 * PENDING: create the endpoint on Jelani's email and paste the URL here.
 * While null, the card submits via a prefilled mailto: instead.
 */
export const FORM_ENDPOINT: string | null = null
