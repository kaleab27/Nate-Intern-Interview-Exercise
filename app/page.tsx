"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  TrendingUp,
  Clock,
} from "lucide-react";
import { generateStrategicAnalysis } from "./generateStrategicAnalysis";

interface Story {
  id: string;
  title: string;
  category: string;
  scores: {
    impact: number;
    timing: number;
    players: number;
    precedent: number;
  };
  takeaway: string;
  breakdown: {
    what: string;
    whyItMatters: string;
    timing: string;
    implications: string;
    connected: string[];
  };
  source: string;
  timestamp: string;
  compositeScore: number;
}

const StrategicAIDashboard = () => {
  const [viewMode, setViewMode] = useState<"ranked" | "timeline">("ranked");
  const [strategicStory, setStrategicStory] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchAndAnalyze = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/openai");
        const stories = await res.json();

        console.log("raw stories: ", stories);

        const enriched = await Promise.all(
          stories.map(
            async (story: {
              title: string;
              summary: string;
              source: string;
              pubDate?: string;
            }) => {
              const analysis = await generateStrategicAnalysis({
                title: story.title,
                summary: story.summary,
              });
              return {
                ...analysis,
                source: story.source,
                timestamp: story.pubDate,
                id: Date.now(),
              };
            }
          )
        );

        setStrategicStory(enriched);
        setLoading(false);
        console.log("enriched stories: ", enriched);
      } catch (err) {
        setLoading(false);
        console.error(err);
      }
    };

    fetchAndAnalyze();
  }, []);

  const timelineStories = strategicStory;

  const mockStories = strategicStory;

  const [expandedStory, setExpandedStory] = useState<string | null>(null);

  const toggleExpanded = (storyId: string) => {
    setExpandedStory(expandedStory === storyId ? null : storyId);
  };

  const ScoreIndicator = ({
    score,
    label,
  }: {
    score: number;
    label: string;
  }) => {
    const getColor = (score: number) => {
      if (score >= 4.5) return "bg-red-500";
      if (score >= 3.5) return "bg-yellow-500";
      return "bg-green-500";
    };

    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-gray-400 w-16">
          {label.toUpperCase()}
        </span>
        <div className="flex gap-1">
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 ${
                i <= score ? getColor(score) : "bg-gray-700"
              }`}
            />
          ))}
        </div>
        <span className="text-xs font-mono text-gray-300">{score}</span>
      </div>
    );
  };

  const CategoryBadge = ({ category }: { category: string }) => {
    const getVariant = (category: string) => {
      switch (category.toLowerCase()) {
        case "competitive positioning":
          return "bg-red-900 text-red-100";
        case "regulatory/policy changes":
          return "bg-blue-900 text-blue-100";
        case "research breakthroughs":
          return "bg-purple-900 text-purple-100";
        case "model releases & benchmarks":
          return "bg-green-900 text-green-100";
        case "major funding/acquisitions":
          return "bg-yellow-900 text-yellow-100";
        default:
          return "bg-gray-900 text-gray-100";
      }
    };

    return (
      <Badge className={`font-mono text-xs ${getVariant(category)}`}>
        {category.toUpperCase()}
      </Badge>
    );
  };

  const StrategicImportanceIndicator = ({ score }: { score: number }) => {
    if (score >= 0.8) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-red-400 text-lg">🔴</span>
          <span className="text-red-400 font-bold text-sm">
            HIGH STRATEGIC IMPORTANCE
          </span>
        </div>
      );
    }
    if (score >= 0.6) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-lg">🟡</span>
          <span className="text-yellow-400 font-bold text-sm">
            MODERATE STRATEGIC IMPORTANCE
          </span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-lg">⚪</span>
        <span className="text-gray-400 font-bold text-sm">
          LOW STRATEGIC IMPORTANCE
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-green-400">
                AI STRATEGIC INTELLIGENCE
              </h1>
              <p className="text-sm text-gray-400">
                Real-time analysis of strategic AI developments
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">LAST UPDATE</div>
              <div className="text-green-400">25 DEC 2024 21:36:53 UTC</div>
            </div>
          </div>
          {/* <div className="flex items-center gap-2 mt-4">
            <Button
              variant={viewMode === "ranked" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("ranked")}
              className="font-mono text-xs"
            >
              RANKED VIEW
            </Button>
            <Button
              variant={viewMode === "timeline" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("timeline")}
              className="font-mono text-xs"
            >
              TIMELINE VIEW
            </Button>
          </div> */}
        </div>
      </div>
      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mr-4"></div>
          <span className="text-green-400 text-lg font-mono">
            Loading stories...
          </span>
        </div>
      )}
      {/* Main Content */}
      {!loading && (
        <>
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-green-400 mb-2">
                TOP 5 STRATEGIC DEVELOPMENTS
              </h2>
              <p className="text-sm text-gray-400">
                Ranked by composite strategic importance score
              </p>
            </div>

            {
              viewMode === "ranked" ? (
                <div className="space-y-4">
                  {mockStories.map((story, index) => (
                    <Card
                      key={story.id}
                      className="bg-gray-950 border-gray-800 hover:border-gray-700 transition-colors"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl font-bold text-red-400">
                                #{index + 1}
                              </span>
                              <CategoryBadge category={story.category} />
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Clock className="w-3 h-3" />
                                {story.timestamp}
                              </div>
                            </div>
                            <h3 className="text-lg font-bold text-green-400 mb-3">
                              {story.title}
                            </h3>

                            {/* Strategic Importance Level */}
                            <div className="mb-3">
                              <StrategicImportanceIndicator
                                score={story.compositeScore}
                              />
                            </div>

                            {/* Strategic Takeaway - Always Visible */}
                            <div className="mb-4">
                              <p className="text-sm text-gray-300 leading-relaxed">
                                {story.takeaway}
                              </p>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-red-400" />
                                <span className="text-sm font-bold text-red-400">
                                  COMPOSITE: {story.compositeScore.toFixed(2)}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleExpanded(story.id)}
                                className="text-gray-400 hover:text-green-400 p-0 h-auto font-mono"
                              >
                                {expandedStory === story.id ? (
                                  <>
                                    COLLAPSE{" "}
                                    <ChevronUp className="w-4 h-4 ml-1" />
                                  </>
                                ) : (
                                  <>
                                    EXPAND{" "}
                                    <ChevronDown className="w-4 h-4 ml-1" />
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      {expandedStory === story.id && (
                        <CardContent className="pt-0">
                          <div className="border-t border-gray-800 pt-4 space-y-4">
                            {/* Structured Breakdown */}
                            <div className="space-y-3">
                              <div>
                                <span className="text-green-400 font-bold text-sm">
                                  WHAT:{" "}
                                </span>
                                <span className="text-gray-300 text-sm">
                                  {story.breakdown.what}
                                </span>
                              </div>
                              <div>
                                <span className="text-green-400 font-bold text-sm">
                                  WHY IT MATTERS:{" "}
                                </span>
                                <span className="text-gray-300 text-sm">
                                  {story.breakdown.whyItMatters}
                                </span>
                              </div>
                              <div>
                                <span className="text-green-400 font-bold text-sm">
                                  TIMING:{" "}
                                </span>
                                <span className="text-gray-300 text-sm">
                                  {story.breakdown.timing}
                                </span>
                              </div>
                              <div>
                                <span className="text-green-400 font-bold text-sm">
                                  IMPLICATIONS:{" "}
                                </span>
                                <span className="text-gray-300 text-sm">
                                  {story.breakdown.implications}
                                </span>
                              </div>
                              <div>
                                <span className="text-green-400 font-bold text-sm">
                                  CONNECTED:{" "}
                                </span>
                                <div className="mt-1">
                                  {story.breakdown.connected.map(
                                    (connection, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center gap-2 text-sm text-gray-300 ml-4"
                                      >
                                        <div className="w-1 h-1 bg-yellow-500 rounded-full" />
                                        See also "{connection}"
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Score Breakdown */}
                            <div className="pt-4 border-t border-gray-800">
                              <h4 className="text-sm font-bold text-green-400 mb-3">
                                SCORE BREAKDOWN
                              </h4>
                              <div className="grid grid-cols-2 gap-3">
                                <ScoreIndicator
                                  score={story.scores.impact}
                                  label="Impact"
                                />
                                <ScoreIndicator
                                  score={story.scores.timing}
                                  label="Timing"
                                />
                                <ScoreIndicator
                                  score={story.scores.players}
                                  label="Players"
                                />
                                <ScoreIndicator
                                  score={story.scores.precedent}
                                  label="Precedent"
                                />
                              </div>
                            </div>

                            {/* Source Link */}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                              <a
                                href={story.source}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                                VIEW SOURCE
                              </a>
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              ) : // <TimelineView
              //   stories={timelineStories}
              //   expandedStory={expandedStory}
              //   toggleExpanded={toggleExpanded}
              // />
              null // Timeline view is commented out for now
            }

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-800 text-center">
              <p className="text-xs text-gray-500">
                Strategic AI Intelligence Dashboard • Powered by LLM Analysis
                Engine
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StrategicAIDashboard;
