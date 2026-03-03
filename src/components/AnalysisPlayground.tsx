import { useState, useEffect } from "react";
import { cadenceApi } from "@/lib/cadenceApi";
import {
  useStreamingAnalysis,
  type StreamStatus,
} from "@/lib/useStreamingAnalysis";
import type { SSEDetectionEvent } from "@/lib/cadenceApi";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitBranch,
  Globe,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronRight,
  WifiOff,
  Zap,
  Clock,
  Users,
  FileText,
  Type,
  RotateCcw,
  Radio,
  XCircle,
  Shield,
  Activity,
  Eye,
} from "lucide-react";

type AnalysisType = "repository" | "website" | null;

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

function getScoreColor(score: number) {
  if (score >= 70) return "text-red-400";
  if (score >= 40) return "text-amber-400";
  return "text-emerald-400";
}

function getScoreBgColor(score: number) {
  if (score >= 70) return "bg-red-400";
  if (score >= 40) return "bg-amber-400";
  return "bg-emerald-400";
}

function getSeverityColor(severity: string | number) {
  if (typeof severity === "number") {
    if (severity >= 0.7) return "text-red-400 bg-red-400/10 border-red-400/20";
    if (severity >= 0.4)
      return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    return "text-blue-400 bg-blue-400/10 border-blue-400/20";
  }
  switch (severity) {
    case "high":
      return "text-red-400 bg-red-400/10 border-red-400/20";
    case "medium":
      return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    case "low":
      return "text-blue-400 bg-blue-400/10 border-blue-400/20";
    default:
      return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
  }
}

function statusLabel(status: StreamStatus): string {
  switch (status) {
    case "idle":
      return "Ready";
    case "connecting":
      return "Connecting...";
    case "streaming":
      return "Live";
    case "complete":
      return "Complete";
    case "error":
      return "Failed";
  }
}

function statusIcon(status: StreamStatus) {
  switch (status) {
    case "idle":
      return null;
    case "connecting":
      return <Loader2 className="w-4 h-4 animate-spin text-amber-400" />;
    case "streaming":
      return <Radio className="w-4 h-4 text-sky-400 animate-pulse" />;
    case "complete":
      return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    case "error":
      return <XCircle className="w-4 h-4 text-red-400" />;
  }
}

function statusColor(status: StreamStatus): string {
  switch (status) {
    case "connecting":
      return "text-amber-400";
    case "streaming":
      return "text-sky-400";
    case "complete":
      return "text-emerald-400";
    case "error":
      return "text-red-400";
    default:
      return "text-white/50";
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AnalysisPlayground() {
  const [analysisType, setAnalysisType] = useState<AnalysisType>(null);
  const [repoUrl, setRepoUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [branch, setBranch] = useState("");
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  const apiUrl =
    typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : import.meta.env.VITE_CADENCE_API_URL || "https://api.noslop.tech";

  const [stream, { startAnalysis, cancel, reset: resetStream }] =
    useStreamingAnalysis(apiUrl);

  const isActive =
    stream.status === "connecting" || stream.status === "streaming";
  const showResults =
    stream.status !== "idle" || stream.detections.length > 0 || stream.result;

  // Health check on mount
  useEffect(() => {
    cadenceApi.setBaseUrl(apiUrl);
    cadenceApi.healthCheck().then(setApiOnline);
  }, [apiUrl]);

  // ---- Form handlers ---- //
  const handleAnalyzeRepository = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;
    startAnalysis("repository", repoUrl.trim(), branch || undefined);
  };

  const handleAnalyzeWebsite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!websiteUrl.trim()) return;
    startAnalysis("website", websiteUrl.trim());
  };

  const handleReset = () => {
    resetStream();
    setAnalysisType(null);
    setRepoUrl("");
    setWebsiteUrl("");
    setBranch("");
  };

  // ---- Render ---- //
  return (
    <div className="space-y-6">
      {/* API Status Banner */}
      {apiOnline === false && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/30">
              <WifiOff className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-300 mb-1">
                API Unavailable
              </h3>
              <p className="text-sm text-red-200/80 leading-relaxed">
                The Cadence API server at{" "}
                <code className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-mono text-xs">
                  {apiUrl}
                </code>{" "}
                is currently unreachable.{" "}
                {apiUrl.includes("localhost") ? (
                  <>
                    Make sure the Cadence webhook server is running locally on
                    port 8000.
                  </>
                ) : (
                  <>
                    The hosted API may be temporarily offline. Please try again
                    later or run Cadence locally.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Type Selection */}
      {!analysisType && !showResults ? (
        <div className="grid md:grid-cols-2 gap-6">
          <button
            type="button"
            onClick={() => setAnalysisType("repository")}
            className="group text-left rounded-xl bg-white/2 border border-white/5 p-6 hover:bg-white/3 hover:border-white/10 transition-all"
          >
            <div className="inline-flex p-2.5 rounded-lg bg-white/5 border border-white/10 mb-4">
              <GitBranch className="w-5 h-5 text-white/70" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              Analyze Repository
              <ChevronRight className="w-4 h-4 text-white/30 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-sm text-white/50 leading-relaxed">
              Scan a Git repository for suspicious commits that may have been
              generated by AI
            </p>
          </button>

          <button
            type="button"
            onClick={() => setAnalysisType("website")}
            className="group text-left rounded-xl bg-white/2 border border-white/5 p-6 hover:bg-white/3 hover:border-white/10 transition-all"
          >
            <div className="inline-flex p-2.5 rounded-lg bg-white/5 border border-white/10 mb-4">
              <Globe className="w-5 h-5 text-white/70" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              Analyze Website
              <ChevronRight className="w-4 h-4 text-white/30 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-sm text-white/50 leading-relaxed">
              Check a website for AI-generated content and suspicious patterns
            </p>
          </button>
        </div>
      ) : null}

      {/* Repository Form */}
      {analysisType === "repository" && !showResults ? (
        <div className="rounded-xl bg-white/2 border border-white/5 p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
              <GitBranch className="w-5 h-5 text-white/70" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">
                Analyze Repository
              </h3>
              <p className="text-sm text-white/50">
                Enter a Git repository URL to analyze for AI-generated commits
              </p>
            </div>
          </div>
          <form onSubmit={handleAnalyzeRepository} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Repository URL
              </label>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/user/repo"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-colors"
              />
              <p className="text-xs text-white/40 mt-2">
                GitHub, GitLab, or local repository URLs supported
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Branch (Optional)
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-colors"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isActive}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black font-medium hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isActive ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Repository"
                )}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
              >
                Back
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {/* Website Form */}
      {analysisType === "website" && !showResults ? (
        <div className="rounded-xl bg-white/2 border border-white/5 p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
              <Globe className="w-5 h-5 text-white/70" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">
                Analyze Website
              </h3>
              <p className="text-sm text-white/50">
                Enter a website URL to analyze for AI-generated content
              </p>
            </div>
          </div>
          <form onSubmit={handleAnalyzeWebsite} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Website URL
              </label>
              <input
                type="text"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-colors"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isActive}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black font-medium hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isActive ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Website"
                )}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
              >
                Back
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {/* ============================================================= */}
      {/* Live Streaming Results                                        */}
      {/* ============================================================= */}
      {showResults ? (
        <div className="space-y-6">
          {/* ---- Status bar ---- */}
          <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg bg-white/2 border border-white/5">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {statusIcon(stream.status)}
                <span
                  className={`text-sm font-medium ${statusColor(stream.status)}`}
                >
                  {statusLabel(stream.status)}
                </span>
              </div>
              {stream.progress && isActive && (
                <span className="text-xs text-white/40 hidden sm:inline">
                  {stream.progress.message}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isActive && (
                <button
                  type="button"
                  onClick={cancel}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                New Analysis
              </button>
            </div>
          </div>

          {/* ---- Progress bar ---- */}
          {isActive && stream.progress && (
            <StreamingProgressBar
              phase={stream.progress.phase}
              percent={stream.progress.percent ?? 0}
              message={stream.progress.message}
              elapsed={stream.progress.elapsed_ms}
            />
          )}

          {/* ---- Error ---- */}
          {stream.error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-red-500/5 border border-red-500/20 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-300 mb-1">
                  Analysis Failed
                </p>
                <p className="text-sm text-red-200/80">{stream.error}</p>
              </div>
            </motion.div>
          )}

          {/* ---- Live detection feed ---- */}
          {stream.detections.length > 0 && (
            <LiveDetectionFeed
              detections={stream.detections}
              isStreaming={isActive}
            />
          )}

          {/* ---- Final result card (repo) ---- */}
          {stream.status === "complete" &&
            stream.analysisType === "repository" &&
            stream.result?.total_commits !== undefined && (
              <RepositoryReportCard
                result={stream.result}
                targetUrl={stream.targetUrl}
              />
            )}

          {/* ---- Final result card (website) ---- */}
          {stream.status === "complete" &&
            stream.analysisType === "website" &&
            stream.result?.word_count !== undefined && (
              <WebsiteReportCard
                result={stream.result}
                targetUrl={stream.targetUrl}
              />
            )}

          {/* ---- Raw JSON ---- */}
          {stream.result && stream.status === "complete" && (
            <details className="rounded-lg bg-white/2 border border-white/5">
              <summary className="px-4 py-3 text-sm font-medium text-white/50 cursor-pointer hover:text-white/70 transition-colors">
                View Raw Response
              </summary>
              <pre className="px-4 pb-4 text-xs text-white/40 overflow-x-auto">
                {JSON.stringify(stream.result, null, 2)}
              </pre>
            </details>
          )}
        </div>
      ) : null}
    </div>
  );
}

// ===========================================================================
// Sub-components
// ===========================================================================

// ---- Streaming Progress Bar ---- //

function StreamingProgressBar({
  phase,
  percent,
  message,
  elapsed,
}: {
  phase: string;
  percent: number;
  message: string;
  elapsed?: number;
}) {
  const phaseLabel =
    phase
      .replace(/-/g, " ")
      .replace(/_/g, " ")
      .replace(/^\w/, (c) => c.toUpperCase()) || "Initializing";

  return (
    <div className="rounded-xl bg-white/2 border border-white/5 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-400 animate-pulse" />
          <span className="text-sm font-medium text-white/80">
            {phaseLabel}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-white/40">
          {elapsed != null && elapsed > 0 && (
            <span>{(elapsed / 1000).toFixed(1)}s</span>
          )}
          <span className="tabular-nums">{Math.round(percent)}%</span>
        </div>
      </div>

      {/* Progress track */}
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-linear-to-r from-sky-500 to-indigo-500"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percent, 100)}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      <p className="text-xs text-white/40 mt-2 truncate">{message}</p>
    </div>
  );
}

// ---- Live Detection Feed ---- //

function LiveDetectionFeed({
  detections,
  isStreaming,
}: {
  detections: SSEDetectionEvent[];
  isStreaming: boolean;
}) {
  return (
    <div className="rounded-xl bg-white/2 border border-white/5 overflow-hidden">
      <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-white/40" />
          <span className="text-sm font-medium text-white/70">
            Detection Feed
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isStreaming && (
            <span className="flex items-center gap-1.5 text-xs text-sky-400">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              Live
            </span>
          )}
          <span className="text-xs text-white/30 tabular-nums">
            {detections.filter((d) => d.detected).length} flagged /{" "}
            {detections.length} checked
          </span>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
        <AnimatePresence initial={false}>
          {detections.map((det, idx) => (
            <motion.div
              key={`${det.strategy}-${idx}`}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: isStreaming ? 0.05 : 0 }}
              className="px-5 py-3 flex items-start gap-3"
            >
              {/* Indicator dot */}
              <div className="mt-1.5 shrink-0">
                {det.detected ? (
                  <span className="block w-2 h-2 rounded-full bg-red-400" />
                ) : (
                  <span className="block w-2 h-2 rounded-full bg-emerald-400/60" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-sm font-medium text-white/80">
                    {det.strategy.replace(/_/g, " ")}
                  </span>
                  {det.detected && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] border font-semibold uppercase tracking-wider ${getSeverityColor(det.severity)}`}
                    >
                      {det.severity}
                    </span>
                  )}
                  {det.category && (
                    <span className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded">
                      {det.category}
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/50 leading-relaxed line-clamp-2">
                  {det.description}
                </p>
                {det.detected && det.score > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-1 flex-1 max-w-24 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${det.score >= 70 ? "bg-red-400" : det.score >= 40 ? "bg-amber-400" : "bg-sky-400"}`}
                        style={{ width: `${Math.min(det.score, 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-white/40 tabular-nums">
                      {det.score}%
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---- Repository Report Card ---- //

function RepositoryReportCard({
  result,
  targetUrl,
}: {
  result: NonNullable<import("@/lib/cadenceApi").JobResultResponse>;
  targetUrl: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl bg-white/2 border border-white/5 overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-semibold text-white text-lg">
              Repository Analysis
            </h3>
            <p className="text-sm text-white/40 font-mono truncate">
              {result.repo_name || targetUrl}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div
              className={`w-2.5 h-2.5 rounded-full ${getScoreBgColor(result.overall_suspicion || 0)}`}
            />
            <span
              className={`text-3xl font-bold tabular-nums ${getScoreColor(result.overall_suspicion || 0)}`}
            >
              {Math.round(result.overall_suspicion || 0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Assessment */}
        <p className="text-sm text-white/60 leading-relaxed mb-6">
          {(result.overall_suspicion || 0) >= 70
            ? "This repository shows significant signs of AI-generated commits with multiple suspicious patterns detected across the commit history."
            : (result.overall_suspicion || 0) >= 40
              ? "This repository shows some suspicious patterns that may indicate AI-generated commits. Review flagged commits for confirmation."
              : "This repository appears to have natural, human-generated commits with minimal or no suspicious patterns detected."}
        </p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <MetricCard
            icon={<GitBranch className="w-3.5 h-3.5" />}
            label="Commits"
            value={result.total_commits?.toLocaleString() ?? "N/A"}
          />
          <MetricCard
            icon={<Zap className="w-3.5 h-3.5" />}
            label="Velocity"
            value={result.velocity || "N/A"}
          />
          <MetricCard
            icon={<Clock className="w-3.5 h-3.5" />}
            label="Time Span"
            value={result.time_span || "N/A"}
          />
          <MetricCard
            icon={<Users className="w-3.5 h-3.5" />}
            label="Authors"
            value={String(result.unique_authors ?? "N/A")}
          />
        </div>

        {/* Cross-source metrics (if present) */}
        {(result.items_analyzed || result.strategies_used) && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {result.items_analyzed != null && (
              <MetricCard
                icon={<Shield className="w-3.5 h-3.5" />}
                label="Items Analyzed"
                value={result.items_analyzed.toLocaleString()}
              />
            )}
            {result.items_flagged != null && (
              <MetricCard
                icon={<AlertCircle className="w-3.5 h-3.5" />}
                label="Items Flagged"
                value={result.items_flagged.toLocaleString()}
              />
            )}
            {result.average_score != null && (
              <MetricCard
                icon={<Activity className="w-3.5 h-3.5" />}
                label="Avg Score"
                value={`${Math.round(result.average_score)}%`}
              />
            )}
          </div>
        )}

        {/* Detected Patterns */}
        {result.suspicions && result.suspicions.length > 0 && (
          <div>
            <p className="text-xs text-white/30 uppercase tracking-wider font-medium mb-3">
              Detected Patterns
            </p>
            <div className="space-y-0.5">
              {result.suspicions.slice(0, 10).map((suspicion, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-4 py-2.5 border-b border-white/5 last:border-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`px-2 py-0.5 rounded text-xs border font-medium ${getSeverityColor(suspicion.severity)}`}
                    >
                      {suspicion.severity}
                    </span>
                    <span className="text-sm text-white/70 truncate">
                      {suspicion.message}
                    </span>
                  </div>
                  <span className="text-xs text-white/40 font-mono shrink-0">
                    {suspicion.commit_hash?.substring(0, 7)}
                  </span>
                </div>
              ))}
            </div>
            {result.suspicions.length > 10 && (
              <p className="text-xs text-white/40 mt-3 text-center">
                +{result.suspicions.length - 10} more patterns detected
              </p>
            )}
          </div>
        )}

        {(!result.suspicions || result.suspicions.length === 0) && (
          <div className="text-center py-4">
            <CheckCircle className="w-8 h-8 text-emerald-400/50 mx-auto mb-2" />
            <p className="text-sm text-white/50">
              No suspicious patterns detected
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {result.analyzed_at && (
        <div className="px-5 py-3 border-t border-white/5 bg-white/1">
          <p className="text-xs text-white/30">
            Analyzed {new Date(result.analyzed_at).toLocaleString()}
          </p>
        </div>
      )}
    </motion.div>
  );
}

// ---- Website Report Card ---- //

function WebsiteReportCard({
  result,
  targetUrl,
}: {
  result: NonNullable<import("@/lib/cadenceApi").JobResultResponse>;
  targetUrl: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl bg-white/2 border border-white/5 overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-semibold text-white text-lg">
              Website Analysis
            </h3>
            <p className="text-sm text-white/40 font-mono truncate">
              {result.url || targetUrl}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div
              className={`w-2.5 h-2.5 rounded-full ${getScoreBgColor(result.confidence_score || 0)}`}
            />
            <span
              className={`text-3xl font-bold tabular-nums ${getScoreColor(result.confidence_score || 0)}`}
            >
              {Math.round(result.confidence_score || 0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Assessment */}
        <p className="text-sm text-white/60 leading-relaxed mb-6">
          {result.assessment ||
            ((result.confidence_score || 0) >= 70
              ? "This content shows significant signs of AI generation with multiple characteristic patterns detected."
              : (result.confidence_score || 0) >= 40
                ? "This content shows some patterns that may indicate AI-generated text. Manual review recommended."
                : "This content appears to be naturally written with minimal AI-generated patterns detected.")}
        </p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <MetricCard
            icon={<FileText className="w-3.5 h-3.5" />}
            label="Words"
            value={result.word_count?.toLocaleString() ?? "N/A"}
            center
          />
          <MetricCard
            icon={<Type className="w-3.5 h-3.5" />}
            label="Characters"
            value={
              result.character_count
                ? `${(result.character_count / 1000).toFixed(1)}K`
                : "N/A"
            }
            center
          />
          <MetricCard
            icon={<Zap className="w-3.5 h-3.5" />}
            label="Quality"
            value={
              result.quality_score !== undefined
                ? `${Math.round(result.quality_score * 100)}%`
                : "N/A"
            }
            center
          />
        </div>

        {/* Cross-source metrics */}
        {(result.items_analyzed || result.strategies_used) && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {result.items_analyzed != null && (
              <MetricCard
                icon={<Shield className="w-3.5 h-3.5" />}
                label="Items Analyzed"
                value={result.items_analyzed.toLocaleString()}
              />
            )}
            {result.items_flagged != null && (
              <MetricCard
                icon={<AlertCircle className="w-3.5 h-3.5" />}
                label="Items Flagged"
                value={result.items_flagged.toLocaleString()}
              />
            )}
            {result.average_score != null && (
              <MetricCard
                icon={<Activity className="w-3.5 h-3.5" />}
                label="Avg Score"
                value={`${Math.round(result.average_score)}%`}
              />
            )}
          </div>
        )}

        {/* Detected Patterns */}
        {result.web_patterns && result.web_patterns.length > 0 && (
          <div className="mb-6">
            <p className="text-xs text-white/30 uppercase tracking-wider font-medium mb-3">
              Detected Patterns
            </p>
            <div className="space-y-3">
              {result.web_patterns.map((pattern, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-2 py-3 px-3 rounded-lg bg-white/1 border border-white/5"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs border font-medium shrink-0 ${getSeverityColor(pattern.severity)}`}
                    >
                      {pattern.severity >= 0.7
                        ? "high"
                        : pattern.severity >= 0.4
                          ? "medium"
                          : "low"}
                    </span>
                    <span className="text-sm text-white/70 font-medium">
                      {pattern.type}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed ml-0">
                    {pattern.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Passed Patterns */}
        {result.passed_patterns &&
          result.passed_patterns.filter((p) => p.type?.trim()).length > 0 && (
            <div>
              <p className="text-xs text-white/30 uppercase tracking-wider font-medium mb-3">
                Passed Checks (
                {result.passed_patterns.filter((p) => p.type?.trim()).length})
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {result.passed_patterns
                  .filter((p) => p.type?.trim())
                  .map((pattern, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-400/5 border border-emerald-400/20 hover:border-emerald-400/40 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-xs text-emerald-300 font-medium">
                        {pattern.type.replace(/_/g, " ")}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

        {/* No patterns at all */}
        {(!result.web_patterns || result.web_patterns.length === 0) &&
          (!result.passed_patterns ||
            result.passed_patterns.length === 0) && (
            <div className="text-center py-4">
              {result.word_count && result.word_count < 50 ? (
                <>
                  <AlertCircle className="w-8 h-8 text-amber-400/50 mx-auto mb-2" />
                  <p className="text-sm text-white/50">
                    Content too short for reliable analysis
                  </p>
                </>
              ) : (
                <>
                  <CheckCircle className="w-8 h-8 text-emerald-400/50 mx-auto mb-2" />
                  <p className="text-sm text-white/50">
                    No suspicious patterns detected
                  </p>
                </>
              )}
            </div>
          )}
      </div>

      {/* Footer */}
      {result.analyzed_at && (
        <div className="px-5 py-3 border-t border-white/5 bg-white/1">
          <p className="text-xs text-white/30">
            Analyzed {new Date(result.analyzed_at).toLocaleString()}
          </p>
        </div>
      )}
    </motion.div>
  );
}

// ---- Shared metric card ---- //

function MetricCard({
  icon,
  label,
  value,
  center = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  center?: boolean;
}) {
  return (
    <div className={`p-3 rounded-lg bg-white/2 ${center ? "text-center" : ""}`}>
      <div
        className={`flex items-center gap-2 text-white/40 text-xs mb-1 ${center ? "justify-center" : ""}`}
      >
        {icon}
        {label}
      </div>
      <div className="text-white font-semibold text-lg">{value}</div>
    </div>
  );
}
