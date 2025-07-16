import React, { useRef, useEffect, useMemo, useCallback } from "react";
// Assuming CardData is defined in a types file like this:
// export interface CardData {
//   id: string;
//   title: string;
//   subtitle?: string;
//   summary?: string;
//   apis: string[] | string;
//   rating: number;
//   rarity: string;
//   industry: string;
//   complexity?: string;
//   feasibility?: string;
// }
import { CardData } from "@/types";
import styles from "./Card.module.css";

// Constants
const API_DOCUMENTATION_URLS: Record<string, string> = {
	Stripe: "https://stripe.com/docs",
	Twilio: "https://www.twilio.com/docs",
	OpenWeatherMap: "https://openweathermap.org/api",
	NASA: "https://api.nasa.gov",
	Unsplash: "https://unsplash.com/developers",
	GitHub: "https://docs.github.com/en/rest",
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

const RARITY_CONFIG = {
	common: { label: "Common", color: "#64748B" },
	uncommon: { label: "Uncommon", color: "#059669" },
	rare: { label: "Rare", color: "#2563EB" },
	epic: { label: "Epic", color: "#7C3AED" },
	legendary: { label: "Legendary", color: "#D97706" },
} as const;

const ANIMATION_CONFIG = {
	rotationPower: 80,
	maxRotation: 8,
	scaleMultiplier: 0.03,
	opacityRange: [0.85, 1.0],
	smoothing: 0.6,
} as const;

// Types
type RarityKey = keyof typeof RARITY_CONFIG;

interface MousePosition {
	x: number;
	y: number;
}

interface CardTransform {
	rotateX: number;
	rotateY: number;
	scale: number;
	opacity: number;
	backgroundX: number;
	backgroundY: number;
	pointerX: number;
	pointerY: number;
	pointerFromCenter: number;
}

export interface CardProps {
	card: CardData;
	onCardClick?: (cardId: string) => void;
	compact?: boolean;
	className?: string;
	disabled?: boolean;
}

// Utility functions
const truncateText = (text: string, maxLength: number): string =>
	text.length <= maxLength ? text : `${text.slice(0, maxLength).trim()}...`;

const getApiDocumentationUrl = (apiName: string): string =>
	API_DOCUMENTATION_URLS[apiName] ||
	`https://www.google.com/search?q=${encodeURIComponent(`${apiName} API documentation`)}`;

const clamp = (value: number, min: number, max: number): number =>
	Math.max(min, Math.min(max, value));

const calculateTransform = (
	mouse: MousePosition,
	rect: DOMRect,
	config: typeof ANIMATION_CONFIG,
): CardTransform => {
	const centerX = rect.width / 2;
	const centerY = rect.height / 2;

	const rotateX = clamp(
		((centerY - mouse.y) / config.rotationPower) * config.maxRotation,
		-config.maxRotation,
		config.maxRotation,
	);
	const rotateY = clamp(
		((mouse.x - centerX) / config.rotationPower) * config.maxRotation,
		-config.maxRotation,
		config.maxRotation,
	);

	const pointerX = (mouse.x / rect.width) * 100;
	const pointerY = (mouse.y / rect.height) * 100;
	const pointerFromCenterX = Math.abs(50 - pointerX) / 50;
	const pointerFromCenterY = Math.abs(50 - pointerY) / 50;
	const pointerFromCenter = Math.sqrt(
		pointerFromCenterX ** 2 + pointerFromCenterY ** 2,
	);

	return {
		rotateX,
		rotateY,
		scale: 1 + pointerFromCenter * config.scaleMultiplier,
		opacity:
			config.opacityRange[0] +
			pointerFromCenter * (config.opacityRange[1] - config.opacityRange[0]),
		backgroundX: 50 + rotateY * config.smoothing,
		backgroundY: 50 + rotateX * config.smoothing,
		pointerX,
		pointerY,
		pointerFromCenter,
	};
};

// Main component
const Card = React.memo<CardProps>(
	({
		card,
		onCardClick,
		compact = false,
		className = "",
		disabled = false,
	}) => {
		const cardRef = useRef<HTMLDivElement>(null);

		// Memoized calculations
		const apiArray = useMemo(
			() => (typeof card.apis === "string" ? JSON.parse(card.apis) : card.apis),
			[card.apis],
		);

		const score = useMemo(() => Math.round(card.rating * 100), [card.rating]);

		const rarity = useMemo(() => {
			const rarityKey = card.rarity.toLowerCase() as RarityKey;
			return RARITY_CONFIG[rarityKey] || RARITY_CONFIG.common;
		}, [card.rarity]);

		const isHolo = useMemo(
			() => ["rare", "epic", "legendary"].includes(card.rarity.toLowerCase()),
			[card.rarity],
		);

		// Mouse tracking effect
		useEffect(() => {
			const cardElement = cardRef.current;
			if (!cardElement || disabled) return;

			let animationFrameId: number | null = null;

			const handleMouseMove = (e: MouseEvent): void => {
				if (animationFrameId) {
					cancelAnimationFrame(animationFrameId);
				}

				animationFrameId = requestAnimationFrame(() => {
					const rect = cardElement.getBoundingClientRect();
					const mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
					const transform = calculateTransform(mouse, rect, ANIMATION_CONFIG);

					Object.entries({
						"--pointer-x": `${transform.pointerX}%`,
						"--pointer-y": `${transform.pointerY}%`,
						"--rotate-x": `${transform.rotateX}deg`,
						"--rotate-y": `${transform.rotateY}deg`,
						"--background-x": `${transform.backgroundX}%`,
						"--background-y": `${transform.backgroundY}%`,
						"--pointer-from-center": `${transform.pointerFromCenter}`,
						"--card-opacity": `${transform.opacity}`,
						"--card-scale": `${transform.scale}`,
					}).forEach(([property, value]) => {
						cardElement.style.setProperty(property, value);
					});
				});
			};

			const handleMouseLeave = (): void => {
				if (animationFrameId) {
					cancelAnimationFrame(animationFrameId);
				}
				Object.entries({
					"--rotate-x": "0deg",
					"--rotate-y": "0deg",
					"--pointer-from-center": "0",
					"--card-opacity": "0.9",
					"--card-scale": "1",
				}).forEach(([property, value]) => {
					cardElement.style.setProperty(property, value);
				});
			};

			cardElement.addEventListener("mousemove", handleMouseMove);
			cardElement.addEventListener("mouseleave", handleMouseLeave);

			return () => {
				cardElement.removeEventListener("mousemove", handleMouseMove);
				cardElement.removeEventListener("mouseleave", handleMouseLeave);
				if (animationFrameId) {
					cancelAnimationFrame(animationFrameId);
				}
			};
		}, [disabled]);

		// Event handlers
		const handleApiClick = useCallback(
			(apiName: string, event: React.MouseEvent): void => {
				event.stopPropagation();
				window.open(
					getApiDocumentationUrl(apiName),
					"_blank",
					"noopener,noreferrer",
				);
			},
			[],
		);

		const handleCardClick = useCallback((): void => {
			if (onCardClick && !disabled) {
				onCardClick(card.id);
			}
		}, [onCardClick, card.id, disabled]);

		// Build class names
		const cardClasses = [
			styles.card,
			styles.cardVariables,
			styles.interactive,
			compact && styles.compact,
			onCardClick && !disabled && styles.clickable,
			disabled && styles.disabled,
			className,
		]
			.filter(Boolean)
			.join(" ");

		return (
			<article
				ref={cardRef}
				className={cardClasses}
				onClick={handleCardClick}
				data-rarity={card.rarity.toLowerCase()}
				style={{ "--rarity-color": rarity.color } as React.CSSProperties}
				role={onCardClick ? "button" : "article"}
				tabIndex={onCardClick && !disabled ? 0 : undefined}
				aria-label={onCardClick ? `View details for ${card.title}` : undefined}
				onKeyDown={(e) => {
					if (
						(e.key === "Enter" || e.key === " ") &&
						onCardClick &&
						!disabled
					) {
						e.preventDefault();
						handleCardClick();
					}
				}}
			>
				<div className={styles.cardTranslater}>
					<div className={styles.cardRotator}>
						<div className={styles.cardFront}>
							<div className={styles.cardContent}>
								{/* Header */}
								<header className={styles.cardHeader}>
									<div
										className={styles.rarityIndicator}
										style={{ backgroundColor: rarity.color }}
										aria-hidden="true"
									/>
									<div className={styles.cardMeta}>
										<span className={styles.industryBadge}>
											{card.industry}
										</span>
										<span
											className={styles.rarityLabel}
											aria-label={`Rarity: ${rarity.label}`}
										>
											{rarity.label}
										</span>
									</div>
								</header>

								{/* Title */}
								<div className={styles.titleSection}>
									<h3 className={styles.cardTitle} title={card.title}>
										{truncateText(card.title, 45)}
									</h3>
									{card.subtitle && (
										<p className={styles.cardSubtitle} title={card.subtitle}>
											{truncateText(card.subtitle, 60)}
										</p>
									)}
								</div>

								{/* APIs */}
								<div className={styles.apisSection}>
									<div className={styles.apisGrid} role="list">
										{apiArray.map((api: string, index: number) => (
											<button
												key={`${api}-${index}`}
												className={styles.apiLink}
												onClick={(e) => handleApiClick(api, e)}
												title={`View ${api} documentation`}
												aria-label={`Open ${api} API documentation in new tab`}
												role="listitem"
											>
												<span className={styles.apiName}>{api}</span>
												<svg
													className={styles.externalIcon}
													viewBox="0 0 16 16"
													fill="currentColor"
													aria-hidden="true"
												>
													<path d="M3.75 2A1.75 1.75 0 002 3.75v8.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0014 12.25v-3.5a.75.75 0 00-1.5 0v3.5a.25.25 0 01-.25.25h-8.5a.25.25 0 01-.25-.25v-8.5a.25.25 0 01.25-.25h3.5a.75.75 0 000-1.5h-3.5z" />
													<path d="M8.25 4.5a.75.75 0 000 1.5h2.51L6.47 9.28a.75.75 0 101.06 1.06L10.75 6.2v2.51a.75.75 0 001.5 0V4.5h-4z" />
												</svg>
											</button>
										))}
									</div>
								</div>

								{/* Score */}
								<div className={styles.scoreSection}>
									<div className={styles.scoreHeader}>
										<span className={styles.scoreLabel}>Innovation Score</span>
										<span
											className={styles.scoreValue}
											aria-label={`Score: ${score} out of 100`}
										>
											{score}%
										</span>
									</div>
									<div
										className={styles.scoreBar}
										role="progressbar"
										aria-valuenow={score}
										aria-valuemin={0}
										aria-valuemax={100}
										aria-label="Innovation score progress"
									>
										<div
											className={styles.scoreFill}
											style={{
												width: `${score}%`,
												backgroundColor: rarity.color,
											}}
										/>
									</div>
								</div>

								{/* Description */}
								{!compact && card.summary && (
									<div className={styles.descriptionSection}>
										<p className={styles.cardDescription} title={card.summary}>
											{truncateText(card.summary, 120)}
										</p>
									</div>
								)}

								{/* Stats */}
								{!compact && (
									<div className={styles.statsSection}>
										<div className={styles.statItem}>
											<span className={styles.statLabel}>Complexity</span>
											<span className={styles.statValue}>
												{card.complexity || "Medium"}
											</span>
										</div>
										<div className={styles.statItem}>
											<span className={styles.statLabel}>Feasibility</span>
											<span className={styles.statValue}>
												{card.feasibility || "High"}
											</span>
										</div>
									</div>
								)}
							</div>

							{/* All New Effect Layers */}
							{isHolo && (
								<div className={styles.holographic} aria-hidden="true" />
							)}
							<div className={styles.cardGlare} aria-hidden="true" />
							<div className={styles.cardShine} aria-hidden="true" />
							<div className={styles.grainOverlay} aria-hidden="true" />
						</div>
					</div>
				</div>
			</article>
		);
	},
);

Card.displayName = "Card";

export default Card;
