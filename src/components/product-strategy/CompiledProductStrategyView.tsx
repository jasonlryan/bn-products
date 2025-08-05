import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Target,
  Users,
  Briefcase,
  TrendingUp,
  MapPin,
  Settings,
  Award,
  CheckCircle,
} from 'lucide-react';
import MarkdownRenderer from '../MarkdownRenderer';
import type { CompiledProductStrategy } from '../../services/productStrategyCompiler';

interface CompiledProductStrategyViewProps {
  compiledStrategy: CompiledProductStrategy;
  className?: string;
}

const CompiledProductStrategyView: React.FC<
  CompiledProductStrategyViewProps
> = ({ compiledStrategy, className = '' }) => {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    executiveSummary: true,
    productDefinition: false,
    userExperience: false,
    businessModel: false,
    developmentRoadmap: false,
    goToMarket: false,
    implementation: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const { content } = compiledStrategy;

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 mb-8 border border-purple-100">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-6 h-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Strategic Product Roadmap & Business Strategy
          </h1>
        </div>
        <p className="text-gray-600">
          Comprehensive strategic framework for product development, business
          planning, and market success.
        </p>
        <div className="mt-4 text-sm text-gray-500">
          Compiled on {compiledStrategy.compiledAt.toLocaleDateString()} •
          Product ID: {compiledStrategy.productId}
        </div>
      </div>

      {/* Executive Strategy Summary */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('executiveSummary')}
          className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
        >
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Executive Strategy Summary
            </h2>
          </div>
          {expandedSections.executiveSummary ? (
            <ChevronUp className="w-5 h-5 text-purple-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-purple-600" />
          )}
        </button>

        {expandedSections.executiveSummary && (
          <div className="mt-4 bg-white border border-purple-200 rounded-lg p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-purple-900 mb-3">
                  Product Vision
                </h3>
                <p className="text-gray-700 mb-4">
                  {content.executiveStrategySummary.productVision}
                </p>

                <h3 className="font-semibold text-purple-900 mb-3">
                  Product Mission
                </h3>
                <p className="text-gray-700 mb-4">
                  {content.executiveStrategySummary.productMission}
                </p>

                <h3 className="font-semibold text-purple-900 mb-3">
                  Market Positioning
                </h3>
                <p className="text-gray-700">
                  {content.executiveStrategySummary.marketPositioning}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-purple-900 mb-3">
                  Strategic Objectives
                </h3>
                <ul className="space-y-2 mb-4">
                  {content.executiveStrategySummary.strategicObjectives.map(
                    (objective, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{objective}</span>
                      </li>
                    )
                  )}
                </ul>

                <h3 className="font-semibold text-purple-900 mb-3">
                  Success Metrics
                </h3>
                <ul className="space-y-2">
                  {content.executiveStrategySummary.successMetrics.map(
                    (metric, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Award className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
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

      {/* Product Definition & Positioning */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('productDefinition')}
          className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
        >
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Product Definition & Positioning
            </h2>
          </div>
          {expandedSections.productDefinition ? (
            <ChevronUp className="w-5 h-5 text-blue-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-blue-600" />
          )}
        </button>

        {expandedSections.productDefinition && (
          <div className="mt-4 bg-white border border-blue-200 rounded-lg p-6">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-blue-900 mb-3">
                  Problem-Solution Fit
                </h3>
                <MarkdownRenderer
                  content={
                    content.productDefinitionPositioning.problemSolutionFit
                  }
                />
              </div>

              <div>
                <h3 className="font-semibold text-blue-900 mb-3">
                  Unique Value Proposition
                </h3>
                <p className="text-gray-700">
                  {content.productDefinitionPositioning.uniqueValueProposition}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-blue-900 mb-3">
                  Magic Moment
                </h3>
                <p className="text-gray-700 italic bg-blue-50 p-4 rounded-lg">
                  {content.productDefinitionPositioning.magicMomentArticulation}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-blue-900 mb-3">
                  Competitive Differentiation
                </h3>
                <ul className="space-y-2">
                  {content.productDefinitionPositioning.competitiveDifferentiation.map(
                    (diff, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{diff}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Experience Strategy */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('userExperience')}
          className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
        >
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              User Experience Strategy
            </h2>
          </div>
          {expandedSections.userExperience ? (
            <ChevronUp className="w-5 h-5 text-green-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-green-600" />
          )}
        </button>

        {expandedSections.userExperience && (
          <div className="mt-4 bg-white border border-green-200 rounded-lg p-6">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-green-900 mb-4">
                  User Persona Segmentation
                </h3>
                <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-4">
                  {content.userExperienceStrategy.userPersonaSegmentation.map(
                    (persona, index) => (
                      <div
                        key={index}
                        className="bg-green-50 p-4 rounded-lg border border-green-200"
                      >
                        <h4 className="font-medium text-green-900 mb-2">
                          {persona.persona}
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Needs:</span>{' '}
                            {persona.needs.join(', ')}
                          </div>
                          <div>
                            <span className="font-medium">Pain Points:</span>{' '}
                            {persona.painPoints.join(', ')}
                          </div>
                          <div>
                            <span className="font-medium">Goals:</span>{' '}
                            {persona.goals.join(', ')}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-green-900 mb-3">
                  User Journey Mapping
                </h3>
                <p className="text-gray-700 bg-green-50 p-4 rounded-lg">
                  {content.userExperienceStrategy.userJourneyMapping}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-green-900 mb-3">
                  Experience Prioritization
                </h3>
                <div className="space-y-3">
                  {content.userExperienceStrategy.experiencePrioritization.map(
                    (exp, index) => (
                      <div key={index} className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-green-900">
                            {exp.experience}
                          </h4>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              exp.priority === 'High'
                                ? 'bg-red-100 text-red-800'
                                : exp.priority === 'Medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {exp.priority} Priority
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">{exp.rationale}</p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Business Model Framework */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('businessModel')}
          className="w-full flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors border border-orange-200"
        >
          <div className="flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Business Model Framework
            </h2>
          </div>
          {expandedSections.businessModel ? (
            <ChevronUp className="w-5 h-5 text-orange-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-orange-600" />
          )}
        </button>

        {expandedSections.businessModel && (
          <div className="mt-4 bg-white border border-orange-200 rounded-lg p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-orange-900 mb-3">
                  Revenue Strategy
                </h3>
                <p className="text-gray-700 mb-4">
                  {content.businessModelFramework.revenueStrategy}
                </p>

                <h3 className="font-semibold text-orange-900 mb-3">
                  Pricing Rationale
                </h3>
                <p className="text-gray-700 mb-4">
                  {content.businessModelFramework.pricingRationale}
                </p>

                <h3 className="font-semibold text-orange-900 mb-3">
                  Business Case
                </h3>
                <p className="text-gray-700">
                  {content.businessModelFramework.businessCase}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-orange-900 mb-3">
                  Market Entry Approach
                </h3>
                <p className="text-gray-700 mb-4">
                  {content.businessModelFramework.marketEntryApproach}
                </p>

                <h3 className="font-semibold text-orange-900 mb-3">
                  Scaling Strategy
                </h3>
                <p className="text-gray-700 mb-4">
                  {content.businessModelFramework.scalingStrategy}
                </p>

                <h3 className="font-semibold text-orange-900 mb-3">
                  Risk Assessment
                </h3>
                <ul className="space-y-1">
                  {content.businessModelFramework.riskAssessment.map(
                    (risk, index) => (
                      <li key={index} className="text-gray-700 text-sm">
                        • {risk}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Development Roadmap */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('developmentRoadmap')}
          className="w-full flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Product Development Roadmap
            </h2>
          </div>
          {expandedSections.developmentRoadmap ? (
            <ChevronUp className="w-5 h-5 text-indigo-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-indigo-600" />
          )}
        </button>

        {expandedSections.developmentRoadmap && (
          <div className="mt-4 bg-white border border-indigo-200 rounded-lg p-6">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-indigo-900 mb-4">
                  Feature Prioritization
                </h3>
                <div className="space-y-3">
                  {content.productDevelopmentRoadmap.featurePrioritization.map(
                    (feature, index) => (
                      <div key={index} className="bg-indigo-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-indigo-900">
                            {feature.feature}
                          </h4>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              feature.priority === 'High'
                                ? 'bg-red-100 text-red-800'
                                : feature.priority === 'Medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {feature.priority} Priority
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm mb-2">
                          {feature.rationale}
                        </p>
                        {feature.dependencies.length > 0 && (
                          <p className="text-gray-600 text-xs">
                            Dependencies: {feature.dependencies.join(', ')}
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-indigo-900 mb-4">
                  Development Phases
                </h3>
                <div className="space-y-4">
                  {content.productDevelopmentRoadmap.developmentPhases.map(
                    (phase, index) => (
                      <div key={index} className="bg-indigo-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-indigo-900">
                            {phase.phase}
                          </h4>
                          <span className="text-indigo-700 text-sm font-medium">
                            {phase.timeline}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm mb-2">
                          {phase.milestone}
                        </p>
                        <p className="text-gray-600 text-xs">
                          Deliverables: {phase.deliverables.join(', ')}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-indigo-900 mb-3">
                  Technical Architecture
                </h3>
                <p className="text-gray-700 bg-indigo-50 p-4 rounded-lg">
                  {content.productDevelopmentRoadmap.technicalArchitecture}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Go-to-Market Strategy */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('goToMarket')}
          className="w-full flex items-center justify-between p-4 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors border border-pink-200"
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-pink-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Go-to-Market Strategy
            </h2>
          </div>
          {expandedSections.goToMarket ? (
            <ChevronUp className="w-5 h-5 text-pink-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-pink-600" />
          )}
        </button>

        {expandedSections.goToMarket && (
          <div className="mt-4 bg-white border border-pink-200 rounded-lg p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-pink-900 mb-3">
                  Launch Strategy
                </h3>
                <p className="text-gray-700 mb-4">
                  {content.goToMarketStrategy.launchStrategy}
                </p>

                <h3 className="font-semibold text-pink-900 mb-3">
                  Distribution Strategy
                </h3>
                <p className="text-gray-700 mb-4">
                  {content.goToMarketStrategy.distributionStrategy}
                </p>

                <h3 className="font-semibold text-pink-900 mb-3">
                  Marketing Approach
                </h3>
                <p className="text-gray-700">
                  {content.goToMarketStrategy.marketingApproach}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-pink-900 mb-3">
                  Rollout Phases
                </h3>
                <ul className="space-y-2 mb-4">
                  {content.goToMarketStrategy.rolloutPhases.map(
                    (phase, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-pink-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{phase}</span>
                      </li>
                    )
                  )}
                </ul>

                <h3 className="font-semibold text-pink-900 mb-3">
                  Success Measurement
                </h3>
                <ul className="space-y-2">
                  {content.goToMarketStrategy.successMeasurement.map(
                    (metric, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Award className="w-4 h-4 text-pink-500 mt-0.5 flex-shrink-0" />
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

      {/* Strategic Implementation Guide */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('implementation')}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Strategic Implementation Guide
            </h2>
          </div>
          {expandedSections.implementation ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {expandedSections.implementation && (
          <div className="mt-4 bg-white border border-gray-200 rounded-lg p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Resource Requirements
                </h3>
                <ul className="space-y-1 mb-4">
                  {content.strategicImplementationGuide.resourceRequirements.map(
                    (req, index) => (
                      <li key={index} className="text-gray-700">
                        • {req}
                      </li>
                    )
                  )}
                </ul>

                <h3 className="font-semibold text-gray-900 mb-3">
                  Team Structure
                </h3>
                <p className="text-gray-700">
                  {content.strategicImplementationGuide.teamStructure}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Key Decision Points
                </h3>
                <ul className="space-y-1 mb-4">
                  {content.strategicImplementationGuide.keyDecisionPoints.map(
                    (point, index) => (
                      <li key={index} className="text-gray-700">
                        • {point}
                      </li>
                    )
                  )}
                </ul>

                <h3 className="font-semibold text-gray-900 mb-3">
                  Continuous Improvement
                </h3>
                <p className="text-gray-700">
                  {content.strategicImplementationGuide.continuousImprovement}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Raw Markdown View */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Raw Strategy Document
        </h3>
        <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
          <MarkdownRenderer content={compiledStrategy.rawMarkdown} />
        </div>
      </div>
    </div>
  );
};

export default CompiledProductStrategyView;
