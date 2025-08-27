import { useState, useEffect } from 'react';
import { ArrowRight, ExternalLink, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import type { LandingPageData, CSVProduct } from '../../types/landing-page';
import {
  loadLandingPageData,
  saveLandingPageData,
  csvToLandingPageData,
} from '../../utils/csvLandingPageParser';
import { EditableLandingSection } from './EditableLandingSection';

interface LandingPageViewProps {
  csvProduct: CSVProduct;
  productId: string;
}

export function LandingPageView({
  csvProduct,
  productId,
}: LandingPageViewProps) {
  const [landingData, setLandingData] = useState<LandingPageData>(() =>
    csvToLandingPageData(csvProduct)
  );

  // Load saved data on mount
  useEffect(() => {
    const loadedData = loadLandingPageData(csvProduct, productId);
    setLandingData(loadedData);
  }, [csvProduct, productId]);

  const handleSectionUpdate = (path: string, value: string | string[]) => {
    const pathParts = path.split('.');
    const updatedData = { ...landingData };

    // Navigate to the nested property and update it
    let current: any = updatedData;
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]];
    }
    current[pathParts[pathParts.length - 1]] = value;

    setLandingData(updatedData);
    saveLandingPageData(updatedData, productId);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Section 2: Why teams choose this */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
        <EditableLandingSection
          value={landingData.whyChooseThis.title}
          onSave={(value) =>
            handleSectionUpdate('whyChooseThis.title', value as string)
          }
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            {landingData.whyChooseThis.title}
          </h2>
        </EditableLandingSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {landingData.whyChooseThis.benefits.map((benefit, index) => (
            <div key={index} className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4 mx-auto">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              
              <EditableLandingSection
                value={benefit.title}
                onSave={(value) =>
                  handleSectionUpdate(`whyChooseThis.benefits.${index}.title`, value as string)
                }
                className="mb-3"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
              </EditableLandingSection>

              <EditableLandingSection
                value={benefit.description}
                onSave={(value) =>
                  handleSectionUpdate(`whyChooseThis.benefits.${index}.description`, value as string)
                }
                multiline
              >
                <p className="text-gray-600 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </EditableLandingSection>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: How it works */}
      <section className="bg-white border rounded-2xl p-8">
        <EditableLandingSection
          value={landingData.howItWorks.title}
          onSave={(value) =>
            handleSectionUpdate('howItWorks.title', value as string)
          }
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            {landingData.howItWorks.title}
          </h2>
        </EditableLandingSection>

        <div className="space-y-6">
          {landingData.howItWorks.steps.map((step, index) => (
            <div key={index} className="flex items-start gap-6 p-6 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <EditableLandingSection
                  value={`${step.verb} ${step.title}`}
                  onSave={(value) => {
                    const parts = (value as string).split(' ', 2);
                    handleSectionUpdate(`howItWorks.steps.${index}.verb`, parts[0] || '');
                    handleSectionUpdate(`howItWorks.steps.${index}.title`, parts.slice(1).join(' ') || '');
                  }}
                  className="mb-2"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    <span className="text-blue-600">{step.verb}</span> {step.title}
                  </h3>
                </EditableLandingSection>

                <EditableLandingSection
                  value={step.description}
                  onSave={(value) =>
                    handleSectionUpdate(`howItWorks.steps.${index}.description`, value as string)
                  }
                  multiline
                >
                  <p className="text-gray-600">{step.description}</p>
                </EditableLandingSection>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: What our clients say */}
      <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8">
        <EditableLandingSection
          value={landingData.clientTestimonials.title}
          onSave={(value) =>
            handleSectionUpdate('clientTestimonials.title', value as string)
          }
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            {landingData.clientTestimonials.title}
          </h2>
        </EditableLandingSection>

        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-white p-8 rounded-xl shadow-sm mb-6">
            <MessageSquare className="w-12 h-12 text-green-600 mx-auto mb-6" />
            
            <EditableLandingSection
              value={landingData.clientTestimonials.testimonial.quote}
              onSave={(value) =>
                handleSectionUpdate('clientTestimonials.testimonial.quote', value as string)
              }
              multiline
              className="mb-6"
            >
              <blockquote className="text-lg text-gray-700 italic leading-relaxed mb-6">
                "{landingData.clientTestimonials.testimonial.quote}"
              </blockquote>
            </EditableLandingSection>

            <EditableLandingSection
              value={landingData.clientTestimonials.testimonial.attribution}
              onSave={(value) =>
                handleSectionUpdate('clientTestimonials.testimonial.attribution', value as string)
              }
            >
              <cite className="text-sm text-gray-600 font-medium">
                — {landingData.clientTestimonials.testimonial.attribution}
              </cite>
            </EditableLandingSection>
          </div>

          {landingData.clientTestimonials.clientLogos && landingData.clientTestimonials.clientLogos.length > 0 && (
            <div className="flex items-center justify-center gap-6 opacity-60">
              {landingData.clientTestimonials.clientLogos.map((logo, index) => (
                <span key={index} className="text-sm text-gray-500">{logo}</span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Section 5: What about...? */}
      <section className="bg-white border rounded-2xl p-8">
        <EditableLandingSection
          value={landingData.objections.title}
          onSave={(value) =>
            handleSectionUpdate('objections.title', value as string)
          }
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            {landingData.objections.title}
          </h2>
        </EditableLandingSection>

        <div className="grid md:grid-cols-3 gap-6">
          {landingData.objections.items.map((objection, index) => (
            <div key={index} className="p-6 bg-gray-50 rounded-lg">
              <EditableLandingSection
                value={objection.question}
                onSave={(value) =>
                  handleSectionUpdate(`objections.items.${index}.question`, value as string)
                }
                className="mb-4"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {objection.question}
                </h3>
              </EditableLandingSection>

              <EditableLandingSection
                value={objection.answer}
                onSave={(value) =>
                  handleSectionUpdate(`objections.items.${index}.answer`, value as string)
                }
                multiline
              >
                <p className="text-gray-600 leading-relaxed">
                  {objection.answer}
                </p>
              </EditableLandingSection>
            </div>
          ))}
        </div>
      </section>

      {/* Section 6: What you get */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-8">
        <EditableLandingSection
          value={landingData.offer.title}
          onSave={(value) =>
            handleSectionUpdate('offer.title', value as string)
          }
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold mb-8">
            {landingData.offer.title}
          </h2>
        </EditableLandingSection>

        <div className="max-w-3xl mx-auto text-center mb-8">
          <EditableLandingSection
            value={landingData.offer.price}
            onSave={(value) =>
              handleSectionUpdate('offer.price', value as string)
            }
            className="mb-6"
          >
            <div className="text-2xl font-bold mb-6 text-blue-100">
              {landingData.offer.price}
            </div>
          </EditableLandingSection>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Deliverables */}
            <div className="bg-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Deliverables include:</h3>
              <ul className="space-y-2 text-left">
                {landingData.offer.deliverables.map((deliverable, index) => (
                  <EditableLandingSection
                    key={index}
                    value={deliverable}
                    onSave={(value) =>
                      handleSectionUpdate(`offer.deliverables.${index}`, value as string)
                    }
                  >
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-300 mt-0.5 flex-shrink-0" />
                      <span className="text-blue-100">{deliverable}</span>
                    </li>
                  </EditableLandingSection>
                ))}
              </ul>
            </div>

            {/* Outcomes */}
            <div className="bg-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">👉 Outcomes include:</h3>
              <ul className="space-y-2 text-left">
                {landingData.offer.outcomes.map((outcome, index) => (
                  <EditableLandingSection
                    key={index}
                    value={outcome}
                    onSave={(value) =>
                      handleSectionUpdate(`offer.outcomes.${index}`, value as string)
                    }
                  >
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-300 mt-0.5 flex-shrink-0" />
                      <span className="text-blue-100">{outcome}</span>
                    </li>
                  </EditableLandingSection>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center">
          <EditableLandingSection
            value={landingData.offer.ctaText}
            onSave={(value) =>
              handleSectionUpdate('offer.ctaText', value as string)
            }
          >
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2 text-lg">
              {landingData.offer.ctaText}
              <ArrowRight size={20} />
            </button>
          </EditableLandingSection>
        </div>
      </section>
    </div>
  );
}
