// learnContent.js - Educational content for Learn section

export const learnContent = {
  beginner: [
    {
      id: 'what-are-mfs',
      icon: '💡',
      title: 'What are Mutual Funds?',
      subtitle: 'basics explained',
      content: `A mutual fund is like a basket of investments managed by professionals. Instead of buying stocks or bonds yourself, you give your money to a fund manager who invests it for you.

Think of it like ordering a combo meal instead of buying each item separately! 🍔

**How it works:**
- You invest money in a fund
- Fund manager buys stocks/bonds
- Returns are distributed to all investors
- You can invest as little as ₹500/month

**Benefits:**
✅ Professional management
✅ Diversification (don't put all eggs in one basket)
✅ Easy to start (low minimum investment)
✅ Regulated by SEBI (safe & transparent)

**Types:**
📈 Equity Funds - Invest in stocks (higher risk, higher returns)
💰 Debt Funds - Invest in bonds (lower risk, stable returns)
⚖️ Hybrid Funds - Mix of both (balanced approach)`
    },
    {
      id: 'sip-vs-lumpsum',
      icon: '📅',
      title: 'SIP vs Lumpsum',
      subtitle: 'which is better?',
      content: `**SIP (Systematic Investment Plan)**
Invest a fixed amount every month (like ₹5,000)

**Pros:**
✅ Rupee cost averaging (buy more when prices low)
✅ Disciplined investing
✅ Less risky
✅ Good for salaried people

**Lumpsum**
Invest a large amount at once (like ₹5 lakhs)

**Pros:**
✅ Higher returns if market goes up
✅ Simple one-time investment
✅ Good for bonuses/inheritance

**Which to choose?**
🎯 **SIP** - If you have regular income
💰 **Lumpsum** - If market is down & you have surplus cash
⚖️ **Both** - Best strategy! Do SIP + lumpsum when market dips

**Pro tip:** Start SIP today, don't wait for the "right time"! Time in the market > Timing the market 🚀`
    },
    {
      id: 'understanding-risk',
      icon: '⚠️',
      title: 'Understanding Risk',
      subtitle: 'risk = reward',
      content: `Risk means your investment value can go up or down. Higher risk = potential for higher returns (and losses!).

**Risk Levels:**

🟢 **Low Risk** (Liquid/Debt Funds)
- Returns: 4-7% annually
- Best for: Emergency fund, short-term goals
- Volatility: Very stable

🟡 **Moderate Risk** (Hybrid Funds)
- Returns: 8-12% annually
- Best for: Medium-term goals (3-5 years)
- Volatility: Some ups & downs

🔴 **High Risk** (Equity Funds)
- Returns: 12-15%+ annually
- Best for: Long-term goals (7+ years)
- Volatility: Can drop 20-30% in bad years

**Your Risk Depends On:**
⏰ Time horizon (longer = can take more risk)
💼 Income stability
🎯 Financial goals
😰 Sleep-at-night factor (can you handle volatility?)

**Rule of thumb:**
Age 25: 75% equity, 25% debt
Age 40: 60% equity, 40% debt
Age 55: 40% equity, 60% debt`
    },
    {
      id: 'nav-explained',
      icon: '💹',
      title: 'NAV Explained',
      subtitle: 'net asset value',
      content: `**NAV = Net Asset Value**
It's the price of one unit of a mutual fund.

Think of it like a stock price, but for mutual funds! 📊

**How NAV works:**
- Fund has ₹100 crore worth of stocks
- Divided into 1 crore units
- NAV = ₹100 crore ÷ 1 crore = ₹100 per unit

**Important Points:**

✅ **NAV updates daily** after market close
✅ **Lower NAV ≠ Cheaper fund** (common myth!)
✅ **NAV alone doesn't matter** - focus on returns %

**Example:**
Fund A: NAV ₹10, Returns 15%
Fund B: NAV ₹100, Returns 20%

Which is better? **Fund B!** 

NAV is just a number. What matters is the percentage return! 🎯

**When to check NAV:**
📈 When buying/selling (to know unit price)
📊 For calculating your investment value
❌ NOT for comparing funds (use returns %)

**Pro tip:** Don't chase low NAV funds. A ₹500 NAV fund can give better returns than a ₹10 NAV fund!`
    },
    {
      id: 'direct-vs-regular',
      icon: '🔀',
      title: 'Direct vs Regular Plans',
      subtitle: 'save on costs!',
      content: `Every mutual fund has two plans: Direct & Regular. Same fund, different costs!

**Direct Plan**
- Buy directly from AMC (fund house)
- Lower expense ratio (0.5-1%)
- Higher returns (saves 0.5-1% annually)
- No middleman commission

**Regular Plan**
- Buy through broker/distributor
- Higher expense ratio (1.5-2.5%)
- Lower returns
- Distributor gets commission from your investment

**Example (₹10,000 SIP for 20 years @ 12%):**

📊 **Direct Plan**
- Expense: 0.5%
- Final value: ₹99.9 lakhs

📊 **Regular Plan**
- Expense: 1.5%
- Final value: ₹86.4 lakhs

**Difference: ₹13.5 lakhs less!** 😱

**Which to choose?**
✅ **Direct** - If you can research & invest yourself
❌ **Regular** - Only if you need advisory services

**How to buy Direct?**
1. Go to AMC website directly
2. Use this app! 😉
3. Use platforms like Groww, Zerodha

**Pro tip:** Always choose Direct plans. That extra 1% compounds to lakhs over 20 years! 🚀`
    },
    {
      id: 'how-to-choose',
      icon: '🎯',
      title: 'How to Choose a Fund',
      subtitle: 'selection checklist',
      content: `Follow this checklist to pick winning funds! ✅

**1. Match Your Goal** 🎯
- Short-term (<3 years) → Debt funds
- Medium-term (3-7 years) → Hybrid funds
- Long-term (7+ years) → Equity funds

**2. Check Performance** 📊
- Look at 3-year & 5-year returns
- Should beat benchmark consistently
- Don't chase last 1-year returns!

**3. Analyze Metrics** 🔢
- CAGR > 12% (for equity)
- Sharpe ratio > 1 (good risk-adjusted returns)
- Low volatility (less ups & downs)
- Max drawdown < 30% (didn't crash too much)

**4. Fund House Reputation** 🏢
- Established AMC (5+ years)
- Good track record
- Professional fund managers

**5. Expense Ratio** 💰
- Direct plans preferred
- Equity funds: < 1.5%
- Debt funds: < 0.75%

**6. Fund Size** 📏
- Not too small (< ₹100 cr = risky)
- Not too large (> ₹50,000 cr = hard to manage)

**Red Flags:** 🚩
❌ Frequent fund manager changes
❌ Consistently underperforms benchmark
❌ Very high expense ratio
❌ Unclear investment strategy

**Pro tip:** Use our Check Fund feature to analyze all metrics automatically! 🤖`
    }
  ],
  
  advanced: [
    {
      id: 'diversification',
      icon: '🎨',
      title: 'Portfolio Diversification',
      subtitle: "don't put all eggs in one basket",
      content: `Diversification = spreading your money across different investments to reduce risk.

**Why Diversify?**
If one investment falls, others may rise! 📈📉

**How to Diversify:**

**1. By Asset Class**
- 60% Equity (growth)
- 30% Debt (stability)
- 10% Gold (hedge)

**2. By Market Cap**
- 50% Large cap (stable)
- 30% Mid cap (growth)
- 20% Small cap (high risk-reward)

**3. By Sector**
❌ Don't invest only in IT funds
✅ Mix: IT + Banking + Healthcare + Infrastructure

**4. By Geography**
- 80% India
- 20% International (US/Global funds)

**Sample Portfolio (₹10,000/month):**
- ₹3,500 - Large cap fund
- ₹2,000 - Mid cap fund
- ₹1,500 - Small cap fund
- ₹2,000 - Debt fund
- ₹500 - International fund
- ₹500 - Gold ETF

**Over-Diversification Warning!** 🚨
Don't buy 20+ funds! Stick to 5-8 funds max.

**Rebalance Annually:**
If equity grew to 80%, sell some and move to debt to maintain 60-30-10 ratio.`
    },
    {
      id: 'tax-implications',
      icon: '💸',
      title: 'Tax on Mutual Funds',
      subtitle: 'understand your liability',
      content: `**Equity Funds (>65% equity)**

**Long-term (held > 1 year)**
- Tax: 12.5% on gains > ₹1.25 lakh/year
- First ₹1.25 lakh gains = Tax FREE! 🎉

**Short-term (held < 1 year)**
- Tax: 20% on all gains

**Debt Funds (<65% equity)**

**Long-term (held > 3 years)**
- Tax: 20% with indexation benefit
- Or slab rate (whichever is lower)

**Short-term (held < 3 years)**
- Tax: As per your income tax slab

**ELSS Funds (Tax Saver)** 💰
- Lock-in: 3 years
- Save: Up to ₹46,800 tax (₹1.5L × 30%)
- Section 80C benefit

**Tax-Saving Tips:**
✅ Hold equity funds > 1 year
✅ Use ELSS for tax saving
✅ Harvest losses (sell loss-making funds to offset gains)
✅ Stay within ₹1.25L LTCG limit per year

**Pro tip:** Use our Tax Optimizer to calculate savings! 🧮`
    },
    {
      id: 'exit-load-expense',
      icon: '💳',
      title: 'Exit Load & Expense Ratio',
      subtitle: 'hidden costs to watch',
      content: `**Exit Load** 🚪
A fee charged when you withdraw money early.

**Example:**
- Exit load: 1% if redeemed before 1 year
- You invested ₹1 lakh, grew to ₹1.2 lakh
- Exit within 6 months = pay ₹1,200 fee

**Common Exit Loads:**
- Equity funds: 1% if < 1 year
- Debt funds: 0.25-0.5% if < 3 months
- Liquid funds: Usually none
- ELSS: 0% (but 3-year lock-in!)

**How to Avoid:**
✅ Hold funds for recommended period
✅ Check exit load before investing
✅ Some funds have NO exit load

**Expense Ratio** 💰
Annual fee charged by fund house (deducted from NAV daily).

**Impact Example:**
₹10,000 SIP for 20 years @ 12% return

- 0.5% expense → ₹99.9 lakhs
- 1.5% expense → ₹86.4 lakhs
- 2.5% expense → ₹75.2 lakhs

**Difference: ₹24.7 lakhs!** 😱

**Good Expense Ratios:**
✅ Equity Direct: < 1%
✅ Equity Regular: < 2%
✅ Debt Direct: < 0.5%
✅ Debt Regular: < 1.5%

**Pro tip:** Always choose Direct plans to save on expense ratio! Every 1% matters over 20 years!`
    },
    {
      id: 'rebalancing',
      icon: '⚖️',
      title: 'Rebalancing Your Portfolio',
      subtitle: 'maintain your asset mix',
      content: `**What is Rebalancing?**
Bringing your portfolio back to its original asset allocation.

**Why Needed?**
Over time, some investments grow faster, throwing off your balance!

**Example:**

**Start (Jan 2023):**
- 60% Equity = ₹6 lakhs
- 40% Debt = ₹4 lakhs
- Total = ₹10 lakhs

**After 1 year (Jan 2024):**
- Equity grew 20% = ₹7.2 lakhs (72%)
- Debt grew 6% = ₹4.24 lakhs (28%)
- Total = ₹11.44 lakhs

**Your allocation is now 72:28 instead of 60:40!**

**Rebalancing Action:**
Sell ₹1.38 lakhs of equity → Move to debt
New allocation: ₹5.82L (60%) : ₹5.62L (40%) ✅

**When to Rebalance?**

**1. Calendar-based**
- Once a year (simple!)
- On birthday/New Year (easy to remember)

**2. Threshold-based**
- When allocation shifts > 5-10%
- Example: 60% equity became 70%

**3. Life event-based**
- Got married
- Child born
- Nearing retirement

**Rebalancing Strategies:**

**Option A: Sell & Buy**
- Sell overweight asset
- Buy underweight asset
- Tax implications!

**Option B: New Investments**
- Stop SIP in overweight asset
- Increase SIP in underweight asset
- Tax-efficient!

**Pro tip:** Use new money to rebalance (Option B) - saves taxes! 💡`
    }
  ],
  
  tips: [
    "Start early! Time is your best friend in investing. A 25-year-old investing ₹5,000/month will have more at 60 than a 35-year-old investing ₹15,000/month! 🚀",
    "Don't panic sell during market crashes! They're great buying opportunities. Remember: Buy low, sell high! 📉➡️📈",
    "Automate your SIPs! Treat investments like a monthly bill. Set it and forget it! 🤖",
    "Review portfolio annually, not daily! Checking every day increases stress without improving returns. 📅",
    "Emergency fund first! Keep 6 months expenses in liquid funds before aggressive investing. 🛡️",
    "Increase SIP with salary hikes! Got 10% raise? Increase SIP by 10% too. You won't feel it! 💰",
    "Tax planning = Free money! Use ELSS funds to save ₹46,800 in taxes annually. 💸",
    "Direct plans > Regular plans! That 1% difference = ₹10-15 lakhs over 20 years! 🎯",
    "Long-term investing wins! 83% of 15-year periods show positive returns. Just stay invested! ⏰",
    "Diversify, but don't over-do it! 5-8 funds are enough. More = complicated, not better! 🎨"
  ],
  
  glossary: [
    { term: 'CAGR', definition: 'Compound Annual Growth Rate - Average yearly return over a period' },
    { term: 'NAV', definition: 'Net Asset Value - Price of one mutual fund unit' },
    { term: 'SIP', definition: 'Systematic Investment Plan - Investing fixed amount monthly' },
    { term: 'AUM', definition: 'Assets Under Management - Total money managed by fund' },
    { term: 'Sharpe Ratio', definition: 'Risk-adjusted returns - Higher is better (>1 is good)' },
    { term: 'Expense Ratio', definition: 'Annual fee charged by fund (lower is better)' },
    { term: 'Exit Load', definition: 'Fee charged when withdrawing before specified period' },
    { term: 'ELSS', definition: 'Equity Linked Savings Scheme - Tax saving fund (80C)' },
    { term: 'NFO', definition: 'New Fund Offer - When fund is launched (like IPO)' },
    { term: 'SEBI', definition: 'Securities and Exchange Board of India - Mutual fund regulator' },
    { term: 'AMC', definition: 'Asset Management Company - Company that manages mutual funds' },
    { term: 'Benchmark', definition: 'Index used to compare fund performance (like Nifty 50)' },
    { term: 'Volatility', definition: 'How much NAV fluctuates - Lower = more stable' },
    { term: 'Drawdown', definition: 'Maximum drop from peak - Shows worst-case loss' },
    { term: 'Alpha', definition: 'Excess return vs benchmark - Positive alpha is good' },
    { term: 'Beta', definition: 'Volatility vs market - Beta 1 = moves with market' },
    { term: 'Large Cap', definition: 'Top 100 companies by market cap - More stable' },
    { term: 'Mid Cap', definition: 'Companies ranked 101-250 - Growth potential' },
    { term: 'Small Cap', definition: 'Companies ranked 251+ - High risk, high reward' },
    { term: 'Bluechip', definition: 'Large, established companies - Reliable & stable' },
    { term: 'Folio Number', definition: 'Your unique investor ID with an AMC' }
  ]
};