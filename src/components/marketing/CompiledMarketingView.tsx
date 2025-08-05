import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Users,
  MessageSquare,
  Target,
  Award,
  CheckCircle,
} from 'lucide-react';
import MarkdownRenderer from '../MarkdownRenderer';
import type { CompiledMarketingPage } from '../../services/marketingCompiler';

interface CompiledMarketingViewProps {
  compiledPage: CompiledMarketingPage;
  className?: string;
}

const CompiledMarketingView: React.FC<CompiledMarketingViewProps> = ({
  compiledPage,
  className = '',
}) => {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    executiveSummary: true,
    messagingFramework: false,
    salesProcess: false,
    objectionHandling: false,
    marketingAssets: false,
    targetAudience: false,
    implementation: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const { content } = compiledPage;

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8 border border-blue-100">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Sales & Marketing Enablement Guide
          </h1>
        </div>
        <p className="text-gray-600">
          Comprehensive internal resource for sales teams, marketing
          professionals, and business development staff.
        </p>
        <div className="mt-4 text-sm text-gray-500">
          Compiled on {compiledPage.compiledAt.toLocaleDateString()} • Product
          ID: {compiledPage.productId}
        </div>
      </div>

      {/* Executive Summary */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('executiveSummary')}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Executive Summary
            </h2>
          </div>
          {expandedSections.executiveSummary ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>

        {expandedSections.executiveSummary && (
          <div className="mt-4 p-6 bg-white border border-gray-200 rounded-lg">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Product Overview
                </h3>
                <p className="text-gray-700 mb-4">
                  {content.executiveSummary.productOverview}
                </p>

                <h3 className="font-semibold text-gray-900 mb-2">
                  Target Market
                </h3>
                <p className="text-gray-700">
                  {content.executiveSummary.targetMarket}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Unique Value Proposition
                </h3>
                <p className="text-gray-700 mb-4">
                  {content.executiveSummary.uniqueValueProp}
                </p>

                <h3 className="font-semibold text-gray-900 mb-2">
                  Key Metrics
                </h3>
                <p className="text-gray-700">
                  {content.executiveSummary.keyMetrics}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Messaging Framework */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('messagingFramework')}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Messaging Framework
            </h2>
          </div>
          {expandedSections.messagingFramework ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>

        {expandedSections.messagingFramework && (
          <div className="mt-4 p-6 bg-white border border-gray-200 rounded-lg space-y-6">
            {/* Value Propositions */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Primary Value Propositions
              </h3>
              <div className="space-y-4">
                {content.messagingFramework.primaryValueProps.map(
                  (vp, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-green-500 pl-4"
                    >
                      <h4 className="font-medium text-gray-900">{vp.title}</h4>
                      <p className="text-gray-700 mt-1">{vp.description}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Evidence:</strong> {vp.evidence}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Elevator Pitches */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Elevator Pitches
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">
                    30-Second Pitch
                  </h4>
                  <p className="text-sm text-gray-700">
                    {content.messagingFramework.elevatorPitches.thirtySecond}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">
                    60-Second Pitch
                  </h4>
                  <p className="text-sm text-gray-700">
                    {content.messagingFramework.elevatorPitches.sixtySecond}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">
                    2-Minute Pitch
                  </h4>
                  <p className="text-sm text-gray-700">
                    {content.messagingFramework.elevatorPitches.twoMinute}
                  </p>
                </div>
              </div>
            </div>

            {/* Differentiators & Proof Points */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Key Differentiators
                </h3>
                <ul className="space-y-2">
                  {content.messagingFramework.keyDifferentiators.map(
                    (diff, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{diff}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Proof Points
                </h3>
                <ul className="space-y-2">
                  {content.messagingFramework.proofPoints.map(
                    (point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Award className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{point}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sales Process & Demo Guide */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('salesProcess')}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Sales Process & Demo Guide
            </h2>
          </div>
          {expandedSections.salesProcess ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>

        {expandedSections.salesProcess && (
          <div className="mt-4 p-6 bg-white border border-gray-200 rounded-lg space-y-6">
            {/* Discovery Questions */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Discovery Questions
              </h3>
              <ul className="space-y-2">
                {content.salesProcessGuide.discoveryQuestions.map(
                  (question, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-purple-600 font-semibold">
                        {index + 1}.
                      </span>
                      <span className="text-gray-700">{question}</span>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Demo Flow */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Demo Flow</h3>
              <div className="space-y-4">
                {content.salesProcessGuide.demoFlow.map((step, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <h4 className="font-medium text-gray-900 mb-2">
                      Step {step.step}: {step.title}
                    </h4>
                    <p className="text-gray-700 mb-2">{step.description}</p>
                    <div className="text-sm text-gray-600">
                      <strong>Talking Points:</strong>{' '}
                      {step.talkingPoints.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Wow Moments & Use Cases */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Wow Moments
                </h3>
                <ul className="space-y-2">
                  {content.salesProcessGuide.wowMoments.map((moment, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-gray-700">{moment}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Common Use Cases
                </h3>
                <div className="space-y-3">
                  {content.salesProcessGuide.commonUseCases.map(
                    (useCase, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <h4 className="font-medium text-gray-900">
                          {useCase.scenario}
                        </h4>
                        <p className="text-sm text-gray-700 mt-1">
                          {useCase.application}
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          <strong>Outcome:</strong> {useCase.outcome}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Objection Handling */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('objectionHandling')}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Objection Handling
            </h2>
          </div>
          {expandedSections.objectionHandling ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>

        {expandedSections.objectionHandling && (
          <div className="mt-4 p-6 bg-white border border-gray-200 rounded-lg space-y-6">
            {/* Common Objections */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Common Objections & Responses
              </h3>
              <div className="space-y-4">
                {content.objectionHandling.commonObjections.map(
                  (obj, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          {obj.objection}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            obj.category === 'price'
                              ? 'bg-red-100 text-red-800'
                              : obj.category === 'timing'
                                ? 'bg-yellow-100 text-yellow-800'
                                : obj.category === 'competition'
                                  ? 'bg-blue-100 text-blue-800'
                                  : obj.category === 'functionality'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {obj.category}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">
                        <strong>Response:</strong> {obj.response}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Evidence:</strong> {obj.evidence}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Competitive Positioning */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Competitive Positioning
              </h3>
              <div className="space-y-3">
                {content.objectionHandling.competitiveBattlecards.map(
                  (comp, index) => (
                    <div
                      key={index}
                      className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                    >
                      <h4 className="font-medium text-gray-900 mb-2">
                        vs {comp.competitor}
                      </h4>
                      <p className="text-gray-700 mb-2">{comp.positioning}</p>
                      <div className="text-sm text-blue-700">
                        <strong>Advantages:</strong>{' '}
                        {comp.advantages.join(', ')}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Pricing Justification */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Pricing Justification
              </h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  ROI Talking Points
                </h4>
                <ul className="space-y-1 mb-4">
                  {content.objectionHandling.pricingJustification.roiTalkingPoints.map(
                    (point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{point}</span>
                      </li>
                    )
                  )}
                </ul>
                <p className="text-sm text-gray-700">
                  <strong>Value Demonstration:</strong>{' '}
                  {content.objectionHandling.pricingJustification.valueDemo}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Marketing Assets & Resources */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('marketingAssets')}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Marketing Assets & Resources
            </h2>
          </div>
          {expandedSections.marketingAssets ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>

        {expandedSections.marketingAssets && (
          <div className="mt-4 p-6 bg-white border border-gray-200 rounded-lg">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Presentation Materials
                </h3>
                <ul className="space-y-1 mb-4">
                  {content.marketingAssets.presentationMaterials.map(
                    (asset, index) => (
                      <li key={index} className="text-gray-700">
                        • {asset}
                      </li>
                    )
                  )}
                </ul>

                <h3 className="font-semibold text-gray-900 mb-3">
                  Collateral Library
                </h3>
                <ul className="space-y-1">
                  {content.marketingAssets.collateralLibrary.map(
                    (asset, index) => (
                      <li key={index} className="text-gray-700">
                        • {asset}
                      </li>
                    )
                  )}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Digital Assets
                </h3>
                <ul className="space-y-1 mb-4">
                  {content.marketingAssets.digitalAssets.map((asset, index) => (
                    <li key={index} className="text-gray-700">
                      • {asset}
                    </li>
                  ))}
                </ul>

                <h3 className="font-semibold text-gray-900 mb-3">
                  Demo Scripts
                </h3>
                <ul className="space-y-1">
                  {content.marketingAssets.demoScripts.map((script, index) => (
                    <li key={index} className="text-gray-700">
                      • {script}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Target Audience Intelligence */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('targetAudience')}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Target Audience Intelligence
            </h2>
          </div>
          {expandedSections.targetAudience ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>

        {expandedSections.targetAudience && (
          <div className="mt-4 p-6 bg-white border border-gray-200 rounded-lg space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Buyer Personas
              </h3>
              <div className="space-y-4">
                {content.targetAudienceIntel.buyerPersonas.map(
                  (persona, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <h4 className="font-medium text-gray-900 mb-2">
                        {persona.role}
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">
                            Pain Points:
                          </p>
                          <p className="text-sm text-gray-700">
                            {persona.painPoints.join(', ')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">
                            Motivations:
                          </p>
                          <p className="text-sm text-gray-700">
                            {persona.motivations.join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Buying Process
                </h3>
                <p className="text-gray-700">
                  {content.targetAudienceIntel.buyingProcess}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Budget Considerations
                </h3>
                <p className="text-gray-700">
                  {content.targetAudienceIntel.budgetConsiderations}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Implementation & Next Steps */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('implementation')}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Implementation & Next Steps
            </h2>
          </div>
          {expandedSections.implementation ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>

        {expandedSections.implementation && (
          <div className="mt-4 p-6 bg-white border border-gray-200 rounded-lg">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Qualification Criteria
                </h3>
                <ul className="space-y-1 mb-4">
                  {content.implementationGuide.qualificationCriteria.map(
                    (criteria, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{criteria}</span>
                      </li>
                    )
                  )}
                </ul>

                <h3 className="font-semibold text-gray-900 mb-3">
                  Proposal Guidelines
                </h3>
                <ul className="space-y-1">
                  {content.implementationGuide.proposalGuidelines.map(
                    (guideline, index) => (
                      <li key={index} className="text-gray-700">
                        • {guideline}
                      </li>
                    )
                  )}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Follow-up Process
                </h3>
                <ul className="space-y-1 mb-4">
                  {content.implementationGuide.followUpProcess.map(
                    (step, index) => (
                      <li key={index} className="text-gray-700">
                        • {step}
                      </li>
                    )
                  )}
                </ul>

                <h3 className="font-semibold text-gray-900 mb-3">
                  Success Metrics
                </h3>
                <ul className="space-y-1">
                  {content.implementationGuide.successMetrics.map(
                    (metric, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Award className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{metric}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Raw Markdown View */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Raw Markdown Content
        </h3>
        <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
          <MarkdownRenderer content={compiledPage.rawMarkdown} />
        </div>
      </div>
    </div>
  );
};

export default CompiledMarketingView;
