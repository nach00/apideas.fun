import { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import styles from "./login.module.css";

export default function LoginPage(): JSX.Element {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [showLogin, setShowLogin] = useState(true);
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		setError("");
		setLoading(true);

		console.log("=== LOGIN FORM SUBMISSION ===");
		console.log("📝 Form data:", {
			showLogin,
			email,
			hasPassword: !!password,
			timestamp: new Date().toISOString(),
		});

		try {
			if (showLogin) {
				// Login
				console.log("🔐 Attempting login with NextAuth signIn...");
				const result = await signIn("credentials", {
					email,
					password,
					redirect: false,
				});

				console.log("🔐 SignIn result:", {
					error: result?.error,
					ok: result?.ok,
					status: result?.status,
					url: result?.url,
				});

				if (result?.error) {
					console.log("❌ Login failed:", result.error);
					setError("Invalid email or password");
				} else {
					console.log("✅ Login successful, redirecting to dashboard...");
					router.push("/dashboard");
				}
			} else {
				// Register
				const response = await fetch("/api/auth/register", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email, username, password }),
				});

				const data = await response.json();

				if (response.ok) {
					// Auto-login after registration
					await signIn("credentials", {
						email,
						password,
						redirect: false,
					});
					router.push("/dashboard");
				} else {
					setError(data.message || "Registration failed");
				}
			}
		} catch (err) {
			setError("Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleOAuthSignIn = async (provider: string): Promise<void> => {
		await signIn(provider, { callbackUrl: "/dashboard" });
	};

	// Handle redirect for authenticated users
	useEffect(() => {
		console.log("=== LOGIN PAGE USEEFFECT ===");
		console.log("📊 Auth status check:", {
			status,
			hasSession: !!session,
			routerReady: router.isReady,
			sessionUser: session?.user,
			timestamp: new Date().toISOString(),
		});

		if (status === "authenticated" && session && router.isReady) {
			console.log("✅ User is authenticated, redirecting to dashboard...");
			router.push("/dashboard");
		} else if (status === "authenticated" && !session) {
			console.log("! Status is authenticated but no session object");
		} else if (status === "unauthenticated") {
			console.log("❌ User is unauthenticated");
		}
	}, [session, status, router]);

	// Show loading state while checking auth or redirecting
	if (status === "loading") {
		return (
			<div className={styles.loadingScreen}>
				<div className={styles.loadingContent}>
					<div className={styles.loadingSpinner} />
					<p>Loading...</p>
				</div>
			</div>
		);
	}

	// Show redirect screen for authenticated users
	if (session) {
		return (
			<div className={styles.loadingScreen}>
				<div className={styles.loadingContent}>
					<div className={styles.loadingSpinner} />
					<p>Redirecting to dashboard...</p>
				</div>
			</div>
		);
	}

	return (
		<>
			<Navbar />
			<div className={styles.loginPage}>
				<div className={styles.loginContainer}>
					<div className={styles.loginHeader}>
						<Link href="/" className={styles.backLink}>
							<svg viewBox="0 0 16 16" fill="currentColor">
								<path
									fillRule="evenodd"
									d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
								/>
							</svg>
							Back to home
						</Link>

						<div className={styles.loginBrand}>
							<h1 className={styles.loginTitle}>
								{showLogin ? "Welcome back" : "Join APIdeas"}
							</h1>
							<p className={styles.loginSubtitle}>
								{showLogin
									? "Continue your innovation journey"
									: "Start generating ideas"}
							</p>
						</div>
					</div>

					<div className={styles.loginMain}>
						<div className={styles.authTabs}>
							<button
								className={`${styles.authTab} ${showLogin ? styles.authTabActive : ""}`}
								onClick={() => setShowLogin(true)}
							>
								Sign In
							</button>
							<button
								className={`${styles.authTab} ${!showLogin ? styles.authTabActive : ""}`}
								onClick={() => setShowLogin(false)}
							>
								Sign Up
							</button>
						</div>

						{/* Demo Accounts - Show for login */}
						{showLogin && (
							<div className={styles.demoAccountsSection}>
								<div className={styles.demoQuickAccess}>
									<span className={styles.demoLabel}>
										🚀 Quick Demo Access - Click to auto-fill
									</span>
									<div className={styles.demoButtons}>
										<button
											className={`${styles.demoBtn} ${styles.demoBtnUser}`}
											onClick={() => {
												setEmail("test@example.com");
												setPassword("test123");
											}}
										>
											👤 User Demo
											<small>test@example.com</small>
										</button>
										<button
											className={`${styles.demoBtn} ${styles.demoBtnRich}`}
											onClick={() => {
												setEmail("rich@apideas.com");
												setPassword("rich123");
											}}
										>
											💰 Rich User
											<small>1M coins • rich@apideas.com</small>
										</button>
										{/* <button */}
										{/* 	className={`${styles.demoBtn} ${styles.demoBtnAdmin}`} */}
										{/* 	onClick={() => { */}
										{/* 		setEmail("admin@apideas.com"); */}
										{/* 		setPassword("admin123"); */}
										{/* 	}} */}
										{/* > */}
										{/* 	👑 Admin Demo */}
										{/* 	<small>admin@apideas.com</small> */}
										{/* </button> */}
									</div>
									<div className={styles.demoNote}>
										<span>
											💡 Demo credentials are automatically filled. Just click a
											button above, then &quot;Access Dashboard&quot;
										</span>
									</div>
								</div>
							</div>
						)}

						{error && (
							<div className={`${styles.alert} ${styles.alertError}`}>
								<svg
									className={styles.alertIcon}
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fillRule="evenodd"
										d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
										clipRule="evenodd"
									/>
								</svg>
								<span>{error}</span>
							</div>
						)}

						<form
							onSubmit={handleSubmit}
							className={styles.authFormModern}
							noValidate
						>
							<div className={styles.formRow}>
								<div className={styles.formGroup}>
									<input
										id="email"
										type="email"
										className={styles.formInputModern}
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="Email address"
										required
									/>
								</div>

								{!showLogin && (
									<div className={styles.formGroup}>
										<input
											id="username"
											type="text"
											className={styles.formInputModern}
											value={username}
											onChange={(e) => setUsername(e.target.value)}
											placeholder="Username"
											required
											minLength={3}
											maxLength={20}
										/>
									</div>
								)}

								<div className={styles.formGroup}>
									<input
										id="password"
										type="password"
										className={styles.formInputModern}
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										placeholder="Password"
										required
									/>
								</div>
							</div>

							<button
								type="submit"
								className={`${styles.authSubmitBtn} ${loading ? styles.authSubmitBtnLoading : ""}`}
								disabled={loading}
							>
								{loading ? (
									<>
										<div className={styles.loadingSpinner} />
										<span>Getting you in...</span>
									</>
								) : (
									<>
										<span>
											{showLogin ? "Access Dashboard" : "Create Account"}
										</span>
										<svg
											className={styles.submitIcon}
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<path
												fillRule="evenodd"
												d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
												clipRule="evenodd"
											/>
										</svg>
									</>
								)}
							</button>
						</form>

						<div className={styles.loginFooter}>
							<p className={styles.loginFooterText}>
								{showLogin
									? "Don't have an account? "
									: "Already have an account? "}
								<button
									onClick={() => setShowLogin(!showLogin)}
									className={styles.loginFooterLink}
								>
									{showLogin ? "Sign up" : "Sign in"}
								</button>
							</p>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export const getServerSideProps: GetServerSideProps = async () => {
	return {
		props: {},
	};
};
