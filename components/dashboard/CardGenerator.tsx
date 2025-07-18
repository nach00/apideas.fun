import React, { useState, useCallback, useEffect, useRef, memo } from "react";
import { gsap } from "gsap";
import Link from "next/link";
import confetti from "canvas-confetti";
import { logComponent, logUser } from "@/lib/logger";
import { CardData } from "@/types";
import Card from "@/components/Card";
import styles from "./CardGenerator.module.css";

// API Documentation URLs - matching Card component
const API_DOCUMENTATION_URLS: Record<string, string> = {
	OpenWeatherMap: "https://openweathermap.org/api",
	NASA: "https://api.nasa.gov",
	Unsplash: "https://unsplash.com/developers",
	GitHub: "https://docs.github.com/en/rest",
	Stripe: "https://stripe.com/docs",
	Twilio: "https://www.twilio.com/docs",
	GIPHY: "https://developers.giphy.com",
	Spotify: "https://developer.spotify.com",
	"Fake Store": "https://fakestoreapi.com",
	"REST Countries": "https://restcountries.com",
	"Open Food Facts": "https://world.openfoodfacts.org/data",
	"The Dog API": "https://thedogapi.com",
	"Chuck Norris Jokes": "https://api.chucknorris.io",
	"TV Maze": "https://www.tvmaze.com/api",
	CoinGecko: "https://www.coingecko.com/en/api",
	JSONPlaceholder: "https://jsonplaceholder.typicode.com",
	Pexels: "https://www.pexels.com/api",
	Mapbox: "https://docs.mapbox.com",
	WordsAPI: "https://www.wordsapi.com",
	OMDb: "https://www.omdbapi.com",
} as const;

// All 20 APIs with emojis - matching top20apis.json exactly
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

// Utility function to get API documentation URL
const getApiDocumentationUrl = (apiName: string): string =>
	API_DOCUMENTATION_URLS[apiName] ||
	`https://www.google.com/search?q=${encodeURIComponent(`${apiName} API documentation`)}`;

// API preferences interface
interface ApiPreference {
	id: string;
	isLocked: boolean;
	isIgnored: boolean;
}

interface CardGeneratorProps {
	loading: boolean;
	hasLowBalance: boolean;
	hasNoCards: boolean;
	completionRate: number;
	totalCards: number;
	error: string;
	onGenerateCard: (selectedApis?: string[]) => void;
	onClearNewCard?: () => void;
	newCard?: CardData | null;
}

const CardGenerator: React.FC<CardGeneratorProps> = memo(
	function CardGenerator({
		loading,
		hasLowBalance,
		hasNoCards,
		error,
		onGenerateCard,
		newCard,
	}) {
		const [selectedAPIs, setSelectedAPIs] = useState<typeof ALL_APIS>([]);
		const [isSpinning, setIsSpinning] = useState(false);
		const [highlightedIndices, setHighlightedIndices] = useState<number[]>([]);
		const [finalSelectedIndices, setFinalSelectedIndices] = useState<number[]>(
			[],
		);
		const [generatedTitle, setGeneratedTitle] = useState<string | null>(null);

		// Tab state for mobile/vertical layout
		const [activeTab, setActiveTab] = useState<"generator" | "apis">(
			"generator",
		);

		// API preferences state
		const [apiPreferences, setApiPreferences] = useState<
			Record<string, ApiPreference>
		>({});
		const [preferencesLoading, setPreferencesLoading] = useState(true);
		const [databaseApis, setDatabaseApis] = useState<
			Array<{ id: string; name: string; isLocked: boolean; isIgnored: boolean }>
		>([]);
		const [unlimitedCoins, setUnlimitedCoins] = useState(false);

		const containerRef = useRef<HTMLDivElement>(null);
		const apiRefs = useRef<(HTMLDivElement | null)[]>([]);
		const cardDisplayDesktopRef = useRef<HTMLDivElement>(null);
		const cardDisplayMobileRef = useRef<HTMLDivElement>(null);
		const lastConfettiCardId = useRef<string | null>(null);

		// Fetch API preferences on component mount
		useEffect(() => {
			const fetchApiPreferences = async () => {
				try {
					const response = await fetch("/api/apis");
					if (response.ok) {
						const apis = await response.json();
						setDatabaseApis(apis);
						// Loaded APIs from database

						const preferences: Record<string, ApiPreference> = {};

						apis.forEach(
							(api: {
								id: string;
								name: string;
								isLocked: boolean;
								isIgnored: boolean;
							}) => {
								// Create mapping by name to match with ALL_APIS array
								const staticApi = ALL_APIS.find((a) => a.name === api.name);
								if (staticApi) {
									preferences[staticApi.id] = {
										id: api.id, // Use database ID for API calls
										isLocked: api.isLocked || false,
										isIgnored: api.isIgnored || false,
									};
									// API mapping completed
								} else {
									// No static API found for database API
								}
							},
						);

						// Final preferences mapping loaded
						setApiPreferences(preferences);
					}
				} catch (error) {
					console.error("Failed to fetch API preferences:", error);
				} finally {
					setPreferencesLoading(false);
				}
			};

			fetchApiPreferences();
		}, []);

		// Handle preference changes
		const handlePreferenceChange = async (
			staticApiId: string,
			preferenceType: "lock" | "ignore",
			value: boolean,
		) => {
			try {
				// Get the database API ID from preferences
				const preference = apiPreferences[staticApiId];
				if (!preference) {
					console.error(
						"🚫 [PREFERENCE] API preference not found for:",
						staticApiId,
					);
					console.log(
						"🚫 [PREFERENCE] Available preferences:",
						Object.keys(apiPreferences),
					);
					return;
				}

				// Updating preference

				const response = await fetch("/api/apis/preferences", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						apiId: preference.id, // Use database ID
						preferenceType,
						value,
					}),
				});

				if (response.ok) {
					// Preference updated successfully
					setApiPreferences((prev) => ({
						...prev,
						[staticApiId]: {
							...prev[staticApiId],
							isLocked:
								preferenceType === "lock"
									? value
									: value
										? false
										: prev[staticApiId]?.isLocked || false,
							isIgnored:
								preferenceType === "ignore"
									? value
									: value
										? false
										: prev[staticApiId]?.isIgnored || false,
						},
					}));
				} else {
					const errorData = await response.json();
					console.error(
						"❌ [PREFERENCE] Failed to update preference:",
						errorData.message || "Unknown error",
					);
				}
			} catch (error) {
				console.error("❌ [PREFERENCE] Failed to update preference:", error);
			}
		};

		// Handle reset all preferences
		const handleResetAllPreferences = async () => {
			try {
				// Starting reset all preferences

				// Get all APIs that have preferences set
				const apisWithPreferences = Object.keys(apiPreferences).filter(
					(staticApiId) => {
						const pref = apiPreferences[staticApiId];
						return pref?.isLocked || pref?.isIgnored;
					},
				);

				if (apisWithPreferences.length === 0) {
					// No preferences to reset
					return;
				}

				// Reset each API preference
				const resetPromises = apisWithPreferences.map(async (staticApiId) => {
					const preference = apiPreferences[staticApiId];
					if (!preference) return;

					// Reset both lock and ignore to false
					const response = await fetch("/api/apis/preferences", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							apiId: preference.id, // Use database ID
							preferenceType: "reset", // Special type for clearing all
							value: false,
						}),
					});

					if (!response.ok) {
						const errorData = await response.json();
						console.error(
							`❌ [RESET] Failed to reset ${staticApiId}:`,
							errorData.message,
						);
						return false;
					}
					return true;
				});

				const results = await Promise.all(resetPromises);
				const successCount = results.filter(Boolean).length;

				if (successCount === apisWithPreferences.length) {
					// Successfully reset API preferences

					// Update local state to clear all preferences
					setApiPreferences((prev) => {
						const updated = { ...prev };
						Object.keys(updated).forEach((staticApiId) => {
							if (updated[staticApiId]) {
								updated[staticApiId] = {
									...updated[staticApiId],
									isLocked: false,
									isIgnored: false,
								};
							}
						});
						return updated;
					});
				} else {
					console.error(
						`❌ [RESET] Only ${successCount}/${apisWithPreferences.length} preferences were reset`,
					);
				}
			} catch (error) {
				console.error("❌ [RESET] Failed to reset preferences:", error);
			}
		};

		// Realistic confetti effect - fires from center of card
		const fireConfetti = useCallback(() => {
			let originX = 0.5; // Default to center of screen
			let originY = 0.6; // Slightly below center

			// Determine which layout is active based on screen size
			const isMobileLayout = window.innerWidth <= 768;
			const activeCardRef = isMobileLayout ? cardDisplayMobileRef.current : cardDisplayDesktopRef.current;

			if (activeCardRef) {
				// Calculate the center position of the card display relative to viewport
				const cardRect = activeCardRef.getBoundingClientRect();
				const cardCenterX = (cardRect.left + cardRect.right) / 2;
				const cardCenterY = (cardRect.top + cardRect.bottom) / 2;

				// Convert to relative coordinates (0-1 range)
				originX = cardCenterX / window.innerWidth;
				originY = cardCenterY / window.innerHeight;

				// Firing confetti from card position
			} else {
				// Card ref not available, using default center position
			}

			const count = 200;
			const defaults = {
				origin: { x: originX, y: originY },
			};

			function fire(particleRatio: number, opts: confetti.Options) {
				confetti({
					...defaults,
					...opts,
					particleCount: Math.floor(count * particleRatio),
				});
			}

			fire(0.25, {
				spread: 26,
				startVelocity: 55,
			});
			fire(0.2, {
				spread: 60,
			});
			fire(0.35, {
				spread: 100,
				decay: 0.91,
				scalar: 0.8,
			});
			fire(0.1, {
				spread: 120,
				startVelocity: 25,
				decay: 0.92,
				scalar: 1.2,
			});
			fire(0.1, {
				spread: 120,
				startVelocity: 45,
			});
		}, []);

		// Component cleanup
		useEffect(() => {
			return () => {
				// Reset all tile scales on unmount
				apiRefs.current.forEach((ref) => {
					if (ref) {
						gsap.set(ref, { scale: 1 });
					}
				});
			};
		}, []);

		// Reset tiles when spinning stops
		useEffect(() => {
			if (!isSpinning && !loading) {
				// Ensure all tiles return to default scale when not spinning
				setTimeout(() => {
					apiRefs.current.forEach((ref) => {
						if (ref) {
							gsap.set(ref, { scale: 1 });
						}
					});
				}, 100); // Small delay to allow any final animations to complete
			}
		}, [isSpinning, loading]);

		// Update generated title and selected APIs when new card is generated
		useEffect(() => {
			if (newCard && newCard.title && !loading) {
				// Card generated successfully
				setGeneratedTitle(newCard.title);

				// Trigger confetti celebration for new card generation (only once per card)
				if (lastConfettiCardId.current !== newCard.id) {
					lastConfettiCardId.current = newCard.id;
					setTimeout(() => {
						fireConfetti();
					}, 100);
				}

				// Update selected APIs based on the generated card
				if (newCard.apis) {
					try {
						const cardApiNames =
							typeof newCard.apis === "string"
								? JSON.parse(newCard.apis)
								: newCard.apis;
						const matchingApis = cardApiNames
							.map((apiName: string) => {
								return ALL_APIS.find((api) => api.name === apiName);
							})
							.filter(
								(
									api: (typeof ALL_APIS)[0] | undefined,
								): api is (typeof ALL_APIS)[0] => Boolean(api),
							);

						if (matchingApis.length === 2) {
							// Updating selectedAPIs to match generated card
							setSelectedAPIs(matchingApis);
							// Update final selected indices for visual state
							const indices = matchingApis.map((api: (typeof ALL_APIS)[0]) =>
								ALL_APIS.findIndex((a) => a.id === api.id),
							);
							setFinalSelectedIndices(indices);
						}
					} catch (error) {
						console.error("Error parsing APIs from card:", error);
					}
				}
			}
		}, [newCard?.id, loading]);

		// Simple random selection animation
		const runSelectionAnimation = useCallback(() => {
			if ((hasLowBalance && !unlimitedCoins) || loading) return;

			// Check if we have enough available APIs for generation
			const availableApiCount = ALL_APIS.filter((api) => {
				const preference = apiPreferences[api.id];
				return !preference?.isIgnored;
			}).length;

			if (availableApiCount < 2) {
				// Not enough available APIs for card generation
				return;
			}

			// Switch to APIs tab on mobile to show animation
			setActiveTab("apis");
			setIsSpinning(true);
			setHighlightedIndices([]);
			setFinalSelectedIndices([]);
			setSelectedAPIs([]);
			setGeneratedTitle(null);

			// Starting selection animation

			// Get locked and available API indices
			const lockedIndices = ALL_APIS.map((api, index) => ({ api, index }))
				.filter(({ api }) => {
					const preference = apiPreferences[api.id];
					return preference?.isLocked;
				})
				.map(({ index }) => index);

			const availableIndices = ALL_APIS.map((api, index) => ({ api, index }))
				.filter(({ api }) => {
					const preference = apiPreferences[api.id];
					return !preference?.isIgnored;
				})
				.map(({ index }) => index);

			// Create a sequence of random highlights
			let highlightCount = 0;
			const maxHighlights = 15;

			const animateHighlight = () => {
				if (highlightCount < maxHighlights) {
					// Random indices for highlighting - exactly 2 items
					const randomIndices: number[] = [];

					// If we have locked APIs, ALWAYS include one locked API
					if (lockedIndices.length > 0) {
						const randomLockedIndex =
							lockedIndices[Math.floor(Math.random() * lockedIndices.length)];
						randomIndices.push(randomLockedIndex);
					}

					// Add random available APIs until we have exactly 2
					while (
						randomIndices.length < 2 &&
						availableIndices.length > randomIndices.length
					) {
						const remainingAvailableIndices = availableIndices.filter(
							(index) => !randomIndices.includes(index),
						);
						if (remainingAvailableIndices.length > 0) {
							const randomAvailableIndex =
								remainingAvailableIndices[
									Math.floor(Math.random() * remainingAvailableIndices.length)
								];
							randomIndices.push(randomAvailableIndex);
						} else {
							break;
						}
					}

					setHighlightedIndices(randomIndices);

					// Animate the highlighted cards
					randomIndices.forEach((index) => {
						if (apiRefs.current[index]) {
							gsap.to(apiRefs.current[index], {
								scale: 1.02,
								duration: 0.1,
								ease: "power2.out",
								yoyo: true,
								repeat: 1,
							});
						}
					});

					highlightCount++;
					setTimeout(animateHighlight, 100 + highlightCount * 10);
				} else {
					// Animation complete, reset all tiles to default scale
					apiRefs.current.forEach((ref) => {
						if (ref) {
							gsap.set(ref, { scale: 1 });
						}
					});

					setHighlightedIndices([]);
					// Calling backend to generate card
					setIsSpinning(false);
					// Switch back to generator tab to show result
					setActiveTab("generator");
					onGenerateCard();
				}
			};

			animateHighlight();
		}, [hasLowBalance, loading, onGenerateCard, unlimitedCoins]);

		return (
			<section className={styles.cardGenerator} ref={containerRef}>
				{/* Two Column Layout */}
				<div className={styles.generatorContent}>
					{/* Left Column - Generation & Results */}
					<div className={styles.leftColumn}>
						{/* Generation Panel */}
						<div className={styles.generationPanel}>
							{/* <h3 className={styles.panelTitle}>Generate Card</h3> */}
							{/* <p className={styles.panelSubtitle}> */}
							{/* 	Combine 2 APIs to create an innovative app idea */}
							{/* </p> */}

							<h3 className={styles.panelTitle}>
								{hasNoCards
									? "Create Your First Idea"
									: "Generate New Combination"}
							</h3>
							{/* <p className={styles.panelSubtitle}> */}
							{/* 	{hasNoCards */}
							{/* 		? "Customize your preferences and generate your first innovative app idea" */}
							{/* 		: "Use locked/ignored preferences to find the perfect API combination"} */}
							{/* </p> */}

							<button
								className={`${styles.generateButton} ${(hasLowBalance && !unlimitedCoins) || loading || isSpinning ? styles.disabled : ""}`}
								onClick={runSelectionAnimation}
								disabled={
									(hasLowBalance && !unlimitedCoins) || loading || isSpinning
								}
								title={
									hasLowBalance && !unlimitedCoins
										? "Insufficient coins (need 15 coins)"
										: "Generate new card (15 coins)"
								}
							>
								{loading ? (
									<span className={styles.buttonContent}>
										<span className={styles.loadingSpinner}></span>
										Generating...
									</span>
								) : isSpinning ? (
									<span className={styles.buttonContent}>
										<span className={styles.spinIcon}>🎲</span>
										Spinning...
									</span>
								) : (
									<span className={styles.buttonContent}>
										<span className={styles.generateIcon}>🎯</span>
										Generate Card {unlimitedCoins ? "(FREE)" : "(15 coins)"}
									</span>
								)}
							</button>

							{/* Spin Animation Indicator */}
							{isSpinning && (
								<div className={styles.spinIndicator}>
									<div className={styles.spinIndicatorContent}>
										<span className={styles.spinIndicatorIcon}>🎲</span>
										<span className={styles.spinIndicatorText}>
											Spinning APIs below...
										</span>
										<div className={styles.spinIndicatorArrow}>↓</div>
									</div>
								</div>
							)}

							{/* Unlimited Coins Toggle */}
							{/* <div className={styles.toggleContainer}> */}
							{/* 	<label className={styles.toggleLabel}> */}
							{/* 		<input */}
							{/* 			type="checkbox" */}
							{/* 			checked={unlimitedCoins} */}
							{/* 			onChange={(e) => setUnlimitedCoins(e.target.checked)} */}
							{/* 			className={styles.toggleInput} */}
							{/* 		/> */}
							{/* 		<span className={styles.toggleSlider}></span> */}
							{/* 		<span className={styles.toggleText}>Unlimited Coins</span> */}
							{/* 	</label> */}
							{/* </div> */}

							{/* Alerts */}
							{hasLowBalance && !unlimitedCoins && (
								<div className={styles.alert}>
									<span className={styles.alertText}>
										You need 15 coins to generate a new card.
									</span>
									<Link href="/shop" className={styles.alertButton}>
										Get Coins
									</Link>
								</div>
							)}

							{error && (
								<div className={styles.alertError}>
									<span className={styles.alertText}>{error}</span>
								</div>
							)}

							{/* Card Result Panel */}
							{newCard && !loading ? (
								<>
									{/* <h3 className={styles.cardResultTitle}>Generated Card</h3> */}
									<div className={styles.cardDisplay} ref={cardDisplayDesktopRef}>
										<Card
											card={newCard}
											onCardClick={(cardId) =>
												(window.location.href = `/card/${cardId}`)
											}
											compact={false}
										/>
									</div>
								</>
							) : (
								<div className={styles.cardPlaceholder}>
									<div className={styles.placeholderIcon}>🎴</div>
									<div className={styles.placeholderText}>
										{loading ? "Generating..." : "No card generated yet"}
									</div>
									{!loading && (
										<div className={styles.placeholderSubtext}>
											Click "Generate Card" to create your first idea
										</div>
									)}
								</div>
							)}
						</div>
					</div>

					{/* Right Column - API Selection */}
					<div className={styles.rightColumn}>
						{/* <h2 className={styles.apiSectionTitle}>API Selection</h2> */}

						{/* Preference Summary */}
						{!preferencesLoading && (
							<div className={styles.preferenceSummary}>
								<div className={styles.preferenceCounts}>
									{Object.values(apiPreferences).some((p) => p.isLocked) && (
										<span className={styles.lockedSummary}>
											{
												Object.values(apiPreferences).filter((p) => p.isLocked)
													.length
											}{" "}
											locked
										</span>
									)}
									{Object.values(apiPreferences).some((p) => p.isIgnored) && (
										<span className={styles.ignoredSummary}>
											{
												Object.values(apiPreferences).filter((p) => p.isIgnored)
													.length
											}{" "}
											ignored
										</span>
									)}
									{!Object.values(apiPreferences).some(
										(p) => p.isLocked || p.isIgnored,
									) && (
										<span className={styles.noPreferences}>
											All APIs available
										</span>
									)}
								</div>

								<p className={styles.panelSubtitle}>
									{hasNoCards
										? "Customize your preferences and generate your first innovative app idea"
										: "Use locked/ignored preferences to find the perfect API combination"}
								</p>
								{Object.values(apiPreferences).some(
									(p) => p.isLocked || p.isIgnored,
								) && (
									<button
										className={styles.resetAllButton}
										onClick={handleResetAllPreferences}
										title="Clear all locked and ignored APIs"
									>
										Reset All
									</button>
								)}
							</div>
						)}

						{/* API Grid */}
						<div className={styles.apiGridContainer}>
							<div className={styles.apiGrid}>
								{ALL_APIS.map((api, index) => {
									const isHighlighted = highlightedIndices.includes(index);
									const isFinalSelected = finalSelectedIndices.includes(index);
									const preference = apiPreferences[api.id];
									const isLocked = preference?.isLocked || false;
									const isIgnored = preference?.isIgnored || false;

									// Determine if API name is long (for responsive text sizing)
									const isLongName = api.name.length > 12;

									return (
										<div
											key={api.id}
											ref={(el) => {
												apiRefs.current[index] = el;
											}}
											className={`
										${styles.apiTile}
										${isHighlighted ? styles.highlighted : ""}
										${isFinalSelected ? styles.selected : ""}
										${isSpinning && !isHighlighted && !isFinalSelected ? styles.dimmed : ""}
										${isLocked ? styles.locked : ""}
										${isIgnored ? styles.ignored : ""}
									`.trim()}
										>
											{/* Ignore button - top left */}
											<button
												className={`${styles.preferenceButton} ${styles.ignoreButton} ${isIgnored ? styles.active : ""}`}
												onClick={(e) => {
													e.stopPropagation();
													handlePreferenceChange(api.id, "ignore", !isIgnored);
												}}
												title={
													isIgnored
														? "Remove from ignore list"
														: "Ignore this API"
												}
												disabled={preferencesLoading}
											>
												🚫
											</button>

											{/* Lock button - top right */}
											<button
												className={`${styles.preferenceButton} ${styles.lockButton} ${isLocked ? styles.active : ""}`}
												onClick={(e) => {
													e.stopPropagation();
													handlePreferenceChange(api.id, "lock", !isLocked);
												}}
												title={
													isLocked
														? "Remove from locked list"
														: "Always include this API"
												}
												disabled={preferencesLoading}
											>
												🔒
											</button>

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

											{/* Documentation Button */}
											<a
												href={getApiDocumentationUrl(api.name)}
												target="_blank"
												rel="noopener noreferrer"
												className={styles.docButton}
												onClick={(e) => e.stopPropagation()}
												title={`View ${api.name} documentation`}
											>
												<span className={styles.docIcon}>📚</span>
												Docs
											</a>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</div>

				{/* Tabbed Layout for Vertical Orientation */}
				<div className={styles.tabbedContainer}>
					<div className={styles.tabButtons}>
						<button
							className={`${styles.tabButton} ${activeTab === "generator" ? styles.active : ""}`}
							onClick={() => setActiveTab("generator")}
						>
							🎯 Generate Card
						</button>
						<button
							className={`${styles.tabButton} ${activeTab === "apis" ? styles.active : ""} ${isSpinning ? styles.hasNotification : ""}`}
							onClick={() => setActiveTab("apis")}
						>
							⚡ API Selection
						</button>
					</div>

					<div className={styles.tabContent}>
						{/* Generator Tab Panel */}
						<div
							className={`${styles.tabPanel} ${activeTab === "generator" ? styles.active : ""}`}
						>
							{/* Generation Panel */}
							<div className={styles.generationPanel}>
								<h3 className={styles.panelTitle}>
									{hasNoCards
										? "Create Your First Idea"
										: "Generate New Combination"}
								</h3>
								{/* <p className={styles.panelSubtitle}> */}
								{/* 	{hasNoCards */}
								{/* 		? "Customize your preferences and generate your first innovative app idea" */}
								{/* 		: "Use locked/ignored preferences to find the perfect API combination"} */}
								{/* </p> */}

								<button
									className={`${styles.generateButton} ${(hasLowBalance && !unlimitedCoins) || loading || isSpinning ? styles.disabled : ""}`}
									onClick={runSelectionAnimation}
									disabled={
										(hasLowBalance && !unlimitedCoins) || loading || isSpinning
									}
									title={
										hasLowBalance && !unlimitedCoins
											? "Insufficient coins (need 15 coins)"
											: "Generate new card (15 coins)"
									}
								>
									{loading ? (
										<span className={styles.buttonContent}>
											<span className={styles.loadingSpinner}></span>
											Generating...
										</span>
									) : isSpinning ? (
										<span className={styles.buttonContent}>
											<span className={styles.spinIcon}>🎲</span>
											Spinning...
										</span>
									) : (
										<span className={styles.buttonContent}>
											<span className={styles.generateIcon}>🎯</span>
											Generate Card {unlimitedCoins ? "(FREE)" : "(15 coins)"}
										</span>
									)}
								</button>

								{/* Alerts */}
								{hasLowBalance && !unlimitedCoins && (
									<div className={styles.alert}>
										<span className={styles.alertText}>
											You need 15 coins to generate a new card.
										</span>
										<Link href="/shop" className={styles.alertButton}>
											Get Coins
										</Link>
									</div>
								)}

								{error && (
									<div className={styles.alertError}>
										<span className={styles.alertText}>{error}</span>
									</div>
								)}

								{/* Card Result Panel */}
								{newCard && !loading ? (
									<>
										<div className={styles.cardDisplay} ref={cardDisplayMobileRef}>
											<Card
												card={newCard}
												onCardClick={(cardId) =>
													(window.location.href = `/card/${cardId}`)
												}
												compact={false}
											/>
										</div>
									</>
								) : (
									<div className={styles.cardPlaceholder}>
										<div className={styles.placeholderIcon}>🎴</div>
										<div className={styles.placeholderText}>
											{loading ? "Generating..." : "No card generated yet"}
										</div>
										{!loading && (
											<div className={styles.placeholderSubtext}>
												Click "Generate Card" to create your first idea
											</div>
										)}
									</div>
								)}
							</div>
						</div>

						{/* APIs Tab Panel */}
						<div
							className={`${styles.tabPanel} ${activeTab === "apis" ? styles.active : ""}`}
						>
							{/* Preference Summary */}
							{!preferencesLoading && (
								<div className={styles.preferenceSummary}>
									<div className={styles.preferenceCounts}>
										{Object.values(apiPreferences).some((p) => p.isLocked) && (
											<span className={styles.lockedSummary}>
												{
													Object.values(apiPreferences).filter(
														(p) => p.isLocked,
													).length
												}{" "}
												locked
											</span>
										)}
										{Object.values(apiPreferences).some((p) => p.isIgnored) && (
											<span className={styles.ignoredSummary}>
												{
													Object.values(apiPreferences).filter(
														(p) => p.isIgnored,
													).length
												}{" "}
												ignored
											</span>
										)}
										{!Object.values(apiPreferences).some(
											(p) => p.isLocked || p.isIgnored,
										) && (
											<span className={styles.noPreferences}>
												All APIs available
											</span>
										)}
									</div>

									<p className={styles.panelSubtitle}>
										{hasNoCards
											? "Customize your preferences and generate your first innovative app idea"
											: "Use locked/ignored preferences to find the perfect API combination"}
									</p>
									{Object.values(apiPreferences).some(
										(p) => p.isLocked || p.isIgnored,
									) && (
										<button
											className={styles.resetAllButton}
											onClick={handleResetAllPreferences}
											title="Clear all locked and ignored APIs"
										>
											Reset All
										</button>
									)}
								</div>
							)}

							{/* API Grid */}
							<div className={styles.apiGridContainer}>
								<div className={styles.apiGrid}>
									{ALL_APIS.map((api, index) => {
										const isHighlighted = highlightedIndices.includes(index);
										const isFinalSelected =
											finalSelectedIndices.includes(index);
										const preference = apiPreferences[api.id];
										const isLocked = preference?.isLocked || false;
										const isIgnored = preference?.isIgnored || false;

										// Determine if API name is long (for responsive text sizing)
										const isLongName = api.name.length > 12;

										return (
											<div
												key={api.id}
												ref={(el) => {
													apiRefs.current[index] = el;
												}}
												className={`
												${styles.apiTile}
												${isHighlighted ? styles.highlighted : ""}
												${isFinalSelected ? styles.selected : ""}
												${isSpinning && !isHighlighted && !isFinalSelected ? styles.dimmed : ""}
												${isLocked ? styles.locked : ""}
												${isIgnored ? styles.ignored : ""}
											`.trim()}
											>
												{/* Ignore button - top left */}
												<button
													className={`${styles.preferenceButton} ${styles.ignoreButton} ${isIgnored ? styles.active : ""}`}
													onClick={(e) => {
														e.stopPropagation();
														handlePreferenceChange(
															api.id,
															"ignore",
															!isIgnored,
														);
													}}
													title={
														isIgnored
															? "Remove from ignore list"
															: "Ignore this API"
													}
													disabled={preferencesLoading}
												>
													🚫
												</button>

												{/* Lock button - top right */}
												<button
													className={`${styles.preferenceButton} ${styles.lockButton} ${isLocked ? styles.active : ""}`}
													onClick={(e) => {
														e.stopPropagation();
														handlePreferenceChange(api.id, "lock", !isLocked);
													}}
													title={
														isLocked
															? "Remove from locked list"
															: "Always include this API"
													}
													disabled={preferencesLoading}
												>
													🔒
												</button>

												<div className={styles.apiTileContent}>
													<span className={styles.apiTileEmoji}>
														{api.emoji}
													</span>
													<span
														className={styles.apiTileName}
														data-long={isLongName}
														title={api.name}
													>
														{api.name}
													</span>
												</div>

												{/* Documentation Button */}
												<a
													href={getApiDocumentationUrl(api.name)}
													target="_blank"
													rel="noopener noreferrer"
													className={styles.docButton}
													onClick={(e) => e.stopPropagation()}
													title={`View ${api.name} documentation`}
												>
													<span className={styles.docIcon}>📚</span>
													Docs
												</a>
											</div>
										);
									})}
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		);
	},
);

export default CardGenerator;
