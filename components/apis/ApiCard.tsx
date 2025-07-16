import React, { useState } from "react";
import styles from './ApiCard.module.css';

interface Api {
	id: string;
	name: string;
	category: string;
	description: string;
	documentationUrl: string;
	freeTierInfo?: string;
	isLocked: boolean;
	isIgnored: boolean;
	popularityScore?: number;
}

interface ApiCardProps {
	api: Api;
	isSelected?: boolean;
	onSelect?: (checked: boolean) => void;
	onPreferenceChange: (preferenceType: string, value: boolean) => void;
}

const ApiCard: React.FC<ApiCardProps> = React.memo(
	({ api, isSelected = false, onSelect, onPreferenceChange }) => {
		const [isExpanded, setIsExpanded] = useState(false);

		const handlePreferenceChange = (type: string, value: boolean) => {
			onPreferenceChange(type, value);
		};

		const toggleExpanded = () => {
			setIsExpanded(!isExpanded);
		};

		// Table row view
		const handleRowClick = (e: React.MouseEvent) => {
			// Don't toggle if clicking on interactive elements
			if (
				(e.target as HTMLElement).closest('button') ||
				(e.target as HTMLElement).closest('input') ||
				(e.target as HTMLElement).closest('a')
			) {
				return;
			}
			toggleExpanded();
		};

		return (
			<>
				<tr
					className={`${styles.apiTableRow} ${isSelected ? styles.apiTableRowSelected : ""} ${isExpanded ? styles.apiTableRowExpanded : ""} ${styles.apiTableRowClickable}`}
					onClick={handleRowClick}
					role="button"
					tabIndex={0}
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							toggleExpanded();
						}
					}}
					aria-expanded={isExpanded}
					aria-label={`${api.name} - Click to ${isExpanded ? 'hide' : 'show'} description`}
					title="Click to view description"
				>
						{/* Checkbox */}
						<td className={`${styles.apiTableCell} ${styles.apiTableCellCheckbox}`}>
							{onSelect && (
								<input
									type="checkbox"
									checked={isSelected}
									onChange={(e) => onSelect(e.target.checked)}
									className={styles.apiTableCheckbox}
									aria-label={`Select ${api.name}`}
								/>
							)}
						</td>

						{/* API Name */}
						<td className={`${styles.apiTableCell} ${styles.apiTableCellName}`}>
							<div className={styles.apiNameCell}>
								<div className={styles.apiNameWrapper}>
									<span className={styles.apiName}>{api.name}</span>
									<svg 
										width="12" 
										height="12" 
										viewBox="0 0 24 24" 
										fill="currentColor"
										className={`${styles.apiExpandIndicator} ${isExpanded ? styles.apiExpandIndicatorExpanded : ''}`}
										aria-hidden="true"
									>
										<path d="M12 15.5a1 1 0 0 1-.71-.29l-4-4a1 1 0 1 1 1.42-1.42L12 13.09l3.29-3.3a1 1 0 0 1 1.42 1.42l-4 4a1 1 0 0 1-.71.29z"/>
									</svg>
								</div>
								{api.freeTierInfo && (
									<span className={styles.apiFreeBadge}>Free</span>
								)}
							</div>
						</td>

						{/* Category */}
						<td className={`${styles.apiTableCell} ${styles.apiTableCellCategory}`}>
							<span className={styles.apiCategory}>{api.category}</span>
						</td>

						{/* Lock */}
						<td className={`${styles.apiTableCell} ${styles.apiTableCellAction}`}>
							<button
								onClick={(e) => {
									e.stopPropagation();
									handlePreferenceChange("lock", !api.isLocked);
								}}
								className={`${styles.apiTableAction} ${api.isLocked ? styles.apiTableActionActive : ""}`}
								title={api.isLocked ? "Unlock" : "Lock"}
								aria-pressed={api.isLocked}
							>
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="currentColor"
								>
									{api.isLocked ? (
										<path d="M6 10v-4a6 6 0 1 1 12 0v4h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1zm2-4a4 4 0 1 1 8 0v4H8V6zm4 8a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
									) : (
										<path d="M15 1a4 4 0 0 1 4 4v4h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h9V5a2 2 0 1 0-4 0v1a1 1 0 0 1-2 0V5a4 4 0 0 1 4-4zm-3 13a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
									)}
								</svg>
							</button>
						</td>

						{/* Ignore */}
						<td className={`${styles.apiTableCell} ${styles.apiTableCellAction}`}>
							<button
								onClick={(e) => {
									e.stopPropagation();
									handlePreferenceChange("ignore", !api.isIgnored);
								}}
								className={`${styles.apiTableAction} ${api.isIgnored ? styles.apiTableActionActive : ""}`}
								title={api.isIgnored ? "Show" : "Hide"}
								aria-pressed={api.isIgnored}
							>
								<svg
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="currentColor"
								>
									{api.isIgnored ? (
										<path d="M3.28 2.22a.75.75 0 00-1.06 1.06l10.5 10.5a.75.75 0 101.06-1.06L3.28 2.22zM6.5 5.44L9.56 8.5A2.5 2.5 0 006.5 5.44z" />
									) : (
										<>
											<path d="M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
											<path d="M.5 8a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0zM8 2a6 6 0 100 12A6 6 0 008 2z" />
										</>
									)}
								</svg>
							</button>
						</td>

						{/* View Docs */}
						<td className={`${styles.apiTableCell} ${styles.apiTableCellAction}`}>
							<a
								href={api.documentationUrl}
								target="_blank"
								rel="noopener noreferrer"
								className={`${styles.apiTableAction} ${styles.apiTableActionDocs}`}
								title="View Documentation"
								onClick={(e) => e.stopPropagation()}
							>
								<svg
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="currentColor"
								>
									<path d="M4 2a1.5 1.5 0 00-1.5 1.5v9A1.5 1.5 0 004 14h8a1.5 1.5 0 001.5-1.5V6.621a1.5 1.5 0 00-.44-1.06L9.94 2.439A1.5 1.5 0 008.878 2H4z" />
									<path d="M9 2.5V6a.5.5 0 00.5.5h3.5L9 2.5z" />
								</svg>
							</a>
						</td>

					</tr>

				{/* Expandable description row */}
				{isExpanded && (
					<tr className={styles.apiTableDescriptionRow}>
						<td colSpan={6} className={styles.apiTableDescriptionCell}>
							<div className={styles.apiDescriptionContent}>
								<p className={styles.apiDescription}>{api.description}</p>
							</div>
						</td>
					</tr>
				)}
			</>
		);
	},
);

ApiCard.displayName = "ApiCard";

export default ApiCard;
