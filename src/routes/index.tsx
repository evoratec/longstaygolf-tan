import { createFileRoute } from "@tanstack/react-router";
import { CTASection } from "../components/landing/CTASection";
import { DetectionStrategies } from "../components/landing/DetectionStrategies";
import { ExampleReports } from "../components/landing/ExampleReports";
import { FeaturesGrid } from "../components/landing/FeaturesGrid";
import { Footer } from "../components/landing/Footer";
import { Hero } from "../components/landing/Hero";
import { QuickStart } from "../components/landing/QuickStart";
import { StatsBar } from "../components/landing/StatsBar";
import { LandingLayout } from "../components/layouts/LandingLayout";
import { AnalysisPlaygroundSection } from "../components/landing/AnalysisPlaygroundSection";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	return (
		<LandingLayout>
			<Hero />
			<StatsBar />
			<FeaturesGrid />
			<ExampleReports />
			<QuickStart />
			<DetectionStrategies />
			<AnalysisPlaygroundSection />
			<CTASection />
			{/**<Partners /> */}
			<Footer />
		</LandingLayout>
	);
}
