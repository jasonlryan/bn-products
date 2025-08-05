import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Target,
  Users,
  BarChart3,
  Eye,
  Lightbulb,
  Database,
} from 'lucide-react';
import type { CompiledMarketIntelligence } from '../../services/marketIntelligenceCompiler';

interface CompiledMarketIntelligenceViewProps {
  compiledPage: CompiledMarketIntelligence;
  className?: string;
}

const CompiledMarketIntelligenceView: React.FC<
  CompiledMarketIntelligenceViewProps
> = ({ compiledPage, className = '' }) => {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    marketOverview: true,
    competitiveLandscape: false,
    customerIntelligence: false,
    marketSegmentation: false,
    industryTrends: false,
    opportunityAnalysis: false,
    strategicRecommendations: false,
    intelligenceSources: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const { content } = compiledPage;

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8 border border-blue-100">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Strategic Market Intelligence Dashboard
          </h1>
        </div>
        <p className="text-gray-600">
          Comprehensive market analysis and competitive intelligence hub for
          strategic planning, business development, and market positioning
          decisions.
        </p>
        <div className="mt-4 text-sm text-gray-500">
          Compiled on {compiledPage.compiledAt.toLocaleDateString()} • Product
          ID: {compiledPage.productId}
        </div>
      </div>

      {/* Market Overview & Executive Summary */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('marketOverview')}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Market Overview & Executive Summary
            </h2>
          </div>
          {expandedSections.marketOverview ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>

        {expandedSections.marketOverview && (
          <div className="mt-4 p-6 bg-white border border-gray-200 rounded-lg">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Market Definition
                </h3>
                <p className="text-gray-700 mb-4">
                  {content.marketOverview.marketDefinition}
                </p>

                <h3 className="font-semibold text-gray-900 mb-2">
                  Market Size & Growth
                </h3>
                <p className="text-gray-700">
                  {content.marketOverview.marketSize}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Key Market Drivers
                </h3>
                <p className="text-gray-700 mb-4">
                  {content.marketOverview.keyDrivers}
                </p>

                <h3 className="font-semibold text-gray-900 mb-2">
                  Critical Success Factors
                </h3>
                <p className="text-gray-700">
                  {content.marketOverview.successFactors}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Competitive Landscape */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('competitiveLandscape')}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Competitive Landscape
            </h2>
          </div>
          {expandedSections.competitiveLandscape ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>

        {expandedSections.competitiveLandscape && (
          <div className="mt-4 p-6 bg-white border border-gray-200 rounded-lg space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Market Map</h3>
              <p className="text-gray-700 mb-4">
                {content.competitiveLandscape.marketMap}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Key Players</h3>
              <div className="grid gap-4">
                {content.competitiveLandscape.keyPlayers.map(
                  (player, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">
                          {player.name}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            player.tier === 'Leader'
                              ? 'bg-green-100 text-green-800'
                              : player.tier === 'Challenger'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {player.tier}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-1">
                        {player.positioning}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {player.marketShare}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Competitive Gaps
                </h3>
                <ul className="text-gray-700 text-sm space-y-1">
                  {content.competitiveLandscape.competitiveGaps.map(
                    (gap, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {gap}
                      </li>
                    )
                  )}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Threat Assessment
                </h3>
                <p className="text-gray-700 text-sm">
                  {content.competitiveLandscape.threatAssessment}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Customer Intelligence */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('customerIntelligence')}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Customer Intelligence
            </h2>
          </div>
          {expandedSections.customerIntelligence ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>

        {expandedSections.customerIntelligence && (
          <div className="mt-4 p-6 bg-white border border-gray-200 rounded-lg space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">
                Buyer Personas
              </h3>
              <div className="grid gap-4">
                {content.customerIntelligence.buyerPersonas.map(
                  (persona, index) => (
                    <div
                      key={index}
                      className="bg-purple-50 rounded-lg p-4 border border-purple-200"
                    >
                      <h4 className="font-medium text-purple-900 mb-2">
                        Persona {index + 1}
                      </h4>
                      <p className="text-gray-700 mb-3">{persona.profile}</p>

                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <h5 className="font-medium text-purple-800 mb-1">
                            Pain Points
                          </h5>
                          <ul className="text-gray-600 space-y-1">
                            {persona.painPoints.map((point, i) => (
                              <li key={i} className="flex items-start">
                                <span className="text-red-500 mr-1">•</span>
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-purple-800 mb-1">
                            Motivations
                          </h5>
                          <ul className="text-gray-600 space-y-1">
                            {persona.motivations.map((motivation, i) => (
                              <li key={i} className="flex items-start">
                                <span className="text-green-500 mr-1">•</span>
                                {motivation}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-purple-800 mb-1">
                            Buying Criteria
                          </h5>
                          <ul className="text-gray-600 space-y-1">
                            {persona.buyingCriteria.map((criteria, i) => (
                              <li key={i} className="flex items-start">
                                <span className="text-blue-500 mr-1">•</span>
                                {criteria}
                              </li>
                            ))}
                          </ul>
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
                  Customer Journey
                </h3>
                <p className="text-gray-700">
                  {content.customerIntelligence.customerJourney}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Budget & Procurement
                </h3>
                <p className="text-gray-700">
                  {content.customerIntelligence.budgetProcurement}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Market Segmentation */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('marketSegmentation')}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Market Segmentation
            </h2>
          </div>
          {expandedSections.marketSegmentation ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>

        {expandedSections.marketSegmentation && (
          <div className="mt-4 p-6 bg-white border border-gray-200 rounded-lg space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">
                Market Segments
              </h3>
              <div className="grid gap-4">
                {content.marketSegmentation.segments.map((segment, index) => (
                  <div
                    key={index}
                    className="bg-green-50 rounded-lg p-4 border border-green-200"
                  >
                    <h4 className="font-medium text-green-900 mb-2">
                      {segment.name}
                    </h4>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h5 className="font-medium text-green-800 mb-1">
                          Size & Attractiveness
                        </h5>
                        <p className="text-gray-700 mb-2">{segment.size}</p>
                        <p className="text-gray-600">
                          {segment.attractiveness}
                        </p>
                      </div>
                      <div>
                        <h5 className="font-medium text-green-800 mb-1">
                          Approach
                        </h5>
                        <p className="text-gray-700 mb-2">{segment.approach}</p>

                        <h5 className="font-medium text-green-800 mb-1">
                          Key Needs
                        </h5>
                        <ul className="text-gray-600 space-y-1">
                          {segment.needs.map((need, i) => (
                            <li key={i} className="flex items-start">
                              <span className="text-green-500 mr-1">•</span>
                              {need}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Pricing Sensitivity
              </h3>
              <p className="text-gray-700">
                {content.marketSegmentation.pricingSensitivity}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Industry Trends & Disruptions */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('industryTrends')}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Industry Trends & Disruptions
            </h2>
          </div>
          {expandedSections.industryTrends ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>

        {expandedSections.industryTrends && (
          <div className="mt-4 p-6 bg-white border border-gray-200 rounded-lg">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Technology Trends
                  </h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    {content.industryTrends.technologyTrends.map(
                      (trend, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          {trend}
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Economic Factors
                  </h3>
                  <p className="text-gray-700 text-sm">
                    {content.industryTrends.economicFactors}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Regulatory Environment
                  </h3>
                  <p className="text-gray-700 text-sm">
                    {content.industryTrends.regulatoryEnvironment}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Disruption Risks
                  </h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    {content.industryTrends.disruptionRisks.map(
                      (risk, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          {risk}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Opportunity Analysis */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('opportunityAnalysis')}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Opportunity Analysis
            </h2>
          </div>
          {expandedSections.opportunityAnalysis ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>

        {expandedSections.opportunityAnalysis && (
          <div className="mt-4 p-6 bg-white border border-gray-200 rounded-lg">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Market Gaps
                  </h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    {content.opportunityAnalysis.marketGaps.map(
                      (gap, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-yellow-500 mr-2">•</span>
                          {gap}
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Partnership Opportunities
                  </h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    {content.opportunityAnalysis.partnerships.map(
                      (partnership, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          {partnership}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Emerging Opportunities
                  </h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    {content.opportunityAnalysis.emergingOpportunities.map(
                      (opportunity, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          {opportunity}
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Expansion Opportunities
                  </h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    {content.opportunityAnalysis.expansion.map(
                      (expansion, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-purple-500 mr-2">•</span>
                          {expansion}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Strategic Recommendations */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('strategicRecommendations')}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Strategic Recommendations
            </h2>
          </div>
          {expandedSections.strategicRecommendations ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>

        {expandedSections.strategicRecommendations && (
          <div className="mt-4 p-6 bg-white border border-gray-200 rounded-lg">
            <div className="grid gap-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Entry Strategy
                  </h3>
                  <p className="text-gray-700 text-sm mb-4">
                    {content.strategicRecommendations.entryStrategy}
                  </p>

                  <h3 className="font-semibold text-gray-900 mb-2">
                    Positioning Strategy
                  </h3>
                  <p className="text-gray-700 text-sm">
                    {content.strategicRecommendations.positioning}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Investment Priorities
                  </h3>
                  <ul className="text-gray-700 text-sm space-y-1 mb-4">
                    {content.strategicRecommendations.investments.map(
                      (investment, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-indigo-500 mr-2">•</span>
                          {investment}
                        </li>
                      )
                    )}
                  </ul>

                  <h3 className="font-semibold text-gray-900 mb-2">
                    Success Metrics
                  </h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    {content.strategicRecommendations.successMetrics.map(
                      (metric, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          {metric}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Risk Mitigation
                </h3>
                <ul className="text-gray-700 text-sm space-y-1">
                  {content.strategicRecommendations.riskMitigation.map(
                    (risk, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-orange-500 mr-2">•</span>
                        {risk}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Intelligence Sources & Updates */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('intelligenceSources')}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Intelligence Sources & Updates
            </h2>
          </div>
          {expandedSections.intelligenceSources ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>

        {expandedSections.intelligenceSources && (
          <div className="mt-4 p-6 bg-white border border-gray-200 rounded-lg">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Data Sources
                  </h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    {content.intelligenceSources.dataSources.map(
                      (source, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-gray-500 mr-2">•</span>
                          {source}
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Update Schedule
                  </h3>
                  <p className="text-gray-700 text-sm">
                    {content.intelligenceSources.updateSchedule}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Key Indicators
                  </h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    {content.intelligenceSources.keyIndicators.map(
                      (indicator, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          {indicator}
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Intelligence Gaps
                  </h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    {content.intelligenceSources.gaps.map((gap, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompiledMarketIntelligenceView;
