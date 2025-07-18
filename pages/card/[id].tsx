import { useState, useEffect, useCallback } from "react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/auth/AuthGuard";
import Card from "@/components/Card";
import styles from "./[id].module.css";

interface CardData {
	id: string;
	title: string;
	subtitle: string;
	industry: string;
	apis: string | string[];
	rating: number;
	rarity: string;
	saved: boolean;
	favorited: boolean;
	problem?: string;
	solution?: string;
	implementation?: string;
	marketOpportunity?: string;
	summary?: string;
	feasibility?: string;
	complexity?: string;
	createdAt: string;
}

export default function CardDetailPage(): JSX.Element {
	const router = useRouter();
	const { id } = router.query;
	const [card, setCard] = useState<CardData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const fetchCard = useCallback(async (): Promise<void> => {
		try {
			const response = await fetch(`/api/cards/${id}`);
			if (response.ok) {
				const data = await response.json();
				setCard(data);
			} else {
				setError("Card not found");
			}
		} catch (err) {
			setError("Failed to load card");
		} finally {
			setLoading(false);
		}
	}, [id]);

	useEffect(() => {
		if (id) {
			fetchCard();
		}
	}, [id, fetchCard]);

	const getRarityColor = (rarity: string): string => {
		switch (rarity.toLowerCase()) {
			case "legendary":
				return "#f59e0b";
			case "epic":
				return "#8b5cf6";
			case "rare":
				return "#3b82f6";
			case "uncommon":
				return "#10b981";
			default:
				return "#6b7280";
		}
	};

	const getApiArray = (apis: string | string[]): string[] => {
		return typeof apis === "string" ? JSON.parse(apis) : apis;
	};

	const getApiDocumentationUrl = (apiName: string): string => {
		const apiMapping: { [key: string]: string } = {
			OpenWeatherMap: "https://openweathermap.org/api",
			NASA: "https://api.nasa.gov/",
			Unsplash: "https://unsplash.com/developers",
			GitHub: "https://docs.github.com/en/rest",
			Stripe: "https://stripe.com/docs/api",
			Twilio: "https://www.twilio.com/docs/api",
			GIPHY: "https://developers.giphy.com/docs/api",
			Spotify: "https://developer.spotify.com/documentation/web-api/",
			"Fake Store": "https://fakestoreapi.com/docs",
			"REST Countries": "https://restcountries.com/",
			"Open Food Facts": "https://openfoodfacts.github.io/api-documentation/",
			"The Dog API": "https://thedogapi.com/docs",
			"Chuck Norris Jokes": "https://api.chucknorris.io/",
			"TV Maze": "https://www.tvmaze.com/api",
			CoinGecko: "https://www.coingecko.com/en/api/documentation",
			JSONPlaceholder: "https://jsonplaceholder.typicode.com/",
			Pexels: "https://www.pexels.com/api/documentation/",
			Mapbox: "https://docs.mapbox.com/api/",
			WordsAPI: "https://www.wordsapi.com/docs",
			OMDb: "https://www.omdbapi.com/",
		};
		return apiMapping[apiName] || "#";
	};

	if (loading) {
		return (
			<AuthGuard requireAuth>
				<Navbar />
				<div className={`${styles.detailPage} ${styles.loading}`}>
					<div className={styles.loadingContainer}>
						<div className={styles.loadingSpinner} />
						<p>Loading card details...</p>
					</div>
				</div>
			</AuthGuard>
		);
	}

	if (error || !card) {
		return (
			<AuthGuard requireAuth>
				<Navbar />
				<div className={`${styles.detailPage} ${styles.error}`}>
					<div className={styles.errorContainer}>
						<div className={styles.errorIcon}>😕</div>
						<h1>Card Not Found</h1>
						<p>{error || "The card you're looking for doesn't exist."}</p>
						<div className={styles.errorActions}>
							<button
								onClick={() => router.back()}
								className={styles.btnSecondary}
							>
								Go Back
							</button>
							<Link href="/dashboard" className={styles.btnPrimary}>
								Back to Dashboard
							</Link>
						</div>
					</div>
				</div>
			</AuthGuard>
		);
	}

	return (
		<AuthGuard requireAuth>
			<Navbar />
			<div className={styles.detailPage}>
				<div className={styles.detailContainer}>
					{/* Two Column Layout */}
					<div className={styles.twoColumnLayout}>
						{/* Left Column - Card Preview */}
						<div className={styles.leftColumn}>
							{/* <div className={styles.cardPreviewSection}> */}
							{/* <div className={styles.cardPreviewContainer}> */}
							<Card card={card} />
							{/* </div> */}
							{/* </div> */}
						</div>

						{/* Right Column - Details */}
						<div className={styles.rightColumn}>
							{/* Business Overview Section */}
							<div className={styles.contentSection}>
								<div className={styles.sectionHeader}>
									<h2 className={styles.sectionTitle}>
										<span className={styles.sectionIcon}>💼</span>
										Business Overview
									</h2>
								</div>
								<div className={styles.sectionContent}>
									{card.problem && (
										<div className={styles.problemSolution}>
											<div className={styles.problemStatement}>
												<h3 className={styles.subsectionTitle}>
													<span className={styles.subsectionIcon}>🎯</span>
													Problem Statement
												</h3>
												<p>{card.problem}</p>
											</div>
										</div>
									)}

									{card.solution && (
										<div className={styles.problemSolution}>
											<div className={styles.solutionStatement}>
												<h3 className={styles.subsectionTitle}>
													<span className={styles.subsectionIcon}>✅</span>
													Solution Overview
												</h3>
												<p>{card.solution}</p>
											</div>
										</div>
									)}

									{/* Innovation Score Section */}
									<div className={styles.innovationScore}>
										<div className={styles.innovationHeader}>
											<h3 className={styles.subsectionTitle}>
												<span className={styles.subsectionIcon}>🎆</span>
												Innovation Score
											</h3>
											<div className={styles.scoreDisplay}>
												<div className={styles.scoreValue}>
													{(card.rating * 100).toFixed(0)}%
												</div>
												<div className={styles.scoreRating}>{card.rarity}</div>
											</div>
										</div>
										<div className={styles.scoreExplanation}>
											<p>{card.summary || card.subtitle}</p>
											<div className={styles.scoringFactors}>
												<h4>Why this score?</h4>
												<div className={styles.factorsList}>
													<div className={styles.factorItem}>
														<span className={styles.factorIcon}>🛠</span>
														<div className={styles.factorContent}>
															<span className={styles.factorLabel}>
																Technical Innovation:
															</span>
															<span className={styles.factorValue}>
																{card.rating >= 0.8
																	? "High"
																	: card.rating >= 0.6
																		? "Medium"
																		: "Standard"}{" "}
																-
																{card.rating >= 0.8
																	? "Cutting-edge API combination with novel integration patterns"
																	: card.rating >= 0.6
																		? "Solid technical approach with good API synergy"
																		: "Straightforward implementation with proven patterns"}
															</span>
														</div>
													</div>
													<div className={styles.factorItem}>
														<span className={styles.factorIcon}>📋</span>
														<div className={styles.factorContent}>
															<span className={styles.factorLabel}>
																Market Potential:
															</span>
															<span className={styles.factorValue}>
																{card.rating >= 0.8
																	? "Exceptional"
																	: card.rating >= 0.6
																		? "Strong"
																		: "Moderate"}{" "}
																-
																{card.rating >= 0.8
																	? "Large addressable market with clear demand signals"
																	: card.rating >= 0.6
																		? "Good market opportunity with growing demand"
																		: "Niche market with steady demand"}
															</span>
														</div>
													</div>
													<div className={styles.factorItem}>
														<span className={styles.factorIcon}>🚀</span>
														<div className={styles.factorContent}>
															<span className={styles.factorLabel}>
																Implementation Feasibility:
															</span>
															<span className={styles.factorValue}>
																{card.feasibility ||
																	(card.rating >= 0.7
																		? "High"
																		: card.rating >= 0.5
																			? "Medium"
																			: "Challenging")}{" "}
																-
																{card.complexity === "Low"
																	? "Quick to implement with minimal resources"
																	: card.complexity === "Medium"
																		? "Moderate development effort required"
																		: "Complex implementation requiring significant resources"}
															</span>
														</div>
													</div>
													<div className={styles.factorItem}>
														<span className={styles.factorIcon}>🎆</span>
														<div className={styles.factorContent}>
															<span className={styles.factorLabel}>
																Innovation Factor:
															</span>
															<span className={styles.factorValue}>
																{card.rarity === "Legendary"
																	? "Revolutionary"
																	: card.rarity === "Epic"
																		? "Highly Innovative"
																		: card.rarity === "Rare"
																			? "Innovative"
																			: card.rarity === "Uncommon"
																				? "Moderately Innovative"
																				: "Standard"}{" "}
																-
																{card.rarity === "Legendary"
																	? "Groundbreaking approach that could redefine the industry"
																	: card.rarity === "Epic"
																		? "Novel combination with significant competitive advantage"
																		: card.rarity === "Rare"
																			? "Creative solution with clear differentiation"
																			: card.rarity === "Uncommon"
																				? "Solid innovation with some unique aspects"
																				: "Reliable solution using established patterns"}
															</span>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* API Integration Section */}
							<div className={styles.contentSection}>
								<div className={styles.sectionHeader}>
									<h2 className={styles.sectionTitle}>
										<span className={styles.sectionIcon}>🔗</span>
										API Integration
									</h2>
								</div>
								<div className={styles.sectionContent}>
									<div className={styles.apiIntegration}>
										{getApiArray(card.apis).map((api, index) => (
											<div key={index} className={styles.apiCard}>
												<div className={styles.apiNumber}>{index + 1}</div>
												<div className={styles.apiDetails}>
													<div className={styles.apiName}>{api}</div>
													<div className={styles.apiRole}>
														{index === 0
															? "Primary Service"
															: "Secondary Service"}
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>

							{/* Implementation Section */}
							<div className={styles.contentSection}>
								<div className={styles.sectionHeader}>
									<h2 className={styles.sectionTitle}>
										<span className={styles.sectionIcon}>🚀</span>
										Implementation Guide
									</h2>
									<div className={styles.sectionDescription}>
										Complete development roadmap for building this {card.title}{" "}
										integration
									</div>
								</div>
								<div className={styles.sectionContent}>
									{/* Development Overview */}
									<div className={styles.developmentOverview}>
										<div className={styles.overviewStats}>
											<div className={styles.statCard}>
												<div className={styles.statNumber}>2-4</div>
												<div className={styles.statLabel}>Weeks</div>
											</div>
											<div className={styles.statCard}>
												<div className={styles.statNumber}>
													{getApiArray(card.apis).length}
												</div>
												<div className={styles.statLabel}>APIs</div>
											</div>
											<div className={styles.statCard}>
												<div className={styles.statNumber}>
													{card.complexity || "Medium"}
												</div>
												<div className={styles.statLabel}>Complexity</div>
											</div>
										</div>
									</div>

									{/* Implementation Steps */}
									<div className={styles.implementationSteps}>
										<h3 className={styles.stepsTitle}>Development Steps</h3>

										<div className={styles.stepsList}>
											<div className={styles.stepCard}>
												<div className={styles.stepHeader}>
													<div className={styles.stepBadge}>Step 1</div>
													<h4 className={styles.stepTitle}>
														Setup & Authentication
													</h4>
													<span className={styles.stepTime}>1-2 days</span>
												</div>
												<p className={styles.stepDescription}>
													Register for API accounts and configure authentication
													for all required services.
												</p>
												<div className={styles.stepTasks}>
													<h5>Required APIs:</h5>
													<div className={styles.apiList}>
														{getApiArray(card.apis).map((api, index) => (
															<div key={index} className={styles.apiItem}>
																<span className={styles.apiDot}></span>
																<span className={styles.apiText}>{api}</span>
																<span className={styles.apiStatus}>
																	Setup required
																</span>
															</div>
														))}
													</div>
												</div>
											</div>

											<div className={styles.stepCard}>
												<div className={styles.stepHeader}>
													<div className={styles.stepBadge}>Step 2</div>
													<h4 className={styles.stepTitle}>
														Environment Configuration
													</h4>
													<span className={styles.stepTime}>2-3 days</span>
												</div>
												<p className={styles.stepDescription}>
													Set up your development environment with proper
													dependencies and configuration.
												</p>
												<div className={styles.stepTasks}>
													<h5>Configuration Tasks:</h5>
													<div className={styles.taskGrid}>
														<div className={styles.taskItem}>
															📦 Install dependencies
														</div>
														<div className={styles.taskItem}>
															⚙ Environment variables
														</div>
														<div className={styles.taskItem}>
															🧪 Testing setup
														</div>
														<div className={styles.taskItem}>
															📁 Project structure
														</div>
													</div>
												</div>
											</div>

											<div className={styles.stepCard}>
												<div className={styles.stepHeader}>
													<div className={styles.stepBadge}>Step 3</div>
													<h4 className={styles.stepTitle}>Core Integration</h4>
													<span className={styles.stepTime}>1-2 weeks</span>
												</div>
												<p className={styles.stepDescription}>
													Build the main application logic that connects and
													coordinates between the APIs.
												</p>
												<div className={styles.stepTasks}>
													<h5>Integration Flow:</h5>
													<div className={styles.flowDiagram}>
														<div className={styles.flowNode}>Input Data</div>
														<div className={styles.flowConnector}>→</div>
														<div className={styles.flowNode}>
															{getApiArray(card.apis)[0]}
														</div>
														<div className={styles.flowConnector}>→</div>
														<div className={styles.flowNode}>
															{getApiArray(card.apis)[1]}
														</div>
														<div className={styles.flowConnector}>→</div>
														<div className={styles.flowNode}>Output</div>
													</div>
												</div>
											</div>

											<div className={styles.stepCard}>
												<div className={styles.stepHeader}>
													<div className={styles.stepBadge}>Step 4</div>
													<h4 className={styles.stepTitle}>
														Testing & Deployment
													</h4>
													<span className={styles.stepTime}>3-5 days</span>
												</div>
												<p className={styles.stepDescription}>
													Thoroughly test the integration and deploy to
													production environment.
												</p>
												<div className={styles.stepTasks}>
													<h5>Testing Checklist:</h5>
													<div className={styles.checklistGrid}>
														<div className={styles.checkItem}>✓ Unit tests</div>
														<div className={styles.checkItem}>
															✓ Integration tests
														</div>
														<div className={styles.checkItem}>
															✓ Error handling
														</div>
														<div className={styles.checkItem}>
															✓ Performance testing
														</div>
														<div className={styles.checkItem}>
															✓ Security review
														</div>
														<div className={styles.checkItem}>
															✓ Production deployment
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>

									{/* Code Implementation */}
									{card.implementation && (
										<div className={styles.codeSection}>
											<h3 className={styles.codeTitle}>
												<span className={styles.codeIcon}>💻</span>
												Sample Implementation
											</h3>
											<div className={styles.codeWrapper}>
												<div className={styles.codeControls}>
													<span className={styles.codeLabel}>Example Code</span>
													<button className={styles.copyBtn}>Copy Code</button>
												</div>
												<div className={styles.codeContent}>
													<pre className={styles.codeBlock}>
														{card.implementation}
													</pre>
												</div>
											</div>
										</div>
									)}

									{/* Additional Resources */}
									<div className={styles.resourcesSection}>
										<h3 className={styles.resourcesTitle}>
											<span className={styles.resourcesIcon}>📚</span>
											Developer Resources
										</h3>
										<div className={styles.resourceCards}>
											<div className={styles.resourceCard}>
												<div className={styles.resourceHeader}>
													<div className={styles.resourceIcon}>📖</div>
													<h4>Documentation</h4>
												</div>
												<p>
													Official API documentation and guides for{" "}
													{getApiArray(card.apis).join(" and ")}
												</p>
											</div>
											<div className={styles.resourceCard}>
												<div className={styles.resourceHeader}>
													<div className={styles.resourceIcon}>🎯</div>
													<h4>Examples</h4>
												</div>
												<p>
													Code samples and tutorials from the developer
													community
												</p>
											</div>
											<div className={styles.resourceCard}>
												<div className={styles.resourceHeader}>
													<div className={styles.resourceIcon}>💡</div>
													<h4>Support</h4>
												</div>
												<p>Community forums and developer support channels</p>
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Technical Requirements Section */}
							<div className={styles.contentSection}>
								<div className={styles.sectionHeader}>
									<h2 className={styles.sectionTitle}>
										<span className={styles.sectionIcon}>⚙</span>
										Technical Details
									</h2>
								</div>
								<div className={styles.sectionContent}>
									<div className={styles.technicalGrid}>
										<div className={styles.techCard}>
											<h3 className={styles.techCardTitle}>
												<span className={styles.techCardIcon}>🔧</span>
												Requirements
											</h3>
											<div className={styles.requirementsList}>
												<div className={styles.requirementItem}>
													<span className={styles.reqLabel}>Complexity</span>
													<span className={styles.reqValue}>
														{card.complexity || "Medium"}
													</span>
												</div>
												<div className={styles.requirementItem}>
													<span className={styles.reqLabel}>Feasibility</span>
													<span className={styles.reqValue}>
														{card.feasibility || "High"}
													</span>
												</div>
												<div className={styles.requirementItem}>
													<span className={styles.reqLabel}>Time to MVP</span>
													<span className={styles.reqValue}>2-4 weeks</span>
												</div>
											</div>
										</div>

										<div className={styles.techCard}>
											<h3 className={styles.techCardTitle}>
												<span className={styles.techCardIcon}>⚡</span>
												Performance
											</h3>
											<div className={styles.metricsList}>
												<div className={styles.metricItem}>
													<span className={styles.metricName}>
														Expected Latency
													</span>
													<span className={styles.metricValue}>{"<"}100ms</span>
												</div>
												<div className={styles.metricItem}>
													<span className={styles.metricName}>Throughput</span>
													<span className={styles.metricValue}>10K+ RPS</span>
												</div>
												<div className={styles.metricItem}>
													<span className={styles.metricName}>Uptime SLA</span>
													<span className={styles.metricValue}>99.9%</span>
												</div>
											</div>
										</div>

										<div className={styles.techCard}>
											<h3 className={styles.techCardTitle}>
												<span className={styles.techCardIcon}>🔒</span>
												Security
											</h3>
											<div className={styles.securityList}>
												<div className={styles.securityItem}>
													✅ API key encryption
												</div>
												<div className={styles.securityItem}>
													✅ Rate limiting
												</div>
												<div className={styles.securityItem}>
													✅ Data validation
												</div>
												<div className={styles.securityItem}>
													✅ Error handling
												</div>
											</div>
										</div>

										<div className={styles.techCard}>
											<h3 className={styles.techCardTitle}>
												<span className={styles.techCardIcon}>📦</span>
												Tech Stack
											</h3>
											<div className={styles.techStack}>
												<div className={styles.techItem}>Node.js / Python</div>
												<div className={styles.techItem}>Express / FastAPI</div>
												<div className={styles.techItem}>
													PostgreSQL / MongoDB
												</div>
												<div className={styles.techItem}>Redis Cache</div>
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Market Analysis Section */}
							<div className={styles.contentSection}>
								<div className={styles.sectionHeader}>
									<h2 className={styles.sectionTitle}>
										<span className={styles.sectionIcon}>📈</span>
										Market Analysis
									</h2>
									<div className={styles.sectionDescription}>
										Comprehensive market opportunity and business potential
										analysis
									</div>
								</div>
								<div className={styles.sectionContent}>
									{/* Key Metrics */}
									<div className={styles.keyMetrics}>
										<div className={styles.metricsRow}>
											<div className={styles.metricCard}>
												<div className={styles.metricIcon}>📈</div>
												<div className={styles.metricContent}>
													<div className={styles.metricValue}>
														{card.marketOpportunity || "$2.1B+"}
													</div>
													<div className={styles.metricLabel}>Market Size</div>
												</div>
											</div>

											<div className={styles.metricCard}>
												<div className={styles.metricIcon}>🎯</div>
												<div className={styles.metricContent}>
													<div className={styles.metricValue}>
														{(card.rating * 100).toFixed(0)}%
													</div>
													<div className={styles.metricLabel}>
														Success Score
													</div>
												</div>
											</div>

											<div className={styles.metricCard}>
												<div className={styles.metricIcon}>💎</div>
												<div className={styles.metricContent}>
													<div className={styles.metricValue}>
														{card.rarity}
													</div>
													<div className={styles.metricLabel}>Rarity Level</div>
												</div>
											</div>
										</div>
									</div>

									{/* Market Overview */}
									<div className={styles.marketOverview}>
										<h3 className={styles.overviewTitle}>Market Overview</h3>
										<div className={styles.overviewGrid}>
											<div className={styles.overviewCard}>
												<div className={styles.overviewIcon}>📈</div>
												<h4>Industry Focus</h4>
												<div className={styles.industryBadge}>
													{card.industry}
												</div>
												<p>
													Experiencing rapid digital transformation with 15-25%
													annual growth in API adoption
												</p>
											</div>

											<div className={styles.overviewCard}>
												<div className={styles.overviewIcon}>🎯</div>
												<h4>Target Audience</h4>
												<p>
													Small to medium businesses and enterprises seeking
													streamlined operations through API integrations
												</p>
											</div>

											<div className={styles.overviewCard}>
												<div className={styles.overviewIcon}>🛡</div>
												<h4>Competitive Advantage</h4>
												<p>
													Limited direct competitors in this specific API
													combination, providing first-mover advantage
												</p>
											</div>
										</div>
									</div>

									{/* Revenue Strategy */}
									<div className={styles.revenueStrategy}>
										<h3 className={styles.revenueTitle}>Revenue Strategy</h3>
										<div className={styles.revenueGrid}>
											<div className={styles.revenueCard}>
												<div className={styles.revenueIcon}>🔄</div>
												<h4>Subscription Model</h4>
												<div className={styles.revenueDetails}>
													<p>Monthly recurring revenue with tiered pricing</p>
													<div className={styles.pricingList}>
														<div className={styles.priceItem}>
															Basic: $29/mo
														</div>
														<div className={styles.priceItem}>Pro: $99/mo</div>
														<div className={styles.priceItem}>
															Enterprise: $299/mo
														</div>
													</div>
												</div>
											</div>

											<div className={styles.revenueCard}>
												<div className={styles.revenueIcon}>💳</div>
												<h4>Transaction Fees</h4>
												<div className={styles.revenueDetails}>
													<p>Usage-based commission model</p>
													<div className={styles.feeStructure}>
														<div className={styles.feeItem}>
															1-3% per transaction
														</div>
														<div className={styles.feeItem}>
															Est. 10K-50K monthly volume
														</div>
													</div>
												</div>
											</div>

											<div className={styles.revenueCard}>
												<div className={styles.revenueIcon}>⭐</div>
												<h4>Premium Add-ons</h4>
												<div className={styles.revenueDetails}>
													<p>Value-added services and features</p>
													<div className={styles.addonList}>
														<div className={styles.addonItem}>
															Analytics: +$49/mo
														</div>
														<div className={styles.addonItem}>
															Custom Integration: +$199/mo
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>

									{/* Growth Projections */}
									<div className={styles.growthProjections}>
										<h3 className={styles.growthTitle}>
											3-Year Growth Projections
										</h3>
										<div className={styles.projectionsGrid}>
											<div className={styles.projectionCard}>
												<div className={styles.projectionYear}>Year 1</div>
												<div className={styles.projectionRevenue}>
													$50K-100K
												</div>
												<div className={styles.projectionDetails}>
													<div className={styles.projectionMetric}>
														<span className={styles.metricLabel}>Users:</span>
														<span className={styles.metricValue}>100-500</span>
													</div>
													<div className={styles.projectionMetric}>
														<span className={styles.metricLabel}>Focus:</span>
														<span className={styles.metricValue}>
															Product-market fit
														</span>
													</div>
												</div>
											</div>

											<div className={styles.projectionCard}>
												<div className={styles.projectionYear}>Year 2</div>
												<div className={styles.projectionRevenue}>
													$200K-500K
												</div>
												<div className={styles.projectionDetails}>
													<div className={styles.projectionMetric}>
														<span className={styles.metricLabel}>Users:</span>
														<span className={styles.metricValue}>500-2K</span>
													</div>
													<div className={styles.projectionMetric}>
														<span className={styles.metricLabel}>Focus:</span>
														<span className={styles.metricValue}>
															Scale operations
														</span>
													</div>
												</div>
											</div>

											<div className={styles.projectionCard}>
												<div className={styles.projectionYear}>Year 3</div>
												<div className={styles.projectionRevenue}>
													$500K-1M+
												</div>
												<div className={styles.projectionDetails}>
													<div className={styles.projectionMetric}>
														<span className={styles.metricLabel}>Users:</span>
														<span className={styles.metricValue}>2K-5K+</span>
													</div>
													<div className={styles.projectionMetric}>
														<span className={styles.metricLabel}>Focus:</span>
														<span className={styles.metricValue}>
															Market leadership
														</span>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Footer */}
					<footer className={styles.detailFooter}>
						<div className={styles.footerContent}>
							<div className={styles.generationInfo}>
								<span className={styles.infoLabel}>Generated:</span>
								<span className={styles.infoValue}>
									{new Date(card.createdAt).toLocaleDateString("en-US", {
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
								</span>
							</div>
							<div className={styles.footerActions}>
								<Link href="/shop" className={styles.btnOutline}>
									Generate More Cards
								</Link>
								<Link href="/dashboard" className={styles.btnPrimary}>
									Back to Dashboard
								</Link>
							</div>
						</div>
					</footer>
				</div>
			</div>
		</AuthGuard>
	);
}

export const getServerSideProps: GetServerSideProps = async () => {
	return {
		props: {},
	};
};
