import { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import { useSession, signOut } from "next-auth/react";
import { formatNumber } from "@/lib/card-utils";
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/auth/AuthGuard";
import styles from "@/styles/pages/settings.module.css";

interface UserStats {
	totalCards: number;
	totalSpent: number;
	memberSince: string;
}

export default function SettingsPage(): JSX.Element {
	const { data: session } = useSession();
	const [activeTab, setActiveTab] = useState<"account">("account");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<{
		type: "success" | "error" | "info";
		text: string;
	} | null>(null);
	const [userStats, setUserStats] = useState<UserStats | null>(null);
	const [formData, setFormData] = useState({
		username: session?.user.username || "",
		email: session?.user.email || "",
	});

	useEffect(() => {
		if (session) {
			setFormData((prev) => ({
				...prev,
				username: session.user.username || "",
				email: session.user.email || "",
			}));
			fetchUserStats();
		}
	}, [session]);

	const fetchUserStats = async (): Promise<void> => {
		try {
			const response = await fetch("/api/user/stats");
			if (response.ok) {
				const stats = await response.json();
				setUserStats(stats);
			}
		} catch (err) {
			console.error("Failed to fetch user stats:", err);
		}
	};

	const updateProfile = async (): Promise<void> => {
		setLoading(true);
		try {
			const response = await fetch("/api/user/profile", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					username: formData.username,
					email: formData.email,
				}),
			});

			if (response.ok) {
				setMessage({ type: "success", text: "Profile updated successfully!" });
			} else {
				setMessage({
					type: "error",
					text: "Failed to update profile. Please try again.",
				});
			}
		} catch (err) {
			setMessage({
				type: "error",
				text: "Something went wrong. Please try again.",
			});
		} finally {
			setLoading(false);
		}
	};

	const resetDeck = async (): Promise<void> => {
		if (
			!confirm(
				"Are you sure you want to delete all your cards? This action cannot be undone.",
			)
		) {
			return;
		}

		setLoading(true);
		try {
			const response = await fetch("/api/cards/reset", {
				method: "DELETE",
			});

			if (response.ok) {
				setMessage({
					type: "success",
					text: "All cards have been deleted successfully.",
				});
				fetchUserStats();
			} else {
				setMessage({
					type: "error",
					text: "Failed to reset deck. Please try again.",
				});
			}
		} catch (err) {
			setMessage({
				type: "error",
				text: "Something went wrong. Please try again.",
			});
		} finally {
			setLoading(false);
		}
	};

	const exportData = async (): Promise<void> => {
		setLoading(true);
		try {
			const response = await fetch("/api/user/export", {
				method: "POST",
			});

			if (response.ok) {
				const blob = await response.blob();
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `apideas-data-${new Date().toISOString().split("T")[0]}.json`;
				a.click();
				window.URL.revokeObjectURL(url);
				setMessage({ type: "success", text: "Data exported successfully!" });
			} else {
				setMessage({
					type: "error",
					text: "Failed to export data. Please try again.",
				});
			}
		} catch (err) {
			setMessage({
				type: "error",
				text: "Something went wrong. Please try again.",
			});
		} finally {
			setLoading(false);
		}
	};

	const deleteAccount = async (): Promise<void> => {
		const confirmation = prompt(
			'Are you sure you want to delete your account? This will permanently delete all your data. Type "DELETE" to confirm:',
		);

		if (confirmation !== "DELETE") {
			return;
		}

		setLoading(true);
		try {
			const response = await fetch("/api/auth/delete-account", {
				method: "DELETE",
			});

			if (response.ok) {
				await signOut({ callbackUrl: "/" });
			} else {
				setMessage({
					type: "error",
					text: "Failed to delete account. Please try again.",
				});
			}
		} catch (err) {
			setMessage({
				type: "error",
				text: "Something went wrong. Please try again.",
			});
		} finally {
			setLoading(false);
		}
	};

	const clearMessage = () => {
		setMessage(null);
	};

	return (
		<AuthGuard requireAuth>
			<Navbar />
			<div className={styles.settingsPage}>
				<div className={styles.settingsContainer}>
					{/* Minimal Header */}
					<header className={styles.settingsHeader}>
						<h1 className={styles.settingsTitle}>Settings</h1>
						{/* <p className={styles.settingsSubtitle}> */}
						{/* 	{userStats */}
						{/* 		? `${userStats.totalCards} cards • ${formatNumber(session?.user.coinBalance || 0)} coins` */}
						{/* 		: "Loading..."} */}
						{/* </p> */}
					</header>

					{/* Minimal Alert */}
					{message && (
						<div
							className={`${styles.alert} ${styles[`alert${message.type.charAt(0).toUpperCase() + message.type.slice(1)}`]}`}
						>
							{message.text}
							<button onClick={clearMessage} className={styles.alertClose}>
								×
							</button>
						</div>
					)}

					{/* Unified Content */}
					<main className={styles.settingsContent}>
						<div className={styles.contentSection}>
							{/* Profile Section */}
							{/* <h2 className={styles.sectionTitle}>Profile</h2> */}

							<div className={styles.formGroup}>
								<label>Username</label>
								<input
									type="text"
									className={styles.formInput}
									value={formData.username}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											username: e.target.value,
										}))
									}
									placeholder="Enter username"
								/>
							</div>

							<div className={styles.formGroup}>
								<label>Email</label>
								<input
									type="email"
									className={styles.formInput}
									value={formData.email}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											email: e.target.value,
										}))
									}
									placeholder="Enter email"
								/>
							</div>

							<button
								onClick={updateProfile}
								className={styles.btnPrimary}
								disabled={loading}
							>
								{loading ? "Updating..." : "Update Profile"}
							</button>
						</div>
						{/* Danger Zone */}
						<div className={styles.dangerZone}>
							<h2 className={styles.dangerTitle}>Danger zone</h2>
							<div className={styles.dangerItem}>
								<div>
									<h3>Reset collection</h3>
									<p>Delete all your generated cards</p>
								</div>
								<button
									onClick={resetDeck}
									className={styles.btnDanger}
									disabled={loading}
								>
									{loading ? "Resetting..." : "Reset cards"}
								</button>
							</div>
						</div>
					</main>
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
