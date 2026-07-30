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
  layout: 'featured' | 'grid' | 'row' | 'gallery'
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
  },

  /** Marquee: real credits interleaved with capabilities. */
  marquee: [
    'Sportsnet',
    'Event recaps',
    'Visual Smugglers',
    'Second shooter',
    'Camp Dreamwood',
    'Same-week edits',
    'BeeVibe Juicery',
    'Photo coverage',
    'Studio Impetus',
    'Brand campaigns',
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
        body: 'Stills captured alongside the video on the same day, retouched and delivered as a gallery your team can pull from all quarter.',
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
        body: 'Send me the footage and get back a finished cut: story, pacing, sound, colour. Vertical and horizontal versions from one edit.',
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
            ytId: null,
            poster: null,
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
            ytId: null,
            poster: null,
            note: 'Camera work across events, brand, and lifestyle',
          },
          {
            id: 'editors-reel-2020',
            title: 'Editors Reel 2020',
            kind: 'video',
            ytId: null,
            poster: null,
            note: 'Pacing, sound design, colour',
          },
          {
            id: 'editors-reel-pt2',
            title: 'Editors Reel — Part 2',
            kind: 'video',
            ytId: null,
            poster: null,
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
            id: 'camp-dreamwood',
            title: 'Camp Dreamwood — Weekly Recap',
            client: 'Camp Dreamwood',
            kind: 'video',
            ytId: null,
            poster: null,
            note: 'Recurring weekly recap series, summer 2021',
          },
          {
            id: 'bioderma',
            title: 'Bioderma — Event Recap',
            client: 'Bioderma',
            kind: 'video',
            ytId: null,
            poster: null,
            note: 'Coming soon',
          },
        ],
      },
      {
        id: 'campaigns',
        eyebrow: 'Campaigns · Studio Impetus',
        title: 'Brand campaigns and product.',
        blurb: 'Campaign films and product photography produced through Studio Impetus.',
        layout: 'grid',
        items: [
          {
            id: 'beevibe',
            title: 'BeeVibe Juicery — Product',
            client: 'BeeVibe Juicery',
            kind: 'photo',
            ytId: null,
            poster: null,
            note: 'Product photography',
          },
          {
            id: 'apparel-campaign',
            title: 'Apparel Campaign',
            // CONFIRM: brand name to be supplied by Jelani.
            kind: 'video',
            ytId: null,
            poster: null,
            note: 'Campaign film and stills',
          },
          {
            id: 'lifestyle-campaign',
            title: 'Lifestyle Campaign',
            kind: 'video',
            ytId: null,
            poster: null,
            note: 'Brand lifestyle content',
          },
        ],
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
            title: 'Luxury',
            kind: 'short',
            ytId: null,
            poster: null,
          },
          {
            id: 'cinematic-short',
            title: 'Cinematic Short',
            kind: 'short',
            ytId: null,
            poster: null,
          },
          {
            id: 'promise',
            title: 'Promise',
            kind: 'short',
            ytId: null,
            poster: null,
          },
          {
            id: 'star-v',
            title: 'Star V',
            kind: 'short',
            ytId: null,
            poster: null,
          },
        ],
      },
      {
        id: 'photography',
        eyebrow: 'Photography',
        title: 'Beauty, portrait, and editorial.',
        layout: 'gallery',
        // PENDING: original exports. Screenshots from the old site are not
        // shippable quality — these render as plates until files land.
        items: [
          { id: 'photo-1', title: 'Editorial portrait', kind: 'photo', ytId: null, poster: null },
          { id: 'photo-2', title: 'Golden hour portrait', kind: 'photo', ytId: null, poster: null },
          { id: 'photo-3', title: 'Beauty — studio', kind: 'photo', ytId: null, poster: null },
          { id: 'photo-4', title: 'Duo portrait', kind: 'photo', ytId: null, poster: null },
          { id: 'photo-5', title: 'Editorial — white series', kind: 'photo', ytId: null, poster: null },
        ],
      },
    ] as WorkGroup[],
  },

  cta: {
    eyebrow: "Let's talk",
    title: 'Have an event coming up?',
    sub: 'Three quick questions and I will come back to you with availability and a quote.',
    steps: [
      {
        id: 'need',
        question: 'What do you need?',
        options: ['Event recap', 'Photo coverage', 'Second shooter', 'Editing support'],
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
