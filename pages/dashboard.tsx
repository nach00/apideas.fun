import { GetServerSideProps } from "next";
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/auth/AuthGuard";
import CardGenerator from "@/components/dashboard/CardGenerator";
import MyCollection from "@/components/dashboard/MyCollection";
import { useDashboard } from "@/hooks/useDashboard";
import styles from "./dashboard.module.css";

export default function Dashboard(): JSX.Element {
	// Dashboard component rendering

	const {
		recentCards: allCards,
		loading,
		error,
		stats,
		newCard,
		session,
		hasLowBalance,
		completionRate,
		hasNoCards,
		generateCard,
		clearNewCard,
		updateCard,
		deleteCard,
	} = useDashboard();

	// Dashboard hook completed

	if (!session) {
		return (
			<AuthGuard requireAuth>
				<div className={styles.dashboardPage}>
					<div className={styles.dashboardContainer}>
						<div className={styles.dashboardLoading}>
							<div className={styles.dashboardLoadingSpinner} />
							<p className={styles.dashboardLoadingText}>Loading dashboard...</p>
						</div>
					</div>
				</div>
			</AuthGuard>
		);
	}

	return (
		<AuthGuard requireAuth>
			<Navbar />
			<div className={styles.dashboardPage}>
				<div className={styles.dashboardContainer}>
					<main className={styles.dashboardMain}>
						<CardGenerator
							loading={loading}
							hasLowBalance={hasLowBalance}
							hasNoCards={hasNoCards}
							completionRate={completionRate}
							totalCards={stats.totalCards}
							error={error}
							onGenerateCard={generateCard}
							onClearNewCard={clearNewCard}
							newCard={newCard}
						/>
					</main>

					<MyCollection
						cards={allCards}
						onCardUpdate={updateCard}
						onCardDelete={deleteCard}
					/>
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
