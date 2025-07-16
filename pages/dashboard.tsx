import { GetServerSideProps } from "next";
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/auth/AuthGuard";
import CardGenerator from "@/components/dashboard/CardGenerator";
import MyCollection from "@/components/dashboard/MyCollection";
import { useDashboard } from "@/hooks/useDashboard";

export default function Dashboard(): JSX.Element {
	console.log("🏠 [DASHBOARD] Dashboard component rendering", {
		timestamp: Date.now()
	});

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

	console.log("🏠 [DASHBOARD] useDashboard hook completed", {
		sessionExists: !!session,
		loading,
		hasNewCard: !!newCard,
		timestamp: Date.now()
	});

	if (!session) {
		return (
			<AuthGuard requireAuth>
				<div className="dashboard-page">
					<div className="dashboard-container">
						<div className="dashboard-loading">
							<div className="dashboard-loading-spinner" />
							<p className="dashboard-loading-text">Loading dashboard...</p>
						</div>
					</div>
				</div>
			</AuthGuard>
		);
	}

	return (
		<AuthGuard requireAuth>
			<Navbar />
			<div className="dashboard-page">
				<div className="dashboard-container">
					<main className="dashboard-main">
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
