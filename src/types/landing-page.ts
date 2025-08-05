export interface LandingPageData {
  hero: {
    headline: string;        // [NAME]
    subhead: string;         // [DESCRIPTION] 
    badge: string;           // [Type]
  };
  valueProposition: {
    title: string;           // "What You're Actually Buying"
    content: string;         // [WHAT THE CLIENT IS ACTUALLY BUYING]
  };
  benefits: {
    title: string;           // "Key Benefits"
    items: string[];         // parsed from [BENEFITS]
  };
  features: {
    title: string;           // "Key Features"
    items: string[];         // parsed from [KEY FEATURES]
  };
  perfectFor: {
    title: string;           // "Perfect For"
    primary: string;         // [PERFECT FOR:]
    secondary: string;       // [IDEAL CLIENT]
  };
  pricing: {
    price: string;           // [PRICE]
    deliverables: string;    // [Primary Deliverables]
    ctaText: string;         // "Get Started"
    ctaLink: string;         // editable link
  };
  upsell: {
    title: string;           // "What's Next?"
    content: string;         // [WHAT IS THE NEXT PRODUCT OR SERVICE?]
    show: boolean;           // only if content exists
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