/**
 * Community material used on the marketing homepage.
 *
 * Sources:
 * 1. A pre-launch LinkedIn discussion about form workflows.
 * 2. The public LinkedIn launch discussion.
 * 3. The Product Hunt launch discussion on X, plus the earlier introduction thread.
 *
 * These are public community comments and product feedback, never customer
 * testimonials. Wording is reproduced as supplied, with the author's handle or name.
 * A quote only renders an outbound link when the exact public discussion is known.
 */
export type CommunityGroup = "prelaunch" | "launch" | "x";

export type CommunityKind = "feedback" | "question" | "insight" | "suggestion";

export type CommunityQuote = {
  name: string;
  role: string;
  quote: string;
  group: CommunityGroup;
  kind: CommunityKind;
  /** What the comment is, shown on the card. */
  label: string;
  sourceLabel: string;
  sourceUrl: string | null;
};

export type CommunityQuestion = {
  name: string;
  role: string;
  topic: string;
  detail: string;
  kind: CommunityKind;
  status: string;
  sourceUrl: string | null;
};

export const communitySources = {
  prelaunch: null,
  launch: "https://lnkd.in/p/ddZCBWY8",
  productHunt: "https://x.com/FaizyabHus74391/status/2119656228120838146",
  introduction: "https://x.com/FaizyabHus74391/status/2116887344217530607",
} as const;

const LINKEDIN_LAUNCH = "LinkedIn launch discussion";
const PRODUCT_HUNT = "Product Hunt discussion on X";
const LINKEDIN_PRELAUNCH = "Pre-launch LinkedIn discussion";

export const COMMUNITY_QUOTES: CommunityQuote[] = [
  {
    group: "prelaunch",
    kind: "insight",
    label: "Developer insight",
    name: "Tehseen Shahzad",
    role: "Senior WordPress Developer",
    quote:
      "Email-only delivery is where leads quietly die, inboxes get missed and nobody owns the follow-up.",
    sourceLabel: LINKEDIN_PRELAUNCH,
    sourceUrl: communitySources.prelaunch,
  },
  {
    group: "prelaunch",
    kind: "insight",
    label: "Developer insight",
    name: "MUDASIR LAL",
    role: "WordPress Developer",
    quote: "Email alone is too easy to miss or lose to spam.",
    sourceLabel: LINKEDIN_PRELAUNCH,
    sourceUrl: communitySources.prelaunch,
  },
  {
    group: "prelaunch",
    kind: "insight",
    label: "Developer insight",
    name: "Firas Jday",
    role: "Senior Full Stack Engineer and Tech Lead",
    quote: "The real gap is follow-up: who answered, and when.",
    sourceLabel: LINKEDIN_PRELAUNCH,
    sourceUrl: communitySources.prelaunch,
  },
  {
    group: "prelaunch",
    kind: "feedback",
    label: "Community feedback",
    name: "Vandana Tripathi",
    role: "Full Stack Developer",
    quote:
      "Having a centralized lead management system with status tracking and follow-ups makes things much easier.",
    sourceLabel: LINKEDIN_PRELAUNCH,
    sourceUrl: communitySources.prelaunch,
  },
  {
    group: "prelaunch",
    kind: "suggestion",
    label: "Feature suggestion",
    name: "Jamiu Sanni",
    role: "Stackreel Founder",
    quote:
      "One reusable workflow template you clone per client instead of rebuilding for each project.",
    sourceLabel: LINKEDIN_PRELAUNCH,
    sourceUrl: communitySources.prelaunch,
  },
  {
    group: "prelaunch",
    kind: "insight",
    label: "Developer insight",
    name: "Pawan Jangir",
    role: "Founder, Jangir IT Solution",
    quote: "The real challenge isn't just capturing the lead, it's converting it.",
    sourceLabel: LINKEDIN_PRELAUNCH,
    sourceUrl: communitySources.prelaunch,
  },
  {
    group: "launch",
    kind: "feedback",
    label: "Community feedback",
    name: "Talha Umair",
    role: "Lead UI/UX Designer and Agency Owner",
    quote:
      "Right now we juggle form tools, email notifications, and spreadsheets, and giving clients access to their leads is always messy.",
    sourceLabel: LINKEDIN_LAUNCH,
    sourceUrl: communitySources.launch,
  },
  {
    group: "launch",
    kind: "insight",
    label: "Developer insight",
    name: "Ahmad Abbasi",
    role: "Project Manager and Team Lead",
    quote:
      "I manage submissions by routing every lead straight to the person who owns the follow up.",
    sourceLabel: LINKEDIN_LAUNCH,
    sourceUrl: communitySources.launch,
  },
  {
    group: "launch",
    kind: "insight",
    label: "Developer insight",
    name: "Muhammad Rizwan",
    role: "Full Stack Automation Engineer",
    quote:
      "Every agency I know can build a form in an afternoon, and then spends weeks wiring up storage, search, and follow-up.",
    sourceLabel: LINKEDIN_LAUNCH,
    sourceUrl: communitySources.launch,
  },
  {
    group: "launch",
    kind: "insight",
    label: "Developer insight",
    name: "Muhammad Zahid",
    role: "Senior Full Stack Developer",
    quote:
      "An agency needs to know that a lead reached the right client, and that one client can never see another client's submissions.",
    sourceLabel: LINKEDIN_LAUNCH,
    sourceUrl: communitySources.launch,
  },
  {
    group: "launch",
    kind: "feedback",
    label: "Community feedback",
    name: "Mohamed Tawfik",
    role: "CTO",
    quote: "New leads, who is following up, and what's already handled.",
    sourceLabel: LINKEDIN_LAUNCH,
    sourceUrl: communitySources.launch,
  },
  {
    group: "launch",
    kind: "feedback",
    label: "Community feedback",
    name: "Abdul Rafay",
    role: "AI-Assisted Full-Stack Product Engineer",
    quote:
      "I like that you focused on the messy part, submissions and client access, instead of just the form itself.",
    sourceLabel: LINKEDIN_LAUNCH,
    sourceUrl: communitySources.launch,
  },
  {
    group: "x",
    kind: "feedback",
    label: "Community feedback",
    name: "@CholeSyntax",
    role: "Product Hunt discussion",
    quote: "Form submissions to organized leads is such a clean painkiller for agencies.",
    sourceLabel: PRODUCT_HUNT,
    sourceUrl: communitySources.productHunt,
  },
  {
    group: "x",
    kind: "feedback",
    label: "Community feedback",
    name: "@LeonwithAi",
    role: "Product Hunt discussion",
    quote: "Turning form chaos into clean leads.",
    sourceLabel: PRODUCT_HUNT,
    sourceUrl: communitySources.productHunt,
  },
  {
    group: "x",
    kind: "feedback",
    label: "Community feedback",
    name: "@uxbyissa",
    role: "Product Hunt discussion",
    quote: "The client read-only view is what sets Formivo apart.",
    sourceLabel: PRODUCT_HUNT,
    sourceUrl: communitySources.productHunt,
  },
  {
    group: "x",
    kind: "feedback",
    label: "Community feedback",
    name: "@JayLu03386264",
    role: "Introduction thread on X",
    quote: "Clean use case for agencies, Formivo looks useful.",
    sourceLabel: "Introduction thread on X",
    sourceUrl: communitySources.introduction,
  },
  {
    group: "x",
    kind: "question",
    label: "Product question",
    name: "@Misha4Ai",
    role: "Introduction thread on X",
    quote:
      "The hard part is the client-facing side. Do clients get a white-label share link or is it on your domain?",
    sourceLabel: "Introduction thread on X",
    sourceUrl: communitySources.introduction,
  },
  {
    group: "x",
    kind: "insight",
    label: "Developer insight",
    name: "@Lmin0711",
    role: "Product Hunt discussion",
    quote:
      "Most form tools stall at zero because nobody wants to swap out something that already works.",
    sourceLabel: PRODUCT_HUNT,
    sourceUrl: null,
  },
  {
    group: "x",
    kind: "question",
    label: "Product question",
    name: "@empowwerr",
    role: "Product Hunt discussion",
    quote:
      "How are you handling spam submissions without making legitimate visitors jump through hoops?",
    sourceLabel: PRODUCT_HUNT,
    sourceUrl: null,
  },
];

/**
 * Open questions and requests. `status` states what is true today so a roadmap
 * question is never mistaken for a shipped feature.
 */
export const COMMUNITY_QUESTIONS: CommunityQuestion[] = [
  {
    name: "@Misha4Ai",
    role: "Introduction thread on X",
    topic: "Client-facing branding",
    detail:
      "“The hard part is the client-facing side. Do clients get a white-label share link or is it on your domain?”",
    kind: "question",
    status:
      "White-label domains are not available today. Clients open a read-only portal on the Formivo link.",
    sourceUrl: communitySources.introduction,
  },
  {
    name: "@empowwerr",
    role: "Product Hunt discussion",
    topic: "Spam without friction",
    detail:
      "“How are you handling spam submissions without making legitimate visitors jump through hoops?”",
    kind: "question",
    status:
      "Honeypots, per-form and per-IP rate limits, an optional origin allow-list and a body cap are live. There is no captcha step.",
    sourceUrl: null,
  },
  {
    name: "Sunil Vishwakarma",
    role: "Developer",
    topic: "CRM connections",
    detail: "Asked whether submissions could feed an existing CRM.",
    kind: "question",
    status: "No native CRM integration yet. You can forward a submission from your own server.",
    sourceUrl: null,
  },
  {
    name: "Muhammad Rizwan",
    role: "Full Stack Automation Engineer",
    topic: "Routing and attribution",
    detail:
      "Raised duplicate detection, spam filtering, lead routing, CRM integrations and campaign attribution.",
    kind: "suggestion",
    status:
      "The first four controls on the list are partially shipped. Duplicate detection and routing are still roadmap items.",
    sourceUrl: communitySources.launch,
  },
  {
    name: "Zeeshan Khan",
    role: "Developer",
    topic: "Social sign-in",
    detail: "Suggested Google Sign-In as a faster way for clients to accept an invitation.",
    kind: "suggestion",
    status: "Invitations use email and password with a verification code. Social sign-in is not offered.",
    sourceUrl: null,
  },
  {
    name: "Ahmad Tariq Butt",
    role: "Developer",
    topic: "A free tier",
    detail: "Asked whether there would be a way to try Formivo before paying.",
    kind: "question",
    status:
      "Yes. The Free plan includes 1 form, 100 submissions a month and 1 client view, with no card.",
    sourceUrl: null,
  },
];

/**
 * The founder's public response about client separation. The capability is
 * confirmed in the authorization layer before it is shown as product behavior:
 * reads require an active form_client_permissions row, revocation is checked on
 * every request, and row-level security is covered by database tests.
 */
export const FOUNDER_RESPONSE = {
  quote:
    "Leads are fully separated per client/workspace so agencies can manage multiple client sites without any mix-up. Each client gets their own clean dashboard and submissions stay isolated.",
  verified:
    "Confirmed in the code: client reads require an active permission for that exact form, revoked permissions are refused on the next request, and the database enforces the same rule.",
  sourceUrl: communitySources.launch,
} as const;

/**
 * The founder's public position. It is not a claim that any roadmap item shipped.
 */
export const FOUNDER_STANCE =
  "Formivo starts with the parts that break first: collecting submissions reliably, organizing leads, and giving each client a controlled view. Advanced spam filtering, duplicate detection, lead routing and CRM integrations are areas worth exploring. They are not features I claim to have shipped.";

export const COMMUNITY_DISCLAIMER =
  "Quotes come from public LinkedIn discussions, the Formivo launch thread and the Product Hunt launch discussion on X. They are community feedback and product questions, not customer testimonials, paid endorsements or verified customer reviews.";
