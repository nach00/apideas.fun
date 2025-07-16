import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Card from "@/components/Card";
import { CardData } from "@/types";
import styles from "./CardResult.module.css";

interface CardResultProps {
	card: CardData;
	onContinue: () => void;
}

const CardResult = React.memo(function CardResult({
	card,
	onContinue,
}: CardResultProps) {
	const router = useRouter();

	return (
		<section className={styles.resultSection}>
			<div className={styles.resultContainer}>
				<div className={styles.resultAnnouncement}>
					<div className={styles.celebrationIcon}>✨</div>
					<h2 className={styles.resultTitle}>Brilliant discovery!</h2>
					<p className={styles.resultSubtitle}>
						You&apos;ve unlocked a {card.rarity.toLowerCase()} combination
					</p>
				</div>

				<div className={styles.resultShowcase}>
					<div
						className={`${styles.resultGlow} ${styles[`rarity${card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1).toLowerCase()}`]}`}
					></div>
					<div className={styles.resultCard}>
						<Card
							card={card}
							onCardClick={(cardId: string) => router.push(`/card/${cardId}`)}
						/>
					</div>
				</div>

				<div className={styles.resultActions}>
					<Link href={`/card/${card.id}`} className={styles.actionPrimary}>
						<span>Explore Details</span>
						<svg
							className={styles.actionIcon}
							viewBox="0 0 16 16"
							fill="currentColor"
						>
							<path
								fillRule="evenodd"
								d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"
							/>
						</svg>
					</Link>
					<button className={styles.actionSecondary} onClick={onContinue}>
						<span>Continue Discovering</span>
					</button>
				</div>
			</div>
		</section>
	);
});

export default CardResult;
