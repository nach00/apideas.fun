import React from "react";
import Link from "next/link";
import { formatNumber } from "@/lib/card-utils";
import styles from './DashboardHero.module.css';

interface DashboardHeroProps {
  username?: string;
  coinBalance: number;
  totalCards: number;
  completionRate: number;
  hasNoCards: boolean;
  isNearCompletion: boolean;
  loading?: boolean;
  onGenerateCard?: () => void;
}

const DashboardHero = React.memo(function DashboardHero({
  username,
  coinBalance,
  totalCards,
  completionRate,
  hasNoCards,
  isNearCompletion,
  loading = false,
  onGenerateCard,
}: DashboardHeroProps) {
  const getTimeOfDayGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getMotivationalMessage = () => {
    if (hasNoCards) {
      return {
        title: "Ready to create your first idea?",
        subtitle: "Start your innovation journey with AI-powered API combinations",
        badge: "Getting Started",
        icon: "🚀",
        cta: "Generate Your First Card"
      };
    }
    if (isNearCompletion) {
      return {
        title: "You're almost there!",
        subtitle: "Just a few more combinations to discover all 190 unique ideas",
        badge: "Nearly Complete",
        icon: "🎯",
        cta: "Finish Strong"
      };
    }
    if (completionRate < 25) {
      return {
        title: "Great start!",
        subtitle: "Keep exploring to unlock more powerful API combinations",
        badge: "Building Momentum",
        icon: "⚡",
        cta: "Generate Next Idea"
      };
    }
    if (completionRate < 75) {
      return {
        title: "You're on fire!",
        subtitle: "Your innovation streak is impressive. What's next?",
        badge: "On a Roll",
        icon: "🔥",
        cta: "Keep Going"
      };
    }
    return {
      title: "Innovation master!",
      subtitle: "You've discovered most combinations. Explore the rare ones!",
      badge: "Expert Level",
      icon: "💎",
      cta: "Find Rare Gems"
    };
  };

  const message = getMotivationalMessage();
  const hasLowBalance = coinBalance < 30;
  const canGenerate = !loading && !hasLowBalance && onGenerateCard;

  return (
    <div className={styles.dashboardHeroModern}>
      {/* Background Elements */}
      <div className={styles.heroBg}>
        <div className={styles.bgGrid}></div>
        <div className={styles.bgGradientPrimary}></div>
        <div className={styles.bgGradientSecondary}></div>
        <div className={styles.floatingElements}>
          {[...Array(8)].map((_, i) => (
            <div 
              key={i} 
              className={`${styles.floatingShape} ${styles[`floatingShape${i + 1}`]}`}
              style={{ '--delay': `${i * 0.5}s` } as React.CSSProperties}
            />
          ))}
        </div>
      </div>

      <div className={styles.heroContentModern}>
        {/* Main Content Area */}
        <div className={styles.heroMainContent}>
          {/* Status Badge */}
          <div className={styles.statusBadge}>
            <span className={styles.statusIcon}>{message.icon}</span>
            <span className={styles.statusText}>{message.badge}</span>
            <div className={styles.badgeShine}></div>
          </div>

          {/* Greeting & Title */}
          <div className={styles.heroText}>
            <h1 className={styles.heroGreeting}>
              {getTimeOfDayGreeting()}, <span className={styles.username}>{username || "Creator"}</span>
            </h1>
            <h2 className={styles.heroTitle}>{message.title}</h2>
            <p className={styles.heroSubtitle}>{message.subtitle}</p>
          </div>

          {/* Quick Stats */}
          <div className={styles.quickStats}>
            <div className={styles.statGroup}>
              <div className={`${styles.statItem} ${styles.primary}`}>
                <div className={styles.statIconWrapper}>
                  <div className={styles.statIcon}>🪙</div>
                  <div className={styles.statPulse}></div>
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statValue}>{formatNumber(coinBalance)}</div>
                  <div className={styles.statLabel}>Coins Available</div>
                  {hasLowBalance && (
                    <div className={styles.statWarning}>
                      <span className={styles.warningIcon}>⚠️</span>
                      <span>Running low</span>
                    </div>
                  )}
                </div>
                {hasLowBalance && (
                  <Link href="/shop" className={styles.statAction}>
                    <span>+</span>
                  </Link>
                )}
              </div>

              <div className={`${styles.statItem} ${styles.secondary}`}>
                <div className={styles.statIconWrapper}>
                  <div className={styles.statIcon}>💡</div>
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statValue}>{totalCards}</div>
                  <div className={styles.statLabel}>Ideas Created</div>
                </div>
              </div>
            </div>

            {/* Progress Section */}
            <div className={styles.progressSection}>
              <div className={styles.progressHeader}>
                <span className={styles.progressTitle}>Discovery Progress</span>
                <span className={styles.progressPercentage}>{completionRate}%</span>
              </div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressTrack}>
                  <div 
                    className={styles.progressFill}
                    style={{ width: `${completionRate}%` }}
                  ></div>
                  <div className={styles.progressGlow}></div>
                </div>
                <div className={styles.progressMilestones}>
                  {[25, 50, 75, 100].map((milestone) => (
                    <div 
                      key={milestone}
                      className={`${styles.milestone} ${completionRate >= milestone ? styles.reached : ''}`}
                      style={{ left: `${milestone}%` }}
                    >
                      <div className={styles.milestoneDot}></div>
                      <div className={styles.milestoneLabel}>{milestone}%</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.progressStats}>
                <span>{totalCards} of 190 combinations discovered</span>
                <span>{190 - totalCards} remaining</span>
              </div>
            </div>
          </div>
        </div>

        {/* Side Action Panel */}
        <div className={styles.heroActionPanel}>
          <div className={styles.actionCard}>
            <div className={styles.actionHeader}>
              <div className={styles.actionIcon}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9L17 14.74L18.18 22L12 18.77L5.82 22L7 14.74L2 9L8.91 8.26L12 2Z" 
                        fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={styles.actionContent}>
                <h3 className={styles.actionTitle}>Ready for your next breakthrough?</h3>
                <p className={styles.actionDescription}>
                  Generate a new API combination and discover your next big idea
                </p>
              </div>
            </div>
            
            <div className={styles.actionCta}>
              <button 
                className={`${styles.ctaButton} ${styles.primary} ${loading ? styles.loading : ''} ${hasLowBalance ? styles.disabled : ''}`}
                onClick={canGenerate ? onGenerateCard : undefined}
                disabled={!canGenerate}
                title={hasLowBalance ? 'Not enough coins - visit the shop to get more' : ''}
              >
                <span className={styles.ctaIcon}>
                  {loading ? '⏳' : hasLowBalance ? '🪙' : '✨'}
                </span>
                <span className={styles.ctaText}>
                  {loading ? 'Generating...' : hasLowBalance ? 'Need More Coins' : message.cta}
                </span>
                <div className={styles.ctaShine}></div>
              </button>
              
              <div className={styles.quickActions}>
                <Link href="/collection" className={styles.quickAction}>
                  <span className={styles.qaIcon}>📚</span>
                  <span>My Collection</span>
                </Link>
                <Link href="/apis" className={styles.quickAction}>
                  <span className={styles.qaIcon}>🔧</span>
                  <span>Manage APIs</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Achievement Preview */}
          {completionRate > 0 && (
            <div className={styles.achievementPreview}>
              <div className={styles.achievementHeader}>
                <span className={styles.achievementTitle}>Recent Achievement</span>
                <span className={styles.achievementBadge}>🏆</span>
              </div>
              <div className={styles.achievementContent}>
                {completionRate >= 75 ? (
                  <span>Master Explorer - 75%+ completion</span>
                ) : completionRate >= 50 ? (
                  <span>Idea Specialist - 50%+ completion</span>
                ) : completionRate >= 25 ? (
                  <span>Innovation Rookie - 25%+ completion</span>
                ) : (
                  <span>First Steps - Started your journey</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default DashboardHero;