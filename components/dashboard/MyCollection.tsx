import React, { useState, useMemo } from "react";
import { useRouter } from "next/router";
import Card from "@/components/Card";
import { CardData } from "@/types";
import styles from "./MyCollection.module.css";

interface MyCollectionProps {
	cards: CardData[];
	onCardUpdate?: (cardId: string, updates: Partial<CardData>) => void;
	onCardDelete?: (cardId: string) => void;
}

type SortOption = "rarity" | "recent" | "name";
type SortOrder = "asc" | "desc";

const MyCollection = React.memo(function MyCollection({
	cards,
	onCardUpdate,
	onCardDelete,
}: MyCollectionProps) {
	const router = useRouter();
	const [searchTerm, setSearchTerm] = useState("");
	const [rarityFilter, setRarityFilter] = useState("all");
	const [industryFilter, setIndustryFilter] = useState("all");
	const [sortBy, setSortBy] = useState<SortOption>("recent");
	const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

	// Rarity order for sorting
	const rarityOrder = {
		common: 1,
		uncommon: 2,
		rare: 3,
		epic: 4,
		legendary: 5,
	};

	// Get unique industries for filter dropdown
	const availableIndustries = useMemo(() => {
		const industries = new Set(cards.map((card) => card.industry));
		return Array.from(industries).sort();
	}, [cards]);

	// Filter and sort cards
	const filteredAndSortedCards = useMemo(() => {
		let filtered = cards.filter((card) => {
			const apiArray =
				typeof card.apis === "string" ? JSON.parse(card.apis) : card.apis;
			const matchesSearch =
				card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				card.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				apiArray.some((api: string) =>
					api.toLowerCase().includes(searchTerm.toLowerCase()),
				);

			const matchesRarity =
				rarityFilter === "all" || card.rarity.toLowerCase() === rarityFilter;
			const matchesIndustry =
				industryFilter === "all" || card.industry === industryFilter;

			return matchesSearch && matchesRarity && matchesIndustry;
		});

		// Sort the filtered cards - pinned cards always come first
		filtered.sort((a, b) => {
			// Pinned cards always come first
			if (a.pinned && !b.pinned) return -1;
			if (!a.pinned && b.pinned) return 1;

			// Both pinned or both not pinned - sort by selected criteria
			let comparison = 0;

			switch (sortBy) {
				case "rarity":
					const rarityA =
						rarityOrder[a.rarity.toLowerCase() as keyof typeof rarityOrder] ||
						0;
					const rarityB =
						rarityOrder[b.rarity.toLowerCase() as keyof typeof rarityOrder] ||
						0;
					comparison = rarityA - rarityB;
					break;
				case "recent":
					comparison =
						new Date(a.createdAt || "").getTime() -
						new Date(b.createdAt || "").getTime();
					break;
				case "name":
					comparison = a.title.localeCompare(b.title);
					break;
			}

			return sortOrder === "asc" ? comparison : -comparison;
		});

		return filtered;
	}, [cards, searchTerm, rarityFilter, industryFilter, sortBy, sortOrder]);

	const toggleSortOrder = () => {
		setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
	};

	const handlePinToggle = (cardId: string, currentPinned: boolean) => {
		if (onCardUpdate) {
			onCardUpdate(cardId, { pinned: !currentPinned });
		}
	};

	const handleDelete = (cardId: string, isPinned: boolean) => {
		if (isPinned) {
			// Pinned cards cannot be deleted
			return;
		}
		if (
			onCardDelete &&
			window.confirm(
				"Are you sure you want to delete this card? This action cannot be undone.",
			)
		) {
			onCardDelete(cardId);
		}
	};

	return (
		<section className={styles.myCollection}>
			<div className={styles.collectionContainer}>
				<div className={styles.collectionSection}>
					<header className={styles.collectionHeader}>
						<h2 className={styles.collectionTitle}>My Collection</h2>
						<div className={styles.collectionStats}>
							Showing {filteredAndSortedCards.length} of {cards.length} cards
						</div>
					</header>

					{/* Filter and Search Controls */}
					<div className={styles.controls}>
						<div className={styles.searchContainer}>
							<input
								type="text"
								placeholder="Search cards, APIs, or descriptions..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className={styles.searchInput}
							/>
						</div>

						<div className={styles.filtersContainer}>
							<select
								value={rarityFilter}
								onChange={(e) => setRarityFilter(e.target.value)}
								className={styles.filterSelect}
							>
								<option value="all">All Rarities</option>
								<option value="common">Common</option>
								<option value="uncommon">Uncommon</option>
								<option value="rare">Rare</option>
								<option value="epic">Epic</option>
								<option value="legendary">Legendary</option>
							</select>

							<select
								value={industryFilter}
								onChange={(e) => setIndustryFilter(e.target.value)}
								className={styles.filterSelect}
							>
								<option value="all">All Industries</option>
								{availableIndustries.map((industry) => (
									<option key={industry} value={industry}>
										{industry}
									</option>
								))}
							</select>

							<select
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value as SortOption)}
								className={styles.sortSelect}
							>
								<option value="recent">Sort by Recent</option>
								<option value="rarity">Sort by Rarity</option>
								<option value="name">Sort by Name</option>
							</select>

							<button
								onClick={toggleSortOrder}
								className={styles.sortOrderButton}
								title={`Currently ${sortOrder === "asc" ? "ascending" : "descending"}`}
							>
								{sortOrder === "asc" ? "↑" : "↓"}
							</button>
						</div>
					</div>

					{/* Cards Grid */}
					{filteredAndSortedCards.length > 0 ? (
						<div className={styles.collectionGrid}>
							{filteredAndSortedCards.map((card) => (
								<article key={card.id} className={styles.cardContainer}>
									<Card
										card={card}
										onCardClick={(cardId) => router.push(`/card/${cardId}`)}
										className={styles.cardWithActions}
										onPinToggle={handlePinToggle}
										onDelete={handleDelete}
										showActions={true}
									/>
								</article>
							))}
						</div>
					) : (
						<div className={styles.emptyState}>
							{cards.length === 0 ? (
								<p>
									No cards in your collection yet. Generate your first card
									above!
								</p>
							) : (
								<p>
									No cards match your current filters. Try adjusting your search
									or filters.
								</p>
							)}
						</div>
					)}
				</div>
			</div>
		</section>
	);
});

export default MyCollection;
