export interface LandingPageData {
  // Section 1: Hero (handled by ProductPage.tsx)
  hero: {
    headline: string;        // Product name
    subhead: string;         // Description/value prop
    badge: string;           // Product type
    price: string;           // Price/timeline
    ctaText: string;         // Primary CTA text
  };
  
  // Section 2: Why teams choose this (3-4 key benefits)
  whyChooseThis: {
    title: string;           // "Why teams choose this"
    benefits: Array<{
      title: string;         // Fast/Affordable/Usable/Confidence
      description: string;   // Benefit description
    }>;
  };
  
  // Section 3: How it works (5-6 verb-led steps)
  howItWorks: {
    title: string;           // "How it works"
    steps: Array<{
      verb: string;          // Action verb (Gather, Analyse, etc.)
      title: string;         // Step name
      description: string;   // Step description
    }>;
  };
  
  // Section 4: What our clients say (testimonial + logos)
  clientTestimonials: {
    title: string;           // "What our clients say"
    testimonial: {
      quote: string;         // Client testimonial
      attribution: string;   // Client name/title/company
    };
    clientLogos?: string[];  // Optional client logos
  };
  
  // Section 5: What about...? (3 common objections)
  objections: {
    title: string;           // "What about...?"
    items: Array<{
      question: string;      // Budget? Security? etc.
      answer: string;        // Reassuring response
    }>;
  };
  
  // Section 6: What you get (price, deliverables, outcomes)
  offer: {
    title: string;           // "What you get"
    price: string;           // Price and timeline
    deliverables: string[];  // List of deliverables
    outcomes: string[];      // List of outcomes/benefits
    ctaText: string;         // Repeat CTA
    ctaLink: string;         // CTA link
  };
}

export interface CSVProduct {
  Type: string;
  NAME: string;
  PRICE: string;
  'Primary Deliverables': string;
  DESCRIPTION: string;
  'WHAT IS THE NEXT PRODUCT OR SERVICE?': string;
  'PERFECT FOR:': string;
  'WHAT THE CLIENT IS ACTUALLY BUYING': string;
  'IDEAL CLIENT': string;
  'KEY FEATURES': string | string[]; // Can be string or array
  BENEFITS: string | string[]; // Can be string or array
} 