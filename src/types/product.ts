export interface Product {
  id: string;
  name: string;
  type: "PRODUCT" | "SERVICE";
  
  // Pricing Information
  pricing?: {
    type: "fixed" | "tiered" | "contact";
    display: string;
    options?: PricingOption[];
    notes?: string;
    currency?: string;
  };
  
  // Core Content
  content: {
    heroTitle?: string;
    heroSubtitle?: string;
    description: string;
    perfectFor: string;
    primaryDeliverables?: string;
    whatClientBuys?: string;
    idealClient?: string;
    nextProduct?: string;
    tagline?: string;
    shortDescription?: string;
  };
  
  // Features & Benefits (simplified arrays from CSV)
  features: string[];
  benefits: string[];
  perfectForList?: string[];
  
  // Marketing Copy
  marketing: {
    keyMessages: string[];
    valueProposition?: string;
    tagline?: string;
    uniqueSellingPoints?: string[];
    targetAudience?: string;
  };
  
  // Social Proof
  socialProof?: {
    testimonial?: Testimonial;
    caseStudy?: CaseStudy;
    stats?: Stat[];
    clientLogos?: string[];
  };
  
  // Call to Action
  cta?: {
    primary: {
      title: string;
      description: string;
      buttonText: string;
    };
    secondary?: {
      title: string;
      description: string;
      buttonText: string;
    };
  };
  
  // SEO & Meta
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    slug?: string;
  };
  
  // Metadata for editing
  metadata?: {
    extractedAt: string;
    source: string;
    editable: boolean;
    lastModified: string;
    richContentFiles?: number;
    editedBy?: string;
  };
  
  // Rich Content from markdown files - organized by content type
  richContent?: {
    manifesto?: RichContentFile;
    functionalSpec?: RichContentFile;
    audienceICPs?: RichContentFile;
    userStories?: RichContentFile;
    competitorAnalysis?: RichContentFile;
    marketSizing?: RichContentFile;
    prdSkeleton?: RichContentFile;
    uiPrompt?: RichContentFile;
    screenGeneration?: RichContentFile;
    landingPageCopy?: RichContentFile;
    keyMessages?: RichContentFile;
    investorDeck?: RichContentFile;
    demoScript?: RichContentFile;
    slideHeadlines?: RichContentFile;
    qaPrep?: RichContentFile;
  };
  
  // Additional Content Sections
  additionalSections?: ContentSection[];
}

// Structure for each rich content file
export interface RichContentFile {
  title: string;
  metadata: Record<string, any>;
  sections: Record<string, string>;
  fullContent: string;
}

export interface DetailedFeature {
  icon: string;
  title: string;
  description: string;
  category?: string;
}

export interface DetailedBenefit {
  title: string;
  description: string;
  impact?: string;
  category?: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  avatar?: string;
  rating?: number;
}

export interface CaseStudy {
  title: string;
  summary: string;
  challenge: string;
  solution: string;
  results: string[];
  client?: string;
  industry?: string;
}

export interface Stat {
  value: string;
  label: string;
  description?: string;
}

export interface PricingOption {
  name: string;
  price: string;
  description?: string;
  features?: string[];
  popular?: boolean;
  discount?: string;
}

export interface ContentSection {
  id: string;
  type: 'text' | 'features' | 'benefits' | 'testimonials' | 'pricing' | 'faq' | 'comparison';
  title: string;
  content: any; // Flexible content based on section type
  order: number;
  visible: boolean;
}

export interface Service extends Product {
  type: "SERVICE";
}

export type ProductOrService = Product | Service; 