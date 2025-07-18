import { useSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import styles from "./index.module.css";

// All 20 APIs with emojis
const ALL_APIS = [
	{ id: "openweather", name: "OpenWeatherMap", emoji: "🌤" },
	{ id: "nasa", name: "NASA", emoji: "🚀" },
	{ id: "unsplash", name: "Unsplash", emoji: "📸" },
	{ id: "github", name: "GitHub", emoji: "⚡" },
	{ id: "stripe", name: "Stripe", emoji: "💳" },
	{ id: "twilio", name: "Twilio", emoji: "📱" },
	{ id: "giphy", name: "GIPHY", emoji: "🎭" },
	{ id: "spotify", name: "Spotify", emoji: "🎵" },
	{ id: "fakestore", name: "Fake Store", emoji: "🛍" },
	{ id: "countries", name: "REST Countries", emoji: "🌍" },
	{ id: "food", name: "Open Food Facts", emoji: "🍔" },
	{ id: "dogs", name: "The Dog API", emoji: "🐕" },
	{ id: "chuck", name: "Chuck Norris Jokes", emoji: "💪" },
	{ id: "tvmaze", name: "TV Maze", emoji: "📺" },
	{ id: "coingecko", name: "CoinGecko", emoji: "🪙" },
	{ id: "json", name: "JSONPlaceholder", emoji: "🔧" },
	{ id: "pexels", name: "Pexels", emoji: "🎥" },
	{ id: "mapbox", name: "Mapbox", emoji: "🗺" },
	{ id: "words", name: "WordsAPI", emoji: "📚" },
	{ id: "omdb", name: "OMDb", emoji: "🎬" },
];

export default function LandingPage(): JSX.Element {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [currentCardIndex, setCurrentCardIndex] = useState(0);
	const [cardTransition, setCardTransition] = useState<
		"entering" | "exiting" | null
	>(null);
	const [animationVariant, setAnimationVariant] = useState(0);
	const [gridDimensions, setGridDimensions] = useState({ columns: 8, rows: 6 });

	// Sample cards to display in hero
	const sampleCards = [
		{
			id: "sample-1",
			title: "PayAlert Pro",
			subtitle: "Real-time payment notifications",
			industry: "FinTech",
			apis: ["Stripe", "Twilio"],
			rating: 0.97,
			rarity: "Legendary",
			saved: false,
			favorited: false,
			summary:
				"Real-time SMS notifications for payment events. Track transactions, failed payments, and subscription updates instantly.",
			problem:
				"Businesses lose revenue when payment failures go unnoticed, leading to delayed responses and customer churn.",
			solution:
				"Instant SMS alerts for all payment events, enabling immediate action on failed transactions and proactive customer communication.",
			implementation:
				"Stripe webhooks trigger Twilio SMS notifications for payment events, with customizable alert rules and escalation paths.",
			marketOpportunity:
				"Payment processing market worth $87B with 15% annual growth. SMS notification services growing at 20% annually.",
			feasibility: "High",
			complexity: "Medium",
		},
		{
			id: "sample-2",
			title: "MoodSync",
			subtitle: "Visual music discovery platform",
			industry: "Entertainment",
			apis: ["Unsplash", "Spotify"],
			rating: 0.89,
			rarity: "Rare",
			saved: false,
			favorited: false,
			summary:
				"Discover music through visual aesthetics. Upload or browse photos to find songs that match the mood and atmosphere.",
			problem:
				"Music discovery relies heavily on text-based searches, missing the emotional connection between visual aesthetics and musical mood.",
			solution:
				"AI-powered platform that analyzes image aesthetics and matches them to Spotify tracks with similar emotional resonance.",
			implementation:
				"Unsplash API provides curated imagery, while Spotify API enables music matching based on audio features and mood analysis.",
			marketOpportunity:
				"Music streaming market worth $23B with visual content engagement driving 80% more user interaction.",
			feasibility: "High",
			complexity: "Medium",
		},
		{
			id: "sample-3",
			title: "WeatherOps",
			subtitle: "Weather-driven development workflow",
			industry: "DevTools",
			apis: ["OpenWeatherMap", "GitHub"],
			rating: 0.85,
			rarity: "Uncommon",
			saved: false,
			favorited: false,
			summary:
				"Automate deployments and development workflows based on weather conditions. Perfect for seasonal features and location-based releases.",
			problem:
				"Development teams struggle to coordinate seasonal feature releases and weather-dependent application updates across different regions.",
			solution:
				"Automated workflow system that triggers GitHub Actions based on weather conditions, enabling smart seasonal deployments.",
			implementation:
				"OpenWeatherMap API monitors weather patterns while GitHub API manages automated deployments and feature flag toggles.",
			marketOpportunity:
				"DevOps automation market worth $8B with weather-based applications growing 25% annually in retail and agriculture.",
			feasibility: "Medium",
			complexity: "Low",
		},
	];

	// Calculate grid dimensions for hero background
	useEffect(() => {
		const calculateGridDimensions = () => {
			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;

			// Smaller, denser grid for hero background
			const columns = Math.max(6, Math.floor(viewportWidth / 120));
			const rows = Math.max(4, Math.floor(viewportHeight / 120));

			setGridDimensions({ columns, rows });
		};

		calculateGridDimensions();
		window.addEventListener("resize", calculateGridDimensions);

		return () => window.removeEventListener("resize", calculateGridDimensions);
	}, []);

	// Smooth card transition function
	const changeCard = (newIndex: number) => {
		if (newIndex === currentCardIndex) return;

		// Select random animation variant (0-5 for 6 different rotation patterns)
		const variant = Math.floor(Math.random() * 6);
		setAnimationVariant(variant);
		setCardTransition("exiting");
		
		setTimeout(() => {
			setCurrentCardIndex(newIndex);
			setCardTransition("entering");
			setTimeout(() => setCardTransition(null), 600); // Reduced from 900ms to match new animation duration
		}, 300); // Reduced from 600ms to 300ms to overlap animations
	};

	// Carousel auto-advance effect
	useEffect(() => {
		const interval = setInterval(() => {
			const nextIndex = (currentCardIndex + 1) % sampleCards.length;
			changeCard(nextIndex);
		}, 5000); // Show each card for 5 seconds

		return () => clearInterval(interval);
	}, [currentCardIndex, sampleCards.length]);

	// Redirect authenticated users
	useEffect(() => {
		if (status === "authenticated" && session && router.isReady) {
			router.push("/dashboard");
		}
	}, [session, status, router]);

	// Loading state while checking auth
	if (status === "loading") {
		return (
			<div className={styles.loadingScreen}>
				<div className={styles.loadingSpinner} />
			</div>
		);
	}

	// Redirect screen for authenticated users
	if (session) {
		return (
			<div className={styles.loadingScreen}>
				<div className={styles.loadingSpinner} />
			</div>
		);
	}

	return (
		<div className={styles.landingPage}>
			<Navbar />

			<main className={styles.main}>
				<div className={styles.hero}>
					{/* API Grid Background */}
					<div className={styles.heroBackground}>
						<div
							className={styles.apiGrid}
							style={{
								gridTemplateColumns: `repeat(${gridDimensions.columns}, 1fr)`,
								gridTemplateRows: `repeat(${gridDimensions.rows}, 1fr)`,
							}}
						>
							{Array.from({
								length: gridDimensions.columns * gridDimensions.rows,
							}).map((_, index) => {
								const apiIndex = index % ALL_APIS.length;
								const api = ALL_APIS[apiIndex];
								const isLongName = api.name.length > 12;

								return (
									<div key={`${api.id}-${index}`} className={styles.apiTile}>
										<div className={styles.apiTileContent}>
											<span className={styles.apiTileEmoji}>{api.emoji}</span>
											<span
												className={styles.apiTileName}
												data-long={isLongName}
												title={api.name}
											>
												{api.name}
											</span>
										</div>
									</div>
								);
							})}
						</div>
					</div>

					{/* Hero Content */}
					<div className={styles.heroContent}>
						<h1 className={styles.title}>App Ideas, Instantly</h1>
						<p className={styles.subtitle}>
							AI generated app concepts created by randomly combining powerful
							APIs. Includes starter business plan.
						</p>

						<div className={styles.cta}>
							<Link href="/login" className={styles.primaryButton}>
								Generate idea
							</Link>
						</div>
					</div>

					<div className={styles.heroCards}>
						<div className={styles.cardCarousel}>
							<div
								className={`${styles.cardContainer} ${
									cardTransition ? styles[cardTransition] : ""
								} ${styles[`variant${animationVariant}`]}`}
							>
								<Card card={sampleCards[currentCardIndex]} />
							</div>
							<div className={styles.carouselIndicators}>
								{sampleCards.map((_, index) => (
									<button
										key={index}
										className={`${styles.indicator} ${
											index === currentCardIndex ? styles.active : ""
										}`}
										onClick={() => changeCard(index)}
										aria-label={`Go to card ${index + 1}`}
									/>
								))}
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}

export const getServerSideProps: GetServerSideProps = async () => {
	return {
		props: {},
	};
};
