"""
Risk Profiler Service - SEBI Risk-O-Meter Aligned
=================================================
FILE: backend/services/risk_profiler_v2.py

Maps user risk profiles to SEBI's official Risk-O-Meter categories:
- Low
- Low to Moderate
- Moderate
- Moderately High
- High
- Very High

USAGE:
    from services.risk_profiler_v2 import RiskProfilerV2
    
    profiler = RiskProfilerV2()
    profile = profiler.calculate_quick(age=28, investment_horizon_years=15)
    
    print(profile.risk_level)  # "High"
    print(profile.suitable_fund_categories)  # ["Large Cap", "Mid Cap", ...]
"""

from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum


class SEBIRiskLevel(Enum):
    """SEBI Risk-O-Meter Categories (official labels on all MF factsheets)."""
    LOW = "Low"
    LOW_TO_MODERATE = "Low to Moderate"
    MODERATE = "Moderate"
    MODERATELY_HIGH = "Moderately High"
    HIGH = "High"
    VERY_HIGH = "Very High"


@dataclass
class UserRiskProfile:
    """Complete risk profile result."""
    risk_level: SEBIRiskLevel
    score: int  # 0-100
    suitable_levels: List[SEBIRiskLevel]
    max_risk_level: SEBIRiskLevel
    summary: str
    allocation: Dict[str, float]
    suitable_fund_categories: List[str]
    factors: Dict[str, float]


class RiskProfilerV2:
    """Risk profiling engine aligned with SEBI Risk-O-Meter."""
    
    # Score ranges mapped to SEBI risk levels
    SCORE_TO_RISK = [
        (0, 16, SEBIRiskLevel.LOW),
        (17, 33, SEBIRiskLevel.LOW_TO_MODERATE),
        (34, 50, SEBIRiskLevel.MODERATE),
        (51, 67, SEBIRiskLevel.MODERATELY_HIGH),
        (68, 84, SEBIRiskLevel.HIGH),
        (85, 100, SEBIRiskLevel.VERY_HIGH),
    ]
    
    # Fund categories for each SEBI risk level
    RISK_TO_CATEGORIES = {
        SEBIRiskLevel.LOW: [
            "Overnight Fund",
            "Liquid Fund",
        ],
        SEBIRiskLevel.LOW_TO_MODERATE: [
            "Overnight Fund", "Liquid Fund",
            "Ultra Short Duration Fund",
            "Low Duration Fund",
            "Money Market Fund",
        ],
        SEBIRiskLevel.MODERATE: [
            "Ultra Short Duration Fund", "Low Duration Fund", "Money Market Fund",
            "Short Duration Fund",
            "Medium Duration Fund",
            "Banking and PSU Fund",
            "Corporate Bond Fund",
            "Floater Fund",
        ],
        SEBIRiskLevel.MODERATELY_HIGH: [
            "Short Duration Fund", "Corporate Bond Fund", "Banking and PSU Fund",
            "Large Cap Fund",
            "Large & Mid Cap Fund",
            "Conservative Hybrid Fund",
            "Balanced Advantage Fund",
            "Equity Savings Fund",
            "Arbitrage Fund",
        ],
        SEBIRiskLevel.HIGH: [
            "Large Cap Fund", "Large & Mid Cap Fund", "Balanced Advantage Fund",
            "Multi Cap Fund",
            "Flexi Cap Fund",
            "Mid Cap Fund",
            "Focused Fund",
            "Value Fund",
            "Contra Fund",
            "Dividend Yield Fund",
            "ELSS (Tax Saving)",
            "Aggressive Hybrid Fund",
        ],
        SEBIRiskLevel.VERY_HIGH: [
            "Mid Cap Fund", "Flexi Cap Fund",
            "Small Cap Fund",
            "Sectoral/Thematic Fund",
            "International Fund",
            "Credit Risk Fund",
        ],
    }
    
    # Asset allocation for each risk level
    ALLOCATIONS = {
        SEBIRiskLevel.LOW: {
            "Liquid/Overnight": 60, "Ultra Short Debt": 30, "Arbitrage": 10
        },
        SEBIRiskLevel.LOW_TO_MODERATE: {
            "Liquid/Money Market": 30, "Short Duration Debt": 40, "Corporate Bond": 20, "Arbitrage": 10
        },
        SEBIRiskLevel.MODERATE: {
            "Short Duration Debt": 30, "Corporate Bond": 25, "Large Cap Equity": 20,
            "Balanced Advantage": 15, "Gold": 10
        },
        SEBIRiskLevel.MODERATELY_HIGH: {
            "Large Cap Equity": 35, "Flexi Cap": 15, "Corporate Bond": 20,
            "Short Duration Debt": 15, "Aggressive Hybrid": 10, "Gold": 5
        },
        SEBIRiskLevel.HIGH: {
            "Large Cap Equity": 25, "Flexi Cap": 25, "Mid Cap Equity": 20,
            "ELSS": 10, "Short Duration Debt": 10, "International": 5, "Gold": 5
        },
        SEBIRiskLevel.VERY_HIGH: {
            "Large Cap Equity": 15, "Flexi Cap": 20, "Mid Cap Equity": 25,
            "Small Cap Equity": 20, "Sectoral/Thematic": 10, "International": 5, "Gold": 5
        },
    }
    
    # Scoring weights
    WEIGHTS = {
        "age": 0.20,
        "income_stability": 0.15,
        "goal_horizon": 0.25,
        "experience": 0.15,
        "loss_tolerance": 0.25,
    }
    
    # Risk assessment questions
    QUESTIONS = [
        {
            "id": "age",
            "question": "What is your age?",
            "type": "number",
            "emoji": "🎂"
        },
        {
            "id": "income_stability",
            "question": "How would you describe your income?",
            "type": "choice",
            "emoji": "💰",
            "options": [
                {"text": "Very stable (Government job, pension)", "score": 90},
                {"text": "Stable (Permanent job, established business)", "score": 70},
                {"text": "Moderately stable (Private job, regular freelance)", "score": 50},
                {"text": "Variable (New job, gig work, commission-based)", "score": 30},
                {"text": "Uncertain (Between jobs, irregular income)", "score": 15}
            ]
        },
        {
            "id": "goal_horizon",
            "question": "When will you need this money?",
            "type": "choice",
            "emoji": "⏰",
            "options": [
                {"text": "20+ years (Long-term wealth, retirement)", "score": 100},
                {"text": "10-20 years (Child's education, distant goal)", "score": 85},
                {"text": "5-10 years (House, car, medium-term goal)", "score": 60},
                {"text": "3-5 years (Specific goal in few years)", "score": 40},
                {"text": "1-3 years (Short-term need)", "score": 20},
                {"text": "Less than 1 year (Need money soon)", "score": 5}
            ]
        },
        {
            "id": "experience",
            "question": "What is your investment experience?",
            "type": "choice",
            "emoji": "📊",
            "options": [
                {"text": "Expert (10+ years, understand markets deeply)", "score": 95},
                {"text": "Experienced (5-10 years, comfortable with MFs/stocks)", "score": 75},
                {"text": "Intermediate (2-5 years, mostly SIPs/FDs)", "score": 55},
                {"text": "Beginner (Started recently)", "score": 35},
                {"text": "None (First time investor)", "score": 15}
            ]
        },
        {
            "id": "loss_tolerance",
            "question": "If your ₹1,00,000 investment dropped to ₹70,000 (-30%), what would you do?",
            "type": "choice",
            "emoji": "📉",
            "options": [
                {"text": "Invest more - great buying opportunity!", "score": 100},
                {"text": "Stay invested and wait patiently", "score": 75},
                {"text": "Feel anxious but hold on", "score": 50},
                {"text": "Sell some to reduce exposure", "score": 30},
                {"text": "Sell everything to stop losses", "score": 10}
            ]
        },
        {
            "id": "emergency_fund",
            "question": "Do you have an emergency fund (6+ months of expenses)?",
            "type": "choice",
            "emoji": "🏦",
            "options": [
                {"text": "Yes, 6+ months covered", "score": 80},
                {"text": "Partially, 3-6 months covered", "score": 60},
                {"text": "Minimal, 1-3 months covered", "score": 40},
                {"text": "No emergency fund yet", "score": 20}
            ]
        },
        {
            "id": "dependents",
            "question": "How many people financially depend on you?",
            "type": "choice",
            "emoji": "👨‍👩‍👧‍👦",
            "options": [
                {"text": "None - only supporting myself", "score": 80},
                {"text": "1-2 dependents", "score": 60},
                {"text": "3-4 dependents", "score": 40},
                {"text": "5+ dependents", "score": 25}
            ]
        }
    ]
    
    # =========================================================================
    # CALCULATION METHODS
    # =========================================================================
    
    def calculate_from_answers(self, answers: Dict[str, int]) -> UserRiskProfile:
        """Calculate risk profile from questionnaire answers."""
        factors = {}
        
        # Process age
        if "age" in answers:
            age = answers["age"]
            factors["age"] = max(10, min(100, 100 - (age - 22) * 2))
        
        # Process other factors
        mapping = {
            "income_stability": "income_stability",
            "goal_horizon": "goal_horizon",
            "experience": "experience",
            "loss_tolerance": "loss_tolerance",
            "emergency_fund": "income_stability",
            "dependents": "income_stability",
        }
        
        for answer_id, score in answers.items():
            if answer_id == "age":
                continue
            factor_key = mapping.get(answer_id)
            if factor_key:
                if factor_key in factors:
                    factors[factor_key] = (factors[factor_key] + score) / 2
                else:
                    factors[factor_key] = score
        
        # Calculate weighted score
        total = sum(factors.get(f, 50) * w for f, w in self.WEIGHTS.items())
        total = max(0, min(100, total))
        
        return self._build_profile(round(total), factors)
    
    def calculate_quick(
        self,
        age: int,
        investment_horizon_years: int,
        monthly_income: Optional[int] = None,
        has_emergency_fund: bool = True,
        dependents: int = 0
    ) -> UserRiskProfile:
        """Quick risk calculation from basic info."""
        factors = {}
        
        # Age factor
        factors["age"] = max(10, min(100, 100 - (age - 22) * 2))
        
        # Horizon factor
        horizon_scores = [(20, 100), (15, 90), (10, 75), (7, 60), (5, 45), (3, 30), (0, 15)]
        for min_years, score in horizon_scores:
            if investment_horizon_years >= min_years:
                factors["goal_horizon"] = score
                break
        
        # Income factor
        income_score = 50
        if monthly_income:
            income_levels = [(300000, 90), (150000, 75), (75000, 60), (40000, 45), (0, 30)]
            for min_income, score in income_levels:
                if monthly_income >= min_income:
                    income_score = score
                    break
        
        if not has_emergency_fund:
            income_score -= 15
        income_score -= (dependents * 5)
        factors["income_stability"] = max(10, min(100, income_score))
        
        # Defaults
        factors["experience"] = 50
        factors["loss_tolerance"] = 55
        
        total = sum(factors.get(f, 50) * w for f, w in self.WEIGHTS.items())
        return self._build_profile(round(total), factors)
    
    def _build_profile(self, score: int, factors: Dict) -> UserRiskProfile:
        """Build complete profile from score."""
        risk_level = self._score_to_level(score)
        suitable_levels = self._get_suitable_levels(risk_level)
        
        # Get all suitable fund categories
        categories = []
        for level in suitable_levels:
            categories.extend(self.RISK_TO_CATEGORIES.get(level, []))
        categories = list(dict.fromkeys(categories))  # Remove duplicates
        
        return UserRiskProfile(
            risk_level=risk_level,
            score=score,
            suitable_levels=suitable_levels,
            max_risk_level=risk_level,
            summary=self._generate_summary(risk_level, score),
            allocation=self.ALLOCATIONS[risk_level],
            suitable_fund_categories=categories,
            factors=factors
        )
    
    def _score_to_level(self, score: int) -> SEBIRiskLevel:
        """Convert score to SEBI risk level."""
        for min_s, max_s, level in self.SCORE_TO_RISK:
            if min_s <= score <= max_s:
                return level
        return SEBIRiskLevel.MODERATE
    
    def _get_suitable_levels(self, max_level: SEBIRiskLevel) -> List[SEBIRiskLevel]:
        """Get all risk levels at or below max."""
        all_levels = list(SEBIRiskLevel)
        return all_levels[:all_levels.index(max_level) + 1]
    
    def _generate_summary(self, risk_level: SEBIRiskLevel, score: int) -> str:
        """Generate human-readable summary."""
        summaries = {
            SEBIRiskLevel.LOW: f"🛡️ **Low Risk** (Score: {score}/100)\n\nYou prefer capital preservation. Suitable: Overnight, Liquid funds.\nExpected Returns: 5-7% | Volatility: Very Low",
            SEBIRiskLevel.LOW_TO_MODERATE: f"🔵 **Low to Moderate Risk** (Score: {score}/100)\n\nYou prefer stability with slightly better returns.\nExpected Returns: 6-8% | Volatility: Low",
            SEBIRiskLevel.MODERATE: f"⚖️ **Moderate Risk** (Score: {score}/100)\n\nYou're comfortable with some fluctuation for better returns.\nExpected Returns: 8-10% | Volatility: Moderate",
            SEBIRiskLevel.MODERATELY_HIGH: f"📈 **Moderately High Risk** (Score: {score}/100)\n\nYou can handle market volatility for potentially higher returns.\nExpected Returns: 10-13% | Volatility: Moderately High",
            SEBIRiskLevel.HIGH: f"🚀 **High Risk** (Score: {score}/100)\n\nYou're comfortable with significant volatility for wealth creation.\nExpected Returns: 12-15% | Volatility: High",
            SEBIRiskLevel.VERY_HIGH: f"🔥 **Very High Risk** (Score: {score}/100)\n\nYou're a growth seeker comfortable with high volatility!\nExpected Returns: 15-18% | Volatility: Very High",
        }
        return summaries.get(risk_level, summaries[SEBIRiskLevel.MODERATE])
    
    # =========================================================================
    # FUND FILTERING
    # =========================================================================
    
    def filter_funds_by_risk(self, funds: List[Dict], profile: UserRiskProfile) -> List[Dict]:
        """Filter funds suitable for user's risk profile."""
        suitable = [level.value for level in profile.suitable_levels]
        return [
            f for f in funds
            if f.get("riskometer") in suitable or f.get("risk_level") in suitable or f.get("sebi_risk") in suitable
        ]
    
    def get_fund_suitability(self, fund_risk: str, profile: UserRiskProfile) -> Dict:
        """Check if a fund is suitable for user."""
        try:
            fund_level = SEBIRiskLevel(fund_risk)
        except ValueError:
            return {"suitable": False, "reason": f"Unknown risk level: {fund_risk}"}
        
        suitable = fund_level in profile.suitable_levels
        
        return {
            "suitable": suitable,
            "fund_risk": fund_risk,
            "user_max_risk": profile.risk_level.value,
            "recommendation": "Suitable ✅" if suitable else "Not Recommended ⚠️",
            "reason": "Matches your risk profile" if suitable else f"Risk ({fund_risk}) exceeds your profile ({profile.risk_level.value})"
        }
    
    # =========================================================================
    # HELPERS
    # =========================================================================
    
    def get_all_questions(self) -> List[Dict]:
        return self.QUESTIONS
    
    def get_next_question(self, answered: List[str]) -> Optional[Dict]:
        for q in self.QUESTIONS:
            if q["id"] not in answered:
                return q
        return None
    
    def is_complete(self, answered: List[str]) -> bool:
        return {"age", "goal_horizon", "loss_tolerance"}.issubset(set(answered))
    
    def get_risk_level_info(self, level: str) -> Dict:
        try:
            lvl = SEBIRiskLevel(level)
            return {
                "level": lvl.value,
                "categories": self.RISK_TO_CATEGORIES.get(lvl, []),
                "allocation": self.ALLOCATIONS.get(lvl, {})
            }
        except ValueError:
            return {"error": f"Unknown level: {level}"}


def profile_to_dict(profile: UserRiskProfile) -> Dict:
    """Convert profile to JSON-serializable dict."""
    return {
        "risk_level": profile.risk_level.value,
        "score": profile.score,
        "suitable_risk_levels": [l.value for l in profile.suitable_levels],
        "max_risk_level": profile.max_risk_level.value,
        "summary": profile.summary,
        "allocation": profile.allocation,
        "suitable_fund_categories": profile.suitable_fund_categories,
        "factors": profile.factors
    }


# =============================================================================
# TESTING
# =============================================================================

if __name__ == "__main__":
    print("Testing SEBI-Aligned Risk Profiler...")
    
    profiler = RiskProfilerV2()
    
    # Test young investor
    p1 = profiler.calculate_quick(age=28, investment_horizon_years=20, monthly_income=100000)
    print(f"\n28yo, 20yr horizon: {p1.risk_level.value} (Score: {p1.score})")
    
    # Test near retirement
    p2 = profiler.calculate_quick(age=55, investment_horizon_years=3, monthly_income=150000, dependents=2)
    print(f"55yo, 3yr horizon: {p2.risk_level.value} (Score: {p2.score})")
    
    # Test suitability
    suit = profiler.get_fund_suitability("Very High", p2)
    print(f"\n'Very High' fund for conservative user: {suit['recommendation']}")
    
    print("\n✅ Test complete!")
