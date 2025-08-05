import { useState, useEffect } from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
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
      {/* Value Proposition */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
        <EditableLandingSection
          value={landingData.valueProposition.title}
          onSave={(value) =>
            handleSectionUpdate('valueProposition.title', value as string)
          }
          className="text-center mb-6"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            {landingData.valueProposition.title}
          </h2>
        </EditableLandingSection>

        <EditableLandingSection
          value={landingData.valueProposition.content}
          onSave={(value) =>
            handleSectionUpdate('valueProposition.content', value as string)
          }
          multiline
          className="text-center"
        >
          <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
            {landingData.valueProposition.content}
          </p>
        </EditableLandingSection>
      </section>

      {/* Benefits Grid */}
      <section>
        <EditableLandingSection
          value={landingData.benefits.title}
          onSave={(value) =>
            handleSectionUpdate('benefits.title', value as string)
          }
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900">
            {landingData.benefits.title}
          </h2>
        </EditableLandingSection>

        <EditableLandingSection
          value={landingData.benefits.items}
          onSave={(value) => handleSectionUpdate('benefits.items', value)}
          isList
          className="bg-white"
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {landingData.benefits.items.map((benefit, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </EditableLandingSection>
      </section>

      {/* Features */}
      <section className="bg-white border rounded-2xl p-8">
        <EditableLandingSection
          value={landingData.features.title}
          onSave={(value) =>
            handleSectionUpdate('features.title', value as string)
          }
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900">
            {landingData.features.title}
          </h2>
        </EditableLandingSection>

        <EditableLandingSection
          value={landingData.features.items}
          onSave={(value) => handleSectionUpdate('features.items', value)}
          isList
        >
          <div className="space-y-4">
            {landingData.features.items.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 border rounded-lg"
              >
                <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-3"></div>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </EditableLandingSection>
      </section>

      {/* Perfect For */}
      <section className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8">
        <EditableLandingSection
          value={landingData.perfectFor.title}
          onSave={(value) =>
            handleSectionUpdate('perfectFor.title', value as string)
          }
          className="text-center mb-6"
        >
          <h2 className="text-3xl font-bold text-gray-900">
            {landingData.perfectFor.title}
          </h2>
        </EditableLandingSection>

        <div className="space-y-4 max-w-3xl mx-auto">
          <EditableLandingSection
            value={landingData.perfectFor.primary}
            onSave={(value) =>
              handleSectionUpdate('perfectFor.primary', value as string)
            }
            multiline
          >
            <p className="text-lg text-gray-700 leading-relaxed">
              {landingData.perfectFor.primary}
            </p>
          </EditableLandingSection>

          <EditableLandingSection
            value={landingData.perfectFor.secondary}
            onSave={(value) =>
              handleSectionUpdate('perfectFor.secondary', value as string)
            }
            multiline
          >
            <p className="text-gray-600 leading-relaxed">
              {landingData.perfectFor.secondary}
            </p>
          </EditableLandingSection>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-8 text-center">
        <EditableLandingSection
          value={landingData.pricing.price}
          onSave={(value) =>
            handleSectionUpdate('pricing.price', value as string)
          }
          className="text-center mb-4"
        >
          <h3 className="text-4xl font-bold mb-4">
            {landingData.pricing.price}
          </h3>
        </EditableLandingSection>

        <EditableLandingSection
          value={landingData.pricing.deliverables}
          onSave={(value) =>
            handleSectionUpdate('pricing.deliverables', value as string)
          }
          multiline
          className="text-center mb-8"
        >
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            {landingData.pricing.deliverables}
          </p>
        </EditableLandingSection>

        <div className="flex gap-4 justify-center">
          <EditableLandingSection
            value={landingData.pricing.ctaText}
            onSave={(value) =>
              handleSectionUpdate('pricing.ctaText', value as string)
            }
          >
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2">
              {landingData.pricing.ctaText}
              <ArrowRight size={20} />
            </button>
          </EditableLandingSection>

          <EditableLandingSection
            value={landingData.pricing.ctaLink}
            onSave={(value) =>
              handleSectionUpdate('pricing.ctaLink', value as string)
            }
          >
            <a
              href={landingData.pricing.ctaLink}
              className="border border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center gap-2"
            >
              Learn More
              <ExternalLink size={20} />
            </a>
          </EditableLandingSection>
        </div>
      </section>

      {/* Upsell Section */}
      {landingData.upsell.show && (
        <section className="text-center bg-yellow-50 border border-yellow-200 rounded-2xl p-8">
          <EditableLandingSection
            value={landingData.upsell.title}
            onSave={(value) =>
              handleSectionUpdate('upsell.title', value as string)
            }
            className="text-center mb-4"
          >
            <h2 className="text-2xl font-bold text-gray-900">
              {landingData.upsell.title}
            </h2>
          </EditableLandingSection>

          <EditableLandingSection
            value={landingData.upsell.content}
            onSave={(value) =>
              handleSectionUpdate('upsell.content', value as string)
            }
            multiline
          >
            <p className="text-gray-700 max-w-2xl mx-auto">
              {landingData.upsell.content}
            </p>
          </EditableLandingSection>
        </section>
      )}
    </div>
  );
}
