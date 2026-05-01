export type LandingContent = {
  locale: 'en' | 'es';
  langLabel: string;
  pageTitle: string;
  metaDescription: string;
  headline: string;
  subheadline: string;
  proofStrip: string[];
  problemTitle: string;
  problemBody: string[];
  howTitle: string;
  howSteps: Array<{ title: string; body: string }>;
  differentiatorsTitle: string;
  differentiators: string[];
  roadmapTitle: string;
  roadmapNear: string[];
  roadmapLong: string[];
  ctas: {
    demo: string;
    github: string;
    docs: string;
  };
  sections: {
    proof: string;
    problem: string;
    how: string;
    screenshots: string;
    demo: string;
    why: string;
    stack: string;
    roadmap: string;
  };
  screenshotCaption: string;
  demoBlurb: string;
  footerTagline: string;
};
