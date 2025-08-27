import type { LandingPageData, CSVProduct } from '../types/landing-page';

/**
 * Parse bullet points or list items from text content
 * Handles both string input and array input
 */
function parseListItems(content: string | string[]): string[] {
  if (!content) return [];
  
  // If it's already an array, filter and clean it
  if (Array.isArray(content)) {
    return content
      .filter(item => item && item.trim && item.trim().length > 0)
      .map(item => item.trim())
      .slice(0, 6); // Limit to 6 items for UI purposes
  }
  
  // If it's a string, split by common bullet point patterns and clean up
  if (typeof content === 'string') {
    // Normalise line endings
    const normalised = content.replace(/\r\n/g, '\n');
    // Primary split on newlines; do NOT split on hyphens to avoid fragmenting phrases like "Real world solutions"
    let parts = normalised
      .split('\n')
      .map(part => part.replace(/^\s*[•*\-]\s*/, '')) // trim leading bullets if present
      .map(part => part.trim())
      .filter(part => part.length > 0);

    // If we still only have one big line, try splitting on bullet characters explicitly
    if (parts.length === 1) {
      parts = normalised
        .split(/[•·]/)
        .map(part => part.trim())
        .filter(part => part.length > 0);
    }

    // As a last resort, if commas/semicolons are used consistently, split on those
    if (parts.length === 1 && /[,;]\s+/.test(normalised)) {
      parts = normalised
        .split(/[,;]\s+/)
        .map(part => part.trim())
        .filter(part => part.length > 0);
    }

    return parts.slice(0, 6); // Limit to 6 items for UI purposes
  }
  
  return [];
}

/**
 * Clean and format text content
 */
function cleanText(text: string): string {
  if (!text) return '';
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * Convert CSV product data to landing page structure
 */
export function csvToLandingPageData(csvProduct: CSVProduct): LandingPageData {
  // AI Power Hour
  if (csvProduct.NAME === 'AI Power Hour') {
    return {
      hero: {
        headline: "AI Power Hour",
        subhead: "One hour. One challenge. Tangible results. The AI Power Hour is a focused, one-to-one session designed to help you tackle a specific problem with AI — and leave with a clear workflow, practical tools and new confidence.",
        badge: "PRODUCT",
        price: "£300. Includes the live session + follow-up resources.",
        ctaText: "Book your Power Hour"
      },
      whyChooseThis: {
        title: "Why book an AI Power Hour?",
        benefits: [
          {
            title: "Hands-on learning",
            description: "Not theory, but practical problem-solving with real tools."
          },
          {
            title: "Tailored to you",
            description: "We work on your challenge, not a case study."
          },
          {
            title: "Immediate value",
            description: "Leave with a workflow and documented next steps."
          },
          {
            title: "Low risk, high return",
            description: "At £300, it's the easiest way to explore what AI can do for you — and how we can help further."
          }
        ]
      },
      howItWorks: {
        title: "How it works",
        steps: [
          {
            verb: "Define",
            title: "the challenge and gap",
            description: "Problem statement between current and desired outcome."
          },
          {
            verb: "Break down",
            title: "into actionable steps",
            description: "Task breakdown with tools like ChatGPT or Goblin Tools."
          },
          {
            verb: "Design",
            title: "a workflow",
            description: "Build, test and refine using AI (e.g. Gamma, Claude)."
          },
          {
            verb: "Document",
            title: "summary and next steps",
            description: "Written summary of your problem statement and workflow."
          },
          {
            verb: "Follow up",
            title: "with resources",
            description: "Tailored resources and clear next steps to keep momentum."
          }
        ]
      },
      clientTestimonials: {
        title: "What our clients say",
        testimonial: {
          quote: "The Power Hour gave me immediate clarity on how AI could save me time on a task I thought was too complex to automate. I left with a workflow I could use the same day.",
          attribution: "Marketing Lead, National Charity"
        }
      },
      objections: {
        title: "What about...?",
        items: [
          {
            question: "Not sure what to bring?",
            answer: "We'll help you frame your challenge beforehand."
          },
          {
            question: "Worried it's too basic?",
            answer: "Even advanced users leave with new workflows and shortcuts."
          },
          {
            question: "Think it won't be enough time?",
            answer: "Our structure ensures you leave with tangible value in 60 minutes."
          }
        ]
      },
      offer: {
        title: "What you get",
        price: "60-minute one-to-one session for £300",
        deliverables: [
          "60-minute one-to-one session (remote)",
          "Clear problem statement and workflow",
          "Demos of relevant AI tools tailored to your challenge",
          "Written summary of session + next steps",
          "Follow-up resources for continued learning"
        ],
        outcomes: [
          "Accelerated AI literacy and confidence",
          "Practical problem-solving applied to your real work",
          "A clear, repeatable workflow you can use straight away",
          "A springboard into larger projects with BN"
        ],
        ctaText: "Book your Power Hour",
        ctaLink: "#contact"
      }
    };
  }

  // AI-B-C™
  if (csvProduct.NAME === 'AI-B-C™') {
    return {
      hero: {
        headline: "AI-B-C™",
        subhead: "Build AI literacy. Unlock performance. The AI-B-C™ programme helps your teams learn, apply and scale AI skills — fast. From quick wins to strategic roadmaps, we give you the knowledge and tools to spark innovation and boost performance.",
        badge: "PRODUCT",
        price: "From £300. Tailored programmes to fit your goals.",
        ctaText: "Start your journey"
      },
      whyChooseThis: {
        title: "Why teams choose AI-B-C™",
        benefits: [
          {
            title: "Accessible",
            description: "We make AI clear, practical and energising — no jargon, no overwhelm."
          },
          {
            title: "Actionable",
            description: "Every session delivers tools and skills your team can use straight away."
          },
          {
            title: "Scalable",
            description: "From a single executive briefing to multi-day sprints, we build literacy across your whole organisation."
          },
          {
            title: "Retention boost",
            description: "Teams feel motivated and valued when you invest in AI skills they can use immediately."
          }
        ]
      },
      howItWorks: {
        title: "How it works",
        steps: [
          {
            verb: "Brief",
            title: "& align",
            description: "90 minutes with leaders to align priorities and map opportunities."
          },
          {
            verb: "Apply",
            title: "AI in practice",
            description: "Immersive sessions to experiment with AI tools, tailored to teams' roles."
          },
          {
            verb: "Spot",
            title: "opportunities",
            description: "Apply learning directly to live tasks and challenges."
          },
          {
            verb: "Build",
            title: "custom tools",
            description: "Uncover AI use cases across departments."
          },
          {
            verb: "Create",
            title: "strategic roadmap",
            description: "Clear plan to embed AI capability and scale adoption."
          }
        ]
      },
      clientTestimonials: {
        title: "What our clients say",
        testimonial: {
          quote: "You made what could have been a daunting subject feel clear, practical, and fun. The session was engaging and left us with great ideas to take forward.",
          attribution: "Paulo Alves, Head of BMW Motorrad UK & Ireland"
        },
        clientLogos: ["BMW", "Barilla"]
      },
      objections: {
        title: "What about...?",
        items: [
          {
            question: "Too complex?",
            answer: "Sessions are simple, practical and energising — we meet teams where they are."
          },
          {
            question: "Too theoretical?",
            answer: "You'll leave with real-world use cases and live project work."
          },
          {
            question: "Too expensive?",
            answer: "Packages fit every budget, from a single briefing to multi-day team sprints."
          }
        ]
      },
      offer: {
        title: "Choose your format",
        price: "Flexible programmes from £300 to £17,500",
        deliverables: [
          "AI Power Hour — £300: One-to-one coaching for fast wins",
          "Executive AI Briefing — £2,000 (90 mins): Strategic clarity for senior leaders",
          "AI-B-C Team Day — £8,800: Full-day workshop for teams",
          "AI-B-C Sprint — from £17,500: Multi-workshop programme"
        ],
        outcomes: [
          "Teams skilled in AI tools and workflows",
          "Immediate productivity gains and quick wins",
          "Strategic AI roadmap for organisation-wide adoption"
        ],
        ctaText: "Start your journey",
        ctaLink: "#contact"
      }
    };
  }

  // AI Innovation Programme
  if (csvProduct.NAME === 'AI Innovation Programme') {
    return {
      hero: {
        headline: "AI Innovation Programme",
        subhead: "Systematise AI-driven innovation. The AI Innovation Programme turns experimentation into business results. We help you create a repeatable framework for AI-driven product, service and process improvement — so innovation isn't a one-off, it's a capability.",
        badge: "SERVICE",
        price: "Bespoke programmes for medium–large organisations, typically 2–6 months.",
        ctaText: "Start your programme"
      },
      whyChooseThis: {
        title: "Why teams choose the AI Innovation Programme",
        benefits: [
          {
            title: "Continuous innovation",
            description: "Move beyond one-off pilots to a system that delivers repeatable results."
          },
          {
            title: "Breakthrough outcomes",
            description: "Rapid solutions available for a fraction of the investment compared to even a year ago."
          },
          {
            title: "Integrated with R&D",
            description: "Designed for organisations with budgets and appetite for sustained innovation."
          },
          {
            title: "Expert guidance",
            description: "Industry-leading advisors simplify AI challenges and de-risk experimentation."
          }
        ]
      },
      howItWorks: {
        title: "How it works",
        steps: [
          {
            verb: "Set up",
            title: "your process",
            description: "Consulting to design your innovation framework and governance."
          },
          {
            verb: "Run",
            title: "ideation workshops",
            description: "Facilitated sessions to generate, shape and prioritise AI ideas."
          },
          {
            verb: "Prototype",
            title: "and test",
            description: "Rapid prototyping to explore feasibility and impact."
          },
          {
            verb: "Integrate",
            title: "into R&D",
            description: "Connect tested solutions with existing products, services or processes."
          },
          {
            verb: "Measure",
            title: "and optimise",
            description: "Track metrics, capture learnings and embed continuous improvement."
          }
        ]
      },
      clientTestimonials: {
        title: "What our clients say",
        testimonial: {
          quote: "Brilliant Noise delivered learning, tools and preparation of the highest quality. It equipped our senior leaders for future decisions and highlighted opportunities for new business models.",
          attribution: "Senior leader, Global Media Group"
        }
      },
      objections: {
        title: "What about...?",
        items: [
          {
            question: "Too abstract?",
            answer: "You'll leave with tangible prototypes, frameworks and tested solutions."
          },
          {
            question: "Too risky?",
            answer: "We de-risk innovation by starting small, testing fast and scaling only what works."
          },
          {
            question: "Too resource-heavy?",
            answer: "Programmes are tailored to your size, budget and existing capability."
          }
        ]
      },
      offer: {
        title: "What you get",
        price: "Bespoke programmes typically 2–6 months",
        deliverables: [
          "A tailored AI innovation process designed for your organisation",
          "Ideation workshops and facilitated experimentation",
          "Prototyping and testing of selected solutions",
          "Guidance on integrating AI into products and services",
          "Innovation metrics and evaluation framework"
        ],
        outcomes: [
          "Increased opportunity for breakthrough innovation",
          "Faster delivery of major projects",
          "Enhanced innovation capability and pace",
          "Simplified AI challenges with expert support"
        ],
        ctaText: "Start your programme",
        ctaLink: "#contact"
      }
    };
  }

  // AI Sherpa (AI Consultancy Retainer)
  if (csvProduct.NAME === 'AI Consultancy Retainer') {
    return {
      hero: {
        headline: "AI Sherpa",
        subhead: "Your dedicated leadership guide to AI. Our AI Sherpa service is a one-to-one coaching and advisory service for senior leaders. You'll work directly with a dedicated Brilliant Noise consultant — your Sherpa — to build confidence, accelerate learning and make smarter decisions about AI in your organisation.",
        badge: "SERVICE",
        price: "Bespoke monthly retainer. Tailored to you.",
        ctaText: "Start your journey"
      },
      whyChooseThis: {
        title: "Why leaders choose AI Sherpa",
        benefits: [
          {
            title: "Dedicated support",
            description: "A single point of contact — your AI Sherpa — available when you need them."
          },
          {
            title: "Strategic confidence",
            description: "Build clarity on how AI impacts your business and how to respond."
          },
          {
            title: "Practical guidance",
            description: "Get tools, workflows and examples directly applied to your context."
          },
          {
            title: "Personalised pace",
            description: "Weekly sessions, ongoing correspondence and continuous support, shaped around your needs."
          }
        ]
      },
      howItWorks: {
        title: "How it works",
        steps: [
          {
            verb: "Kick-off",
            title: "deep dive",
            description: "Understand your challenges, goals and organisational context."
          },
          {
            verb: "Weekly",
            title: "coaching sessions",
            description: "Structured one-to-one time (remote or in person) to build skills and shape strategy."
          },
          {
            verb: "Always-on",
            title: "support",
            description: "Direct access to your AI Sherpa between sessions for advice, resources and feedback."
          },
          {
            verb: "Live",
            title: "problem-solving",
            description: "Work on real tasks, pilots or strategic questions together."
          },
          {
            verb: "Ongoing",
            title: "roadmap",
            description: "Continuous updates to your personal and organisational AI plan."
          }
        ]
      },
      clientTestimonials: {
        title: "What our clients say",
        testimonial: {
          quote: "Having Antony as my AI Sherpa has been invaluable. He's a trusted partner who helps me navigate the fast-moving AI landscape with clarity and confidence. His advice is both strategic and practical — and having that long-term perspective means I can focus on the big picture while still making smart day-to-day decisions.",
          attribution: "Thomas Bunn, [Job Title], Zeno"
        }
      },
      objections: {
        title: "What about...?",
        items: [
          {
            question: "Too much commitment?",
            answer: "The retainer is flexible — we scale up or down depending on what you need."
          },
          {
            question: "Not technical enough?",
            answer: "This isn't about coding — it's about strategy, leadership and smart application of AI."
          },
          {
            question: "Can't find the time?",
            answer: "Weekly sessions are structured, but most value comes from the ongoing access and responsiveness of your Sherpa."
          }
        ]
      },
      offer: {
        title: "What you get",
        price: "Monthly retainer, tailored to your needs",
        deliverables: [
          "A dedicated Brilliant Noise consultant as your AI Sherpa",
          "Weekly one-to-one coaching sessions (remote or in person)",
          "Always-on support between sessions",
          "Customised resources, tools and prompts",
          "Live problem-solving applied to your business challenges",
          "An evolving roadmap to guide organisational adoption"
        ],
        outcomes: [
          "Accelerated personal AI literacy and confidence",
          "Trusted, on-demand guidance for senior-level decision-making",
          "A sharper, future-ready strategy for your organisation"
        ],
        ctaText: "Start your journey",
        ctaLink: "#contact"
      }
    };
  }

  // AI Innovation Day (AI Acceleration Day)
  if (csvProduct.NAME === 'AI Innovation Day') {
    return {
      hero: {
        headline: "AI Acceleration Day",
        subhead: "From idea to output in one day. AI Acceleration Day is a fast-paced, immersive workshop that takes your team from raw idea to working concept — in just 24 hours. By the end of the day you'll have something real: a prototype, microsite, campaign concept or product demo built with AI tools.",
        badge: "PRODUCT",
        price: "£8,800 for a full-day facilitated workshop.",
        ctaText: "Book your day"
      },
      whyChooseThis: {
        title: "Why teams choose AI Acceleration Day",
        benefits: [
          {
            title: "Proves what's possible",
            description: "Turn AI hype into hands-on, live results."
          },
          {
            title: "Accelerates understanding",
            description: "Teams see AI's potential by doing, not just talking."
          },
          {
            title: "Tangible outputs",
            description: "Leave with a working concept, not a slide deck."
          },
          {
            title: "Future blueprint",
            description: "Create a repeatable model for rapid experimentation."
          }
        ]
      },
      howItWorks: {
        title: "How it works",
        steps: [
          {
            verb: "Frame",
            title: "the challenge",
            description: "Align on your team's idea, opportunity or problem."
          },
          {
            verb: "Generate",
            title: "ideas with AI",
            description: "Structured brainstorming using AI-assisted ideation tools."
          },
          {
            verb: "Design",
            title: "and prototype",
            description: "Create live outputs using no-code tools and AI accelerators."
          },
          {
            verb: "Launch",
            title: "and test",
            description: "Produce a shareable landing page, microsite or demo in real time."
          },
          {
            verb: "Reflect",
            title: "and plan",
            description: "Capture learnings, coaching and recommendations for next steps."
          }
        ]
      },
      clientTestimonials: {
        title: "What our clients say",
        testimonial: {
          quote: "The Acceleration Day showed our leadership team what was possible with AI — not in theory, but in practice. We left energised, aligned, and with a tangible output to build on.",
          attribution: "Senior Digital Lead, Global Retail Brand"
        }
      },
      objections: {
        title: "What about...?",
        items: [
          {
            question: "Too theoretical?",
            answer: "This is hands-on from start to finish — teams build and launch live outputs."
          },
          {
            question: "Too risky?",
            answer: "It's a low-cost, low-risk way to explore AI's value before investing further."
          },
          {
            question: "Too much for one day?",
            answer: "The format is proven: structured facilitation means you get results in 24 hours."
          }
        ]
      },
      offer: {
        title: "What you get",
        price: "One-day facilitated workshop for £8,800",
        deliverables: [
          "One-day facilitated workshop, led by strategists and AI experts",
          "Full-day prototyping support with AI tools (ChatGPT, Gamma, Framer, Webflow)",
          "Launch-ready output: a landing page, prototype, campaign concept or microsite",
          "Custom prompts, templates and coaching for future use",
          "Follow-up recommendations on embedding AI in product and content development"
        ],
        outcomes: [
          "Teams aligned and energised around AI's potential",
          "Real, shareable outputs to demonstrate value fast",
          "A repeatable blueprint for future rapid innovation sprints"
        ],
        ctaText: "Book your day",
        ctaLink: "#contact"
      }
    };
  }

  // Social Intelligence Dashboard
  if (csvProduct.NAME === 'Social Intelligence Dashboard') {
    return {
      hero: {
        headline: "AI Market Intelligence Dashboard",
        subhead: "Turn data into marketing intelligence. The AI Market Intelligence Dashboard turns online conversations into actionable insight. It scans reviews, forums, and social feeds to show what people really think — about your products, competitors and what matters most.",
        badge: "PRODUCT",
        price: "From £12,000. Packages scale from single campaigns to multi-market tracking.",
        ctaText: "Start your dashboard"
      },
      whyChooseThis: {
        title: "Why teams choose the AI Market Intelligence Dashboard",
        benefits: [
          {
            title: "Faster decisions",
            description: "Insights at your fingertips — no more weeks of manual research."
          },
          {
            title: "Smarter campaigns",
            description: "See exactly what resonates with audiences in each market."
          },
          {
            title: "Scalable",
            description: "From one campaign to multi-market tracking, it grows with your needs."
          },
          {
            title: "Interactive",
            description: "Explore insights with a dashboard and AI chatbot, not a static report."
          }
        ]
      },
      howItWorks: {
        title: "How it works",
        steps: [
          {
            verb: "Gather",
            title: "data",
            description: "AI-powered research across 50+ validated online sources."
          },
          {
            verb: "Analyse",
            title: "and score",
            description: "Our Weighted Resonance Index (WRI) ranks the attributes that matter most."
          },
          {
            verb: "Compare",
            title: "competitors",
            description: "See how rivals are positioned and what's working for them."
          },
          {
            verb: "Explore",
            title: "in the dashboard",
            description: "Interactive visualisation with drill-downs by segment, product or market."
          },
          {
            verb: "Apply",
            title: "insights",
            description: "Export reports and recommendations to power campaigns, product launches or market strategies."
          }
        ]
      },
      clientTestimonials: {
        title: "What our clients say",
        testimonial: {
          quote: "For the first time, all our European markets had tailored local marketing intelligence at their fingertips. The dashboard saved hours of data checking and gave teams confidence to adapt campaigns faster and more effectively.",
          attribution: "Marketing Director, BMW Motorrad Europe"
        },
        clientLogos: ["BMW"]
      },
      objections: {
        title: "What about...?",
        items: [
          {
            question: "Too complex?",
            answer: "Designed for marketers — intuitive dashboards and chatbot, not dense reports."
          },
          {
            question: "Too generic?",
            answer: "Each dashboard is customised to your brand, market or campaign."
          },
          {
            question: "Too resource-heavy?",
            answer: "Scale it: start small with one campaign or single market, then expand to always-on intelligence."
          }
        ]
      },
      offer: {
        title: "What you get",
        price: "From £12,000 for campaign or market analysis",
        deliverables: [
          "Per-campaign or per-market analysis with consumer, competitor and trend data",
          "Weighted Resonance Index (WRI) scoring 20 key attributes per product or market",
          "Interactive dashboard for exploration, comparison and scenario planning",
          "AI chatbot for instant answers to strategic questions",
          "Integrated reports (PDF + searchable viewer) with executive summaries"
        ],
        outcomes: [
          "Faster, more confident decision-making",
          "Stronger campaigns, with insights adapted to each market",
          "Lower research costs and less duplication of effort",
          "Strategic alignment across products, markets and teams"
        ],
        ctaText: "Start your dashboard",
        ctaLink: "#contact"
      }
    };
  }

  // AI Leadership Partner (Fractional CAIO)
  if (csvProduct.NAME === 'AI Leadership Partner (Fractional CAIO)') {
    return {
      hero: {
        headline: "AI Leadership Partner (Fractional CAIO)",
        subhead: "Executive-level AI leadership without the overhead. The AI Leadership Partner gives you access to senior AI expertise — guiding strategy, shaping capability and supporting decisions at the highest level. Think of it as a Fractional Chief AI Officer (CAIO): on call, embedded, and focused on your organisation's future.",
        badge: "SERVICE",
        price: "Bespoke retainer, tailored to your needs.",
        ctaText: "Start your partnership"
      },
      whyChooseThis: {
        title: "Why teams choose the AI Leadership Partner",
        benefits: [
          {
            title: "Strategic clarity",
            description: "Get executive-level advice on the impact of AI without big-tech bias."
          },
          {
            title: "On-demand leadership",
            description: "Fractional CAIO access with no delay or long recruitment cycles."
          },
          {
            title: "Capability building",
            description: "Develop your teams' skills while you set direction from the top."
          },
          {
            title: "Future focus",
            description: "Keep pace with disruption and turn uncertainty into opportunity."
          }
        ]
      },
      howItWorks: {
        title: "How it works",
        steps: [
          {
            verb: "Understand",
            title: "challenges and opportunities",
            description: "We start with a deep dive into your business priorities."
          },
          {
            verb: "Act",
            title: "as your AI leader",
            description: "Ongoing presence at the executive/board level to guide strategy and decision-making."
          },
          {
            verb: "Develop",
            title: "talent and teams",
            description: "Workshops and coaching to upskill leaders and embed AI capability."
          },
          {
            verb: "Prototype",
            title: "test and innovate",
            description: "Support for pilots and innovation sprints to accelerate learning."
          },
          {
            verb: "Measure",
            title: "optimise and scale",
            description: "Continuous assessment and roadmap updates to ensure lasting impact."
          }
        ]
      },
      clientTestimonials: {
        title: "What our clients say",
        testimonial: {
          quote: "Working with Brilliant Noise we were able to fill in the gaps in our knowledge and develop our approach towards AI as a team. It's quickly converted into action and a commitment to experiment.",
          attribution: "Guy Keeling, Global VP of Digital Commerce, Barilla"
        },
        clientLogos: ["Barilla"]
      },
      objections: {
        title: "What about...?",
        items: [
          {
            question: "Too risky to invest in leadership?",
            answer: "A fractional model means you get senior-level expertise without the overhead of a full-time hire."
          },
          {
            question: "Too early for us?",
            answer: "We meet you where you are — from low to medium AI maturity — and accelerate your learning curve."
          },
          {
            question: "Too disruptive?",
            answer: "We cut through the noise with pragmatic, board-ready guidance."
          }
        ]
      },
      offer: {
        title: "What you get",
        price: "Bespoke retainer, tailored to your needs",
        deliverables: [
          "Regular strategy sessions with AI experts",
          "Ongoing advisory services at the executive/board level",
          "Support in AI-related decision-making",
          "Assistance with AI talent acquisition and development",
          "Regular capability assessments and roadmap updates"
        ],
        outcomes: [
          "Faster, more confident AI-related decisions at the top level",
          "Reduced risk and faster learning through expert guidance",
          "Future-ready strategy without the recruitment overhead"
        ],
        ctaText: "Start your partnership",
        ctaLink: "#contact"
      }
    };
  }

  // For AI-Powered Research and Insight Sprint, use the ai_sprint.md content
  if (csvProduct.NAME === 'AI-Powered Research and Insight Sprint') {
    return {
      hero: {
        headline: "AI Insight Sprint",
        subhead: "Faster insights. Smarter campaigns. In just five days we'll deliver an interactive dashboard of audience insights and creative tests — not a static report.",
        badge: "PRODUCT",
        price: "£10,000. Five days. Campaign-ready insights.",
        ctaText: "Start your sprint"
      },
      whyChooseThis: {
        title: "Why teams choose the AI Insight Sprint",
        benefits: [
          {
            title: "Fast",
            description: "Get campaign-ready insights in days, not months."
          },
          {
            title: "Affordable", 
            description: "Research insights at a fraction of the cost of traditional methods."
          },
          {
            title: "Usable",
            description: "A live dashboard you can explore — not a PDF that gathers dust."
          },
          {
            title: "Confidence",
            description: "Insights that drive faster, more confident decision-making."
          }
        ]
      },
      howItWorks: {
        title: "How it works",
        steps: [
          {
            verb: "Gather",
            title: "and structure data",
            description: "audience, competitor and market intelligence."
          },
          {
            verb: "Analyse", 
            title: "trends and sentiment",
            description: "use AI tools to surface opportunities and signals."
          },
          {
            verb: "Build",
            title: "persona chatbots",
            description: "simulate conversations to uncover human truths."
          },
          {
            verb: "Test",
            title: "creative concepts", 
            description: "predict resonance and refine direction."
          },
          {
            verb: "Deliver",
            title: "the dashboard",
            description: "insights, scenarios and recommendations in one interactive hub."
          }
        ]
      },
      clientTestimonials: {
        title: "What our clients say",
        testimonial: {
          quote: "The AI Insight Sprint gave us clarity we normally wouldn't get for months. The dashboard let us play with scenarios and test campaign ideas straight away.",
          attribution: "Marketing Manager, BMW Motorrad"
        },
        clientLogos: ["charities", "BMW"]
      },
      objections: {
        title: "What about...?",
        items: [
          {
            question: "Budget?",
            answer: "Priced to deliver high-value insights quickly — used by charities and global brands alike."
          },
          {
            question: "Security?",
            answer: "Dashboards are hosted safely with no risk to your data or systems."
          },
          {
            question: "Tradition?",
            answer: "Reports are static. Dashboards let you see the living, moving picture of your audiences."
          }
        ]
      },
      offer: {
        title: "What you get",
        price: "5-day sprint for £10,000",
        deliverables: [
          "AI-driven market, sentiment and competitor analysis",
          "Persona chatbots for deeper understanding", 
          "Concept testing and predictive modelling",
          "An interactive dashboard of insights and recommendations"
        ],
        outcomes: [
          "Affordable insights for every campaign — big or small",
          "Faster, more confident decision-making",
          "Deeper access to data and insights across all skill levels"
        ],
        ctaText: "Start your sprint",
        ctaLink: "#contact"
      }
    };
  }

  // For other products, use a basic structure with CSV data
  const benefits = parseListItems(csvProduct.BENEFITS);
  const features = parseListItems(csvProduct['KEY FEATURES']);

  return {
    hero: {
      headline: cleanText(csvProduct.NAME),
      subhead: cleanText(csvProduct.DESCRIPTION),
      badge: cleanText(csvProduct.Type).toUpperCase(),
      price: cleanText(csvProduct.PRICE),
      ctaText: "Get Started"
    },
    whyChooseThis: {
      title: "Why teams choose this",
      benefits: benefits.slice(0, 4).map((benefit, index) => ({
        title: `Benefit ${index + 1}`,
        description: benefit
      }))
    },
    howItWorks: {
      title: "How it works",
      steps: features.slice(0, 5).map((feature, index) => ({
        verb: "Step",
        title: `${index + 1}`,
        description: feature
      }))
    },
    clientTestimonials: {
      title: "What our clients say",
      testimonial: {
        quote: "This solution has transformed how we work.",
        attribution: "Client"
      }
    },
    objections: {
      title: "What about...?",
      items: [
        {
          question: "Budget?",
          answer: "Our pricing is designed to deliver maximum value."
        },
        {
          question: "Time?",
          answer: "We work efficiently to deliver results quickly."
        },
        {
          question: "Results?",
          answer: "We guarantee measurable outcomes."
        }
      ]
    },
    offer: {
      title: "What you get",
      price: cleanText(csvProduct.PRICE),
      deliverables: [cleanText(csvProduct['Primary Deliverables'])],
      outcomes: ["Achieve your goals", "Save time and resources"],
      ctaText: "Get Started",
      ctaLink: "#contact"
    }
  };
}

/**
 * Load landing page data with localStorage overrides
 */
export function loadLandingPageData(
  csvProduct: CSVProduct, 
  productId: string
): LandingPageData {
  // Start with CSV data
  const baseData = csvToLandingPageData(csvProduct);
  
  // Apply any saved edits from localStorage
  const savedKey = `landing-page-${productId}`;
  const savedData = localStorage.getItem(savedKey);
  
  if (savedData) {
    try {
      const edits = JSON.parse(savedData);
      return mergeDeep(baseData, edits);
    } catch (error) {
      console.warn('Failed to parse saved landing page data:', error);
    }
  }
  
  return baseData;
}

/**
 * Save landing page edits to localStorage
 */
export function saveLandingPageData(
  data: LandingPageData, 
  productId: string
): void {
  const savedKey = `landing-page-${productId}`;
  localStorage.setItem(savedKey, JSON.stringify(data));
}

/**
 * Deep merge utility for applying edits
 */
function mergeDeep(target: any, source: any): any {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = mergeDeep(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
} 