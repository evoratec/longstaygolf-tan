import { createFileRoute, Link } from "@tanstack/react-router";
import { AnalysisPlayground } from "@/components/AnalysisPlayground";
import { AlertTriangle, ArrowLeft, HelpCircle } from "lucide-react";
import { SiGithub, SiX } from "react-icons/si";
import { LogoIcon } from "@/components/Logo";
import { Footer } from "@/components/landing/Footer";
import { useVersion } from "@/lib/useVersion";

export const Route = createFileRoute("/analysis")({
  component: AnalysisPage,
  meta: () => [
    {
      title: "Analysis Playground | Cadence",
      description: "Analyze repositories and websites for AI-generated content",
    },
  ],
});

function AnalysisPage() {
  const { version } = useVersion();

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full">
        <div className="absolute inset-0 bg-[#09090b]/90 backdrop-blur-md border-b border-white/5" />
        <div className="relative max-w-5xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-14">
            <Link to="/" className="flex items-center gap-2 group">
              <LogoIcon size={20} />
              <span className="font-semibold text-white">Cadence</span>
              <span className="text-xs text-white/30">{version}</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link
                to="/examples"
                className="text-sm text-white/50 hover:text-white transition-colors"
              >
                Examples
              </Link>
              <Link
                to="/docs"
                className="text-sm text-white/50 hover:text-white transition-colors"
              >
                Docs
              </Link>
              <a
                href="https://x.com/NoSlopTech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/50 hover:text-white transition-colors"
              >
                <SiX className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://github.com/TryCadence/Cadence"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/50 hover:text-white transition-colors flex items-center gap-1"
              >
                <SiGithub className="w-4 h-4" />
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-16">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Analysis Playground
          </h1>
          <p className="text-base md:text-lg text-white/60 max-w-2xl">
            Test Cadence's AI detection capabilities on your own repositories and websites.
          </p>

          {/* Disclaimer Banner */}
          <div className="mt-8 inline-flex items-start gap-3 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm max-w-3xl">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-amber-200">
              <strong className="font-medium">Important:</strong> Cadence is a detection tool, not a definitive judgment. 
              Results indicate <em>potential</em> AI-generated content based on pattern analysis. 
              False positives can occur with highly structured code or consistent writing styles.
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Component */}
      <section className="py-16 px-4 md:px-6 border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <AnalysisPlayground />
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 px-4 md:px-6 border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
              <HelpCircle className="w-5 h-5 text-white/70" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Frequently Asked Questions</h2>
              <p className="text-white/50 text-sm">Common questions about the analysis playground</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl bg-white/2 border border-white/5 p-5">
              <h3 className="font-semibold text-white mb-2">How accurate is Cadence?</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Cadence uses 38 detection strategies to identify patterns commonly associated with AI-generated content. 
                While highly effective at spotting suspicious patterns, it's not 100% accurate. Results should be used as 
                one factor in your evaluation, not the sole determining factor.
              </p>
            </div>

            <div className="rounded-xl bg-white/2 border border-white/5 p-5">
              <h3 className="font-semibold text-white mb-2">What repositories can I analyze?</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                You can analyze any public GitHub or GitLab repository by providing its URL. Private repositories 
                are not currently supported in this playground. For private repository analysis, consider running 
                Cadence locally or deploying your own instance.
              </p>
            </div>

            <div className="rounded-xl bg-white/2 border border-white/5 p-5">
              <h3 className="font-semibold text-white mb-2">How long does analysis take?</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Analysis time varies based on repository size and commit history. Small repositories typically complete 
                in under a minute, while larger repositories with thousands of commits may take several minutes. 
                The playground will show real-time progress as your analysis runs.
              </p>
            </div>

            <div className="rounded-xl bg-white/2 border border-white/5 p-5">
              <h3 className="font-semibold text-white mb-2">What does a high suspicion score mean?</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                A high suspicion score indicates that Cadence detected multiple patterns commonly associated with 
                AI-generated content. This could include rapid commit velocity, unusual timing patterns, generic commit 
                messages, or structural anomalies. However, legitimate code can sometimes trigger these patterns too.
              </p>
            </div>

            <div className="rounded-xl bg-white/2 border border-white/5 p-5">
              <h3 className="font-semibold text-white mb-2">Can I use this for production decisions?</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                This playground is designed for testing and evaluation purposes. For production use cases, we recommend 
                running Cadence locally with your own infrastructure, reviewing the detailed analysis reports, and 
                combining Cadence results with other evaluation methods and human review.
              </p>
            </div>

            <div className="rounded-xl bg-white/2 border border-white/5 p-5">
              <h3 className="font-semibold text-white mb-2">Is my data stored or logged?</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Analysis results are processed in real-time and stored temporarily during the job execution. 
                We do not permanently store your repository data or analysis results. However, URLs you submit 
                may be logged for debugging and rate-limiting purposes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
