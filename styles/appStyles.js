import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F' },
  scrollView: { flex: 1, marginBottom: 80 },
  scrollViewFull: { flex: 1 },  // No bottom margin
  
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 },
  greeting: { color: '#A78BFA', fontSize: 14, fontWeight: '700' },
  userName: { color: '#fff', fontSize: 30, fontWeight: '900' },
  notificationButton: { width: 44, height: 44, backgroundColor: '#7C3AED', borderRadius: 16, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  notificationDot: { position: 'absolute', top: -4, right: -4, width: 12, height: 12, backgroundColor: '#FBBF24', borderRadius: 6 },
  
  // Streak Card
  streakCard: { margin: 20, backgroundColor: 'rgba(124, 58, 237, 0.2)', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(124, 58, 237, 0.3)' },
  streakHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  streakTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  streakText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  
  // Sections
  section: { padding: 20, paddingTop: 0 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 16 },
  
  // Action Cards
  actionCard: { borderRadius: 24, padding: 24, marginBottom: 12 },
  purpleGradient: { backgroundColor: '#7C3AED' },
  blueGradient: { backgroundColor: '#2563EB' },
  orangeGradient: { backgroundColor: '#EA580C' },
  actionContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionIcon: { width: 48, height: 48, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actionTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  actionSubtitle: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 12 },
  
  // Market Cards
  marketGrid: { flexDirection: 'row', gap: 12 },
  marketCard: { flex: 1, borderRadius: 16, padding: 16, borderWidth: 1 },
  greenCard: { backgroundColor: 'rgba(34, 197, 94, 0.2)', borderColor: 'rgba(34, 197, 94, 0.3)' },
  blueCard: { backgroundColor: 'rgba(59, 130, 246, 0.2)', borderColor: 'rgba(59, 130, 246, 0.3)' },
  marketLabel: { color: '#A78BFA', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  marketValue: { color: '#fff', fontSize: 24, fontWeight: '900' },
  marketChange: { color: '#22C55E', fontSize: 12, fontWeight: '700' },
  
  // Check Screen Header
  headerPurple: { backgroundColor: '#7C3AED', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  pageTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
  
  // Search
  searchContainer: { padding: 20 },
  searchBox: { backgroundColor: 'rgba(124, 58, 237, 0.2)', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(124, 58, 237, 0.3)' },
  searchInput: { flex: 1, color: '#fff', fontSize: 16 },
  
  // Loading
  loadingContainer: { alignItems: 'center', padding: 40 },
  loadingText: { color: '#A78BFA', marginTop: 12, fontSize: 14, fontWeight: '700' },
  
  // Results
  resultsContainer: { padding: 20, paddingTop: 0 },
  resultsTitle: { color: '#A78BFA', fontSize: 14, fontWeight: '700', marginBottom: 12 },
  
  // Fund Card
  fundCard: { backgroundColor: 'rgba(26, 26, 26, 0.8)', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(124, 58, 237, 0.3)', flexDirection: 'row', alignItems: 'center', gap: 12 },
  fundCardContent: { flex: 1, marginRight: 12},
  fundInfo: { flex: 1 },
  fundName: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  fundTags: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tagBlue: { backgroundColor: 'rgba(59, 130, 246, 0.3)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tagRisk: { backgroundColor: 'rgba(251, 146, 60, 0.3)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tagText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  fundReturn: { alignItems: 'flex-end', marginLeft: 12 },
  returnValue: { color: '#22C55E', fontSize: 20, fontWeight: '900' },
  returnLabel: { color: '#6B7280', fontSize: 10, fontWeight: '700' },
  
  // Details
  detailsContainer: { padding: 20 },
  detailsCard: { backgroundColor: 'rgba(26, 26, 26, 0.8)', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(124, 58, 237, 0.3)' },
  detailsName: { color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 12 },
  detailsTags: { flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  
  // Metrics
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  metricBox: { backgroundColor: 'rgba(124, 58, 237, 0.2)', borderRadius: 12, padding: 12, flex: 1, minWidth: '45%' },
  metricLabel: { color: '#A78BFA', fontSize: 12, fontWeight: '700' },
  metricValue: { color: '#22C55E', fontSize: 20, fontWeight: '900', marginTop: 4 },
  
  // Verdict
  verdictCard: { backgroundColor: 'rgba(124, 58, 237, 0.15)', borderRadius: 16, padding: 16, marginBottom: 20 },
  verdictTitle: { color: '#A78BFA', fontSize: 14, fontWeight: '700', marginBottom: 8 },
  verdictText: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 16 },
  verdictSubtitle: { color: '#A78BFA', fontSize: 12, fontWeight: '700', marginTop: 12, marginBottom: 8 },
  verdictPro: { color: '#22C55E', fontSize: 14, marginBottom: 4 },
  verdictCon: { color: '#FB923C', fontSize: 14, marginBottom: 4 },
  
  // Back Button
  backButton: { backgroundColor: 'rgba(124, 58, 237, 0.3)', borderRadius: 12, padding: 16, alignItems: 'center' },
  backButtonText: { color: '#A78BFA', fontSize: 16, fontWeight: '700' },
  
  // Empty State
  emptyState: { alignItems: 'center', padding: 60 },
  emptyText: { color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 8 },
  emptySubtext: { color: '#6B7280', fontSize: 14 },
  
  // Nav Bar
  navbar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: 'rgba(0, 0, 0, 0.9)', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(124, 58, 237, 0.3)', paddingBottom: 20 },
  navButton: { alignItems: 'center', gap: 4 },
  navLabel: { fontSize: 10, fontWeight: '700' },
  
  // Coming Soon
  comingSoonContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 80 },
  comingSoon: { color: '#fff', fontSize: 24, fontWeight: '900' },
  comingSoonSub: { color: '#6B7280', fontSize: 16, marginTop: 8 },


// Info Row
codeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
codeLabel: { color: '#6B7280', fontSize: 12, fontWeight: '700' },
codeValue: { color: '#A78BFA', fontSize: 12, fontWeight: '700', fontFamily: 'monospace' },

infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(124, 58, 237, 0.2)' },
infoLabel: { color: '#A78BFA', fontSize: 14, fontWeight: '700' },
infoValue: { color: '#fff', fontSize: 14, fontWeight: '600' },

// Objective Card
objectiveCard: { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 12, padding: 16, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#3B82F6' },
objectiveTitle: { color: '#3B82F6', fontSize: 14, fontWeight: '900', marginBottom: 8 },
objectiveText: { color: '#E5E7EB', fontSize: 13, lineHeight: 20 },

// Expense Card
expenseCard: { backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: 12, padding: 16, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#22C55E' },
expenseTitle: { color: '#22C55E', fontSize: 14, fontWeight: '900', marginBottom: 12 },
expenseRow: { flexDirection: 'row', gap: 12 },
expenseItem: { flex: 1, backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: 8, padding: 12, alignItems: 'center' },
expenseLabel: { color: '#6B7280', fontSize: 11, fontWeight: '700', marginBottom: 4 },
expenseValue: { color: '#22C55E', fontSize: 18, fontWeight: '900' },

// Section Headers
sectionHeader: { color: '#fff', fontSize: 16, fontWeight: '900', marginTop: 20, marginBottom: 12 },

// Metric Variants
metricWarning: { color: '#FB923C' },
metricDanger: { color: '#EF4444' },
metricDisabled: { opacity: 0.4 },
metricPlaceholder: { color: '#6B7280', fontSize: 14, marginTop: 4, fontStyle: 'italic' },

// Variants Card
variantsCard: { backgroundColor: 'rgba(124, 58, 237, 0.1)', borderRadius: 12, marginBottom: 16, overflow: 'hidden' },
variantsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
variantsTitle: { color: '#A78BFA', fontSize: 14, fontWeight: '900' },
variantsToggle: { color: '#A78BFA', fontSize: 16, fontWeight: '900' },
variantsList: { paddingHorizontal: 16, paddingBottom: 16 },
variantItem: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: 8, padding: 12, marginBottom: 8 },
variantName: { color: '#fff', fontSize: 13, fontWeight: '600', marginBottom: 4 },
variantCode: { color: '#6B7280', fontSize: 11, fontFamily: 'monospace' },

// Score Bar
scoreBar: { marginVertical: 12 },
scoreBarBg: { height: 8, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 4, overflow: 'hidden' },
scoreBarFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 4 },
scoreText: { color: '#A78BFA', fontSize: 12, fontWeight: '700', marginTop: 8, textAlign: 'center' },


// Fund Managers
managersCard: { 
  backgroundColor: 'rgba(168, 85, 247, 0.1)', 
  borderRadius: 12, 
  marginBottom: 16, 
  overflow: 'hidden',
  borderLeftWidth: 4,
  borderLeftColor: '#A855F7'
},
managersHeader: { 
  flexDirection: 'row', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  padding: 16 
},
managersTitle: { 
  color: '#A855F7', 
  fontSize: 14, 
  fontWeight: '900' 
},
managersToggle: { 
  color: '#A855F7', 
  fontSize: 16, 
  fontWeight: '900' 
},
managersList: { 
  paddingHorizontal: 16, 
  paddingBottom: 16 
},
managerItem: { 
  backgroundColor: 'rgba(0, 0, 0, 0.3)', 
  borderRadius: 8, 
  padding: 12, 
  marginBottom: 8 
},
managerName: { 
  color: '#fff', 
  fontSize: 15, 
  fontWeight: '700', 
  marginBottom: 4 
},
managerType: { 
  color: '#A855F7', 
  fontSize: 12, 
  fontWeight: '600', 
  marginBottom: 2 
},
managerDate: { 
  color: '#6B7280', 
  fontSize: 11 
},

// Exit Load
exitLoadCard: { 
  backgroundColor: 'rgba(236, 72, 153, 0.1)', 
  borderRadius: 12, 
  padding: 16, 
  marginBottom: 16,
  borderLeftWidth: 4,
  borderLeftColor: '#EC4899'
},
exitLoadTitle: { 
  color: '#EC4899', 
  fontSize: 14, 
  fontWeight: '900', 
  marginBottom: 8 
},
exitLoadText: { 
  color: '#E5E7EB', 
  fontSize: 13, 
  lineHeight: 20 
},

// Tools Screen
headerOrange: { 
  backgroundColor: '#F97316', 
  paddingTop: 60, 
  paddingBottom: 20, 
  paddingHorizontal: 20, 
  flexDirection: 'row', 
  alignItems: 'center', 
  justifyContent: 'space-between', 
  borderBottomLeftRadius: 24, 
  borderBottomRightRadius: 24 
},
headerBlue: { 
  backgroundColor: '#3B82F6', 
  paddingTop: 60, 
  paddingBottom: 20, 
  paddingHorizontal: 20, 
  flexDirection: 'row', 
  alignItems: 'center', 
  justifyContent: 'space-between', 
  borderBottomLeftRadius: 24, 
  borderBottomRightRadius: 24 
},
toolsContainer: { 
  padding: 20 
},
toolCard: { 
  backgroundColor: 'rgba(26, 26, 26, 0.8)', 
  borderRadius: 16, 
  padding: 16, 
  marginBottom: 12, 
  borderWidth: 1, 
  borderColor: 'rgba(255, 255, 255, 0.1)', 
  borderLeftWidth: 4, 
  flexDirection: 'row', 
  alignItems: 'center', 
  justifyContent: 'space-between' 
},
toolContent: { 
  flexDirection: 'row', 
  alignItems: 'center', 
  gap: 16, 
  flex: 1 
},
toolIcon: { 
  width: 56, 
  height: 56, 
  borderRadius: 16, 
  alignItems: 'center', 
  justifyContent: 'center' 
},
toolEmoji: { 
  fontSize: 28 
},
toolInfo: { 
  flex: 1 
},
toolTitle: { 
  color: '#fff', 
  fontSize: 16, 
  fontWeight: '900', 
  marginBottom: 4 
},
toolSubtitle: { 
  color: '#9CA3AF', 
  fontSize: 12 
},
disclaimer: { 
  margin: 20, 
  marginTop: 0, 
  padding: 16, 
  backgroundColor: 'rgba(251, 191, 36, 0.1)', 
  borderRadius: 12, 
  borderLeftWidth: 4, 
  borderLeftColor: '#FBBF24' 
},
disclaimerText: { 
  color: '#FCD34D', 
  fontSize: 12, 
  lineHeight: 18 
},

// Calculator
calculatorContainer: { 
  padding: 20 
},
inputGroup: { 
  marginBottom: 24 
},
inputLabel: { 
  color: '#E5E7EB', 
  fontSize: 14, 
  fontWeight: '700', 
  marginBottom: 8 
},
calculatorInput: { 
  backgroundColor: 'rgba(59, 130, 246, 0.1)', 
  borderWidth: 1, 
  borderColor: 'rgba(59, 130, 246, 0.3)', 
  borderRadius: 12, 
  padding: 16, 
  color: '#fff', 
  fontSize: 16, 
  fontWeight: '600' 
},
inputHint: { 
  color: '#6B7280', 
  fontSize: 11, 
  marginTop: 6, 
  fontStyle: 'italic' 
},
calculateButton: { 
  backgroundColor: '#3B82F6', 
  borderRadius: 16, 
  padding: 18, 
  alignItems: 'center', 
  marginTop: 8, 
  marginBottom: 24 
},
calculateButtonText: { 
  color: '#fff', 
  fontSize: 18, 
  fontWeight: '900' 
},

// Results
resultsCard: { 
  backgroundColor: 'rgba(16, 185, 129, 0.1)', 
  borderRadius: 16, 
  padding: 20, 
  borderWidth: 1, 
  borderColor: 'rgba(16, 185, 129, 0.3)' 
},
resultsTitle: { 
  color: '#10B981', 
  fontSize: 18, 
  fontWeight: '900', 
  marginBottom: 20, 
  textAlign: 'center' 
},
resultRow: { 
  flexDirection: 'row', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  paddingVertical: 12, 
  borderBottomWidth: 1, 
  borderBottomColor: 'rgba(255, 255, 255, 0.1)' 
},
resultRowTotal: { 
  borderBottomWidth: 0, 
  marginTop: 8, 
  paddingTop: 16, 
  borderTopWidth: 2, 
  borderTopColor: '#10B981' 
},
resultLabel: { 
  color: '#9CA3AF', 
  fontSize: 14, 
  fontWeight: '600' 
},
resultValue: { 
  color: '#fff', 
  fontSize: 18, 
  fontWeight: '900' 
},
resultGain: { 
  color: '#10B981' 
},
resultLabelTotal: { 
  color: '#10B981', 
  fontSize: 16, 
  fontWeight: '900' 
},
resultValueTotal: { 
  color: '#10B981', 
  fontSize: 24, 
  fontWeight: '900' 
},

// Visual Bar
visualBar: { 
  marginTop: 20, 
  marginBottom: 16 
},
visualBarSection: { 
  marginBottom: 12 
},
visualBarFill: { 
  height: 32, 
  borderRadius: 8, 
  justifyContent: 'center', 
  paddingHorizontal: 12, 
  marginBottom: 4 
},
visualBarLabel: { 
  color: '#E5E7EB', 
  fontSize: 12, 
  fontWeight: '700' 
},

// Insight
insightCard: { 
  backgroundColor: 'rgba(59, 130, 246, 0.1)', 
  borderRadius: 12, 
  padding: 16, 
  marginTop: 16 
},
insightText: { 
  color: '#E5E7EB', 
  fontSize: 13, 
  lineHeight: 20 
},

// Add these to your existing styles object:

// Comparison Sections
compareSection: { 
  backgroundColor: 'rgba(59, 130, 246, 0.1)', 
  borderRadius: 12, 
  padding: 16, 
  marginBottom: 16,
  borderLeftWidth: 4,
  borderLeftColor: '#3B82F6'
},
compareSectionTitle: { 
  color: '#3B82F6', 
  fontSize: 16, 
  fontWeight: '900', 
  marginBottom: 12 
},

// Winner Card
winnerCard: { 
  backgroundColor: 'rgba(251, 191, 36, 0.2)', 
  borderRadius: 12, 
  padding: 16, 
  marginTop: 16,
  alignItems: 'center',
  borderWidth: 2,
  borderColor: '#FBBF24'
},
winnerText: { 
  color: '#FBBF24', 
  fontSize: 20, 
  fontWeight: '900', 
  marginBottom: 8 
},
winnerSubtext: { 
  color: '#FCD34D', 
  fontSize: 13, 
  textAlign: 'center' 
},

// Fund Compare Styles
searchResultsBox: { 
  backgroundColor: 'rgba(26, 26, 26, 0.8)', 
  borderRadius: 12, 
  marginBottom: 16,
  maxHeight: 250,
  borderWidth: 1,
  borderColor: 'rgba(236, 72, 153, 0.3)'
},
searchResultItem: { 
  padding: 16, 
  borderBottomWidth: 1, 
  borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center'
},
searchResultName: { 
  color: '#fff', 
  fontSize: 14, 
  fontWeight: '600',
  flex: 1,
  marginRight: 12
},
searchResultCagr: { 
  color: '#10B981', 
  fontSize: 14, 
  fontWeight: '900' 
},

// Selected Funds
selectedFundsContainer: { 
  marginBottom: 24 
},
selectedFundCard: { 
  backgroundColor: 'rgba(236, 72, 153, 0.2)', 
  borderRadius: 12, 
  padding: 16, 
  marginBottom: 8,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderWidth: 1,
  borderColor: 'rgba(236, 72, 153, 0.4)'
},
selectedFundInfo: { 
  flex: 1, 
  marginRight: 12 
},
selectedFundName: { 
  color: '#fff', 
  fontSize: 14, 
  fontWeight: '700', 
  marginBottom: 4 
},
selectedFundCagr: { 
  color: '#EC4899', 
  fontSize: 12, 
  fontWeight: '600' 
},
removeFundButton: { 
  color: '#EF4444', 
  fontSize: 24, 
  fontWeight: '900',
  width: 32,
  height: 32,
  textAlign: 'center'
},

// Comparison Table
comparisonTable: { 
  backgroundColor: 'rgba(236, 72, 153, 0.1)', 
  borderRadius: 16, 
  padding: 16,
  marginTop: 16,
  borderWidth: 1,
  borderColor: 'rgba(236, 72, 153, 0.3)'
},
comparisonRow: { 
  flexDirection: 'row', 
  paddingVertical: 12, 
  borderBottomWidth: 1, 
  borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  alignItems: 'center'
},
comparisonLabel: { 
  color: '#EC4899', 
  fontSize: 13, 
  fontWeight: '700',
  width: 80
},
comparisonValue: { 
  color: '#fff', 
  fontSize: 13, 
  fontWeight: '600',
  flex: 1,
  textAlign: 'center'
},
comparisonVerdict: { 
  color: '#10B981', 
  fontSize: 11, 
  fontWeight: '600',
  flex: 1,
  textAlign: 'center'
},

// Risk Analyzer Styles
quizTitle: { 
  color: '#F59E0B', 
  fontSize: 18, 
  fontWeight: '900', 
  marginBottom: 20,
  textAlign: 'center'
},
questionCard: { 
  backgroundColor: 'rgba(245, 158, 11, 0.1)', 
  borderRadius: 12, 
  padding: 16, 
  marginBottom: 16,
  borderLeftWidth: 4,
  borderLeftColor: '#F59E0B'
},
questionText: { 
  color: '#fff', 
  fontSize: 14, 
  fontWeight: '700', 
  marginBottom: 12 
},
optionButton: { 
  backgroundColor: 'rgba(26, 26, 26, 0.8)', 
  borderRadius: 8, 
  padding: 12, 
  marginBottom: 8,
  borderWidth: 1,
  borderColor: 'rgba(245, 158, 11, 0.3)'
},
optionSelected: { 
  backgroundColor: 'rgba(245, 158, 11, 0.3)',
  borderColor: '#F59E0B',
  borderWidth: 2
},
optionText: { 
  color: '#9CA3AF', 
  fontSize: 13, 
  fontWeight: '600' 
},
optionTextSelected: { 
  color: '#FBBF24', 
  fontWeight: '900' 
},

// Risk Profile Result
riskProfileCard: { 
  backgroundColor: 'rgba(245, 158, 11, 0.2)', 
  borderRadius: 16, 
  padding: 20, 
  alignItems: 'center',
  marginBottom: 16,
  borderWidth: 2,
  borderColor: '#F59E0B'
},
riskProfileName: { 
  color: '#FBBF24', 
  fontSize: 28, 
  fontWeight: '900', 
  marginBottom: 8 
},
riskProfileScore: { 
  color: '#FCD34D', 
  fontSize: 14, 
  fontWeight: '700' 
},
riskDescription: { 
  color: '#E5E7EB', 
  fontSize: 14, 
  lineHeight: 22, 
  marginBottom: 20,
  textAlign: 'center'
},

// Tax Optimizer - ELSS Funds
elssFundCard: { 
  backgroundColor: 'rgba(239, 68, 68, 0.1)', 
  borderRadius: 12, 
  padding: 16, 
  marginBottom: 12,
  borderLeftWidth: 4,
  borderLeftColor: '#EF4444'
},
elssFundName: { 
  color: '#fff', 
  fontSize: 14, 
  fontWeight: '700', 
  marginBottom: 8 
},
elssFundMeta: { 
  flexDirection: 'row', 
  gap: 16 
},
elssFundMetaItem: { 
  flex: 1 
},
elssFundLabel: { 
  color: '#9CA3AF', 
  fontSize: 11, 
  fontWeight: '600', 
  marginBottom: 4 
},
elssFundValue: { 
  color: '#10B981', 
  fontSize: 14, 
  fontWeight: '900' 
},

// Enhanced Comparison Table
comparisonTableWide: { 
  backgroundColor: 'rgba(236, 72, 153, 0.1)', 
  borderRadius: 16, 
  padding: 16,
  marginTop: 16,
  borderWidth: 1,
  borderColor: 'rgba(236, 72, 153, 0.3)',
  minWidth: '100%'
},

// Header Row
comparisonHeaderRow: { 
  flexDirection: 'row', 
  paddingBottom: 16, 
  borderBottomWidth: 2, 
  borderBottomColor: '#EC4899',
  marginBottom: 8
},
comparisonMetricColumn: { 
  width: 120, 
  justifyContent: 'center',
  paddingRight: 12
},
comparisonFundColumn: { 
  width: 140, 
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 8
},
comparisonHeaderLabel: { 
  color: '#EC4899', 
  fontSize: 14, 
  fontWeight: '900'
},
comparisonFundHeader: { 
  color: '#fff', 
  fontSize: 12, 
  fontWeight: '900',
  textAlign: 'center',
  lineHeight: 16
},

// Data Rows
comparisonDataRow: { 
  flexDirection: 'row', 
  paddingVertical: 12, 
  borderBottomWidth: 1, 
  borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  minHeight: 50,
  alignItems: 'center'
},
highlightRow: {
  backgroundColor: 'rgba(236, 72, 153, 0.05)'
},
comparisonMetricName: { 
  color: '#EC4899', 
  fontSize: 13, 
  fontWeight: '700'
},
comparisonValueText: { 
  color: '#fff', 
  fontSize: 13, 
  fontWeight: '600',
  textAlign: 'center'
},
comparisonSubValue: {
  color: '#9CA3AF',
  fontSize: 11,
  fontWeight: '600',
  textAlign: 'center',
  marginTop: 2
},

// Value Colors
comparisonGreen: { 
  color: '#10B981' 
},
comparisonOrange: { 
  color: '#F59E0B' 
},
comparisonGray: { 
  color: '#6B7280',
  fontStyle: 'italic'
},
comparisonWinner: { 
  fontWeight: '900',
  fontSize: 15
},

// Risk Badge
riskBadge: {
  borderRadius: 8,
  paddingVertical: 4,
  paddingHorizontal: 8,
  alignSelf: 'center'
},

// Verdict Text
comparisonVerdictText: { 
  color: '#FBBF24', 
  fontSize: 12, 
  fontWeight: '700',
  textAlign: 'center',
  lineHeight: 16
},

// Learn Section Styles
tabContainer: { 
  flexDirection: 'row', 
  padding: 16, 
  gap: 8,
  backgroundColor: '#0F0F0F'
},
tabButton: { 
  flex: 1, 
  paddingVertical: 12, 
  paddingHorizontal: 16, 
  borderRadius: 12, 
  backgroundColor: 'rgba(139, 92, 246, 0.1)',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: 'rgba(139, 92, 246, 0.3)'
},
tabButtonActive: { 
  backgroundColor: '#8B5CF6',
  borderColor: '#8B5CF6'
},
tabText: { 
  color: '#9CA3AF', 
  fontSize: 13, 
  fontWeight: '700' 
},
tabTextActive: { 
  color: '#fff', 
  fontWeight: '900' 
},

// Learn Container
learnContainer: { 
  padding: 20 
},
learnSectionTitle: { 
  color: '#8B5CF6', 
  fontSize: 18, 
  fontWeight: '900', 
  marginBottom: 16 
},

// Topic Cards
topicCard: { 
  backgroundColor: 'rgba(139, 92, 246, 0.1)', 
  borderRadius: 16, 
  padding: 16, 
  marginBottom: 12,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderWidth: 1,
  borderColor: 'rgba(139, 92, 246, 0.3)',
  borderLeftWidth: 4,
  borderLeftColor: '#8B5CF6'
},
topicContent: { 
  flexDirection: 'row', 
  alignItems: 'center', 
  gap: 16, 
  flex: 1 
},
topicIcon: { 
  fontSize: 32 
},
topicInfo: { 
  flex: 1 
},
topicTitle: { 
  color: '#fff', 
  fontSize: 16, 
  fontWeight: '900', 
  marginBottom: 4 
},
topicSubtitle: { 
  color: '#A78BFA', 
  fontSize: 12, 
  fontWeight: '600' 
},

// Tip Cards
tipCard: { 
  backgroundColor: 'rgba(251, 191, 36, 0.1)', 
  borderRadius: 12, 
  padding: 16, 
  marginBottom: 12,
  borderLeftWidth: 4,
  borderLeftColor: '#FBBF24'
},
tipNumber: { 
  color: '#FBBF24', 
  fontSize: 12, 
  fontWeight: '900', 
  marginBottom: 8 
},
tipText: { 
  color: '#E5E7EB', 
  fontSize: 14, 
  lineHeight: 22 
},

// Glossary Cards
glossaryCard: { 
  backgroundColor: 'rgba(59, 130, 246, 0.1)', 
  borderRadius: 12, 
  padding: 16, 
  marginBottom: 12,
  borderLeftWidth: 4,
  borderLeftColor: '#3B82F6'
},
glossaryTerm: { 
  color: '#3B82F6', 
  fontSize: 16, 
  fontWeight: '900', 
  marginBottom: 6 
},
glossaryDefinition: { 
  color: '#E5E7EB', 
  fontSize: 13, 
  lineHeight: 20 
},

// Article View
articleContainer: { 
  padding: 20 
},
articleTitle: { 
  color: '#fff', 
  fontSize: 28, 
  fontWeight: '900', 
  marginBottom: 8 
},
articleSubtitle: { 
  color: '#8B5CF6', 
  fontSize: 16, 
  fontWeight: '700', 
  marginBottom: 24 
},
articleContent: { 
  color: '#E5E7EB', 
  fontSize: 15, 
  lineHeight: 26,
  letterSpacing: 0.2
},

// Top Funds Screen Styles
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterScrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    maxHeight: 70,
  },
  filterChip: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#374151',
  },
  filterChipActive: {
    backgroundColor: '#A855F7',
    borderColor: '#A855F7',
  },
  filterText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  topFundsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  topFundCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
    flexDirection: 'row',
    gap: 16,
  },
  rankBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  topFundInfo: {
    flex: 1,
  },
  topFundName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    lineHeight: 22,
  },
  topFundMetricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  topFundMetricBox: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 8,
  },
  topFundMetricLabel: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  topFundMetricValue: {
    color: '#A855F7',
    fontSize: 16,
    fontWeight: '900',
  },
  topFundBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topFundRiskBadge: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  topFundRiskText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '700',
  },
  topFundScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scoreEmoji: {
    fontSize: 16,
  },
  scoreNumber: {
    fontSize: 16,
    fontWeight: '900',
  },

  // Enhanced Metrics Styles
  metricsSection: {
    marginBottom: 20,
  },
  metricsTabsContainer: {
    paddingHorizontal: 0,
    paddingVertical: 16,
    maxHeight: 80,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  metricsTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1F2937',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  metricsTabActive: {
    backgroundColor: '#A855F7',
    borderColor: '#A855F7',
  },
  metricsTabIcon: {
    fontSize: 18,
  },
  metricsTabLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '700',
  },
  metricsTabLabelActive: {
    color: '#FFFFFF',
  },
  metricsContent: {
    paddingTop: 20,
  },
  metricsSectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 12,
    marginBottom: 16,
  },
  metricCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  metricLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  metricGoodValue: {
    color: '#6B7280',
    fontSize: 10,
    fontStyle: 'italic',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  gridItem: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    width: '30%',
    borderWidth: 1,
    borderColor: '#374151',
  },
  gridLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  gridValue: {
    color: '#A855F7',
    fontSize: 18,
    fontWeight: '900',
  },

  // Warning Banner Styles
  warningBanner: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#FBBF24',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 20,
    flexDirection: 'row',
    gap: 12,
  },
  warningBannerIcon: {
    fontSize: 24,
  },
  warningBannerTextContainer: {
    flex: 1,
  },
  warningBannerTitle: {
    color: '#FBBF24',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 4,
  },
  warningBannerText: {
    color: '#FCD34D',
    fontSize: 12,
    lineHeight: 18,
  },

// Bottom Navigation Styles (ADD BEFORE });)
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#1A1A1A',
    flexDirection: 'row',           // ← Makes icons horizontal
    justifyContent: 'space-around',  // ← Evenly spaces icons
    alignItems: 'center',
    paddingBottom: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  
  navLabel: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  
  navLabelActive: {
    color: '#A855F7',
  },

  // ============================================================
// SCORE STYLES
// ============================================================

scoreBadge: {
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 12,
  paddingVertical: 6,
  backgroundColor: '#F3F4F6',
  borderRadius: 8,
  marginRight: 8,
},

scoreEmoji: {
  fontSize: 16,
  marginBottom: 2,
},

scoreValue: {
  fontSize: 16,
  fontWeight: '700',
  color: '#1F2937',
},

// Fund Details Score Section
scoreSection: {
  backgroundColor: '#F9FAFB',
  borderRadius: 12,
  padding: 16,
  marginTop: 12,
  marginBottom: 16,
  borderWidth: 1,
  borderColor: '#E5E7EB',
},

scoreHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
},

scoreTitle: {
  fontSize: 16,
  fontWeight: '700',
  color: '#1F2937',
},

scoreAdjusted: {
  fontSize: 12,
  color: '#9CA3AF',
  fontStyle: 'italic',
},

scoreDisplay: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 20,
},

scoreCircle: {
  width: 80,
  height: 80,
  borderRadius: 40,
  backgroundColor: '#FFFFFF',
  borderWidth: 4,
  borderColor: '#A855F7',
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},

scoreNumber: {
  fontSize: 28,
  fontWeight: '800',
  color: '#A855F7',
},

scoreOutOf: {
  fontSize: 12,
  color: '#6B7280',
  fontWeight: '600',
},

scoreTierInfo: {
  flex: 1,
  justifyContent: 'center',
},

scoreTierEmoji: {
  fontSize: 32,
  marginBottom: 4,
},

scoreTierLabel: {
  fontSize: 18,
  fontWeight: '700',
  color: '#1F2937',
  marginBottom: 4,
},

scoreMissing: {
  fontSize: 12,
  color: '#9CA3AF',
  marginTop: 4,
},

// ========== PHASE 3: CATEGORY DISPLAY ==========
  
  // Category in Search Results
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  
  categoryEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  
  categoryText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  
  // Category in Top Funds
  topFundCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 2,
  },
  
  topFundCategoryEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  
  topFundCategoryText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  
  topFundRisk: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  
  // Category Banner in Fund Details
  categoryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  
  categoryBannerEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  
  categoryBannerTextContainer: {
    flex: 1,
  },
  
  categoryBannerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  
  categoryBannerSubtext: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  
  // ========== PHASE 3: SCORE DISPLAY ==========
  
  // Score Badge Insufficient State
  scoreBadgeInsufficient: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
  },
  
  scoreValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 4,
  },
  
  scoreValueInsufficient: {
    color: '#9CA3AF',
  },
  
  scoreNumberInsufficient: {
    color: '#9CA3AF',
  },
  
  // ========== PHASE 3: SCORE CARD ==========
  
  scoreSection: {
    marginBottom: 20,
  },
  
  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  
  scoreLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  
  scoreCategory: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  
  scoreLarge: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1F2937',
  },
  
  scoreOutOf: {
    fontSize: 16,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  
  scoreTier: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  scoreTierEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  
  scoreTierLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  
  // Score Meter (Progress Bar)
  scoreMeter: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  
  scoreMeterFill: {
    height: '100%',
    borderRadius: 4,
  },
  
  // Reliability
  reliabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  reliabilityLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginRight: 8,
  },
  
  reliabilityValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  
  reliabilityHigh: {
    color: '#10B981',
  },
  
  reliabilityModerate: {
    color: '#F59E0B',
  },
  
  reliabilityPreliminary: {
    color: '#3B82F6',
  },
  
  metricsUsed: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  
  // ========== PHASE 3: INSUFFICIENT DATA BANNER ==========
  
  insufficientDataBanner: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  
  insufficientDataEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  
  insufficientDataTextContainer: {
    flex: 1,
  },
  
  insufficientDataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  
  insufficientDataReason: {
    fontSize: 13,
    color: '#78350F',
  },
  
  // ========== PHASE 3: SCORE BREAKDOWN ==========
  
  breakdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  
  breakdownButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  
  breakdownButtonIcon: {
    fontSize: 14,
    color: '#3B82F6',
  },
  
  scoreBreakdown: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  breakdownMetric: {
    flex: 1,
  },
  
  breakdownMetricName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  
  breakdownMetricValue: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  
  breakdownContribution: {
    alignItems: 'flex-end',
    width: 100,
  },
  
  breakdownContributionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 4,
  },
  
  breakdownBar: {
    width: 80,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  
  breakdownBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  
  missingMetrics: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  
  missingMetricsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  
  missingMetricsList: {
    fontSize: 11,
    color: '#9CA3AF',
    lineHeight: 16,
  },

  // ========== PHASE 5: MY FUND ANALYZER ==========

// Instructions Card
instructionsCard: {
  backgroundColor: 'rgba(59, 130, 246, 0.1)',
  borderRadius: 16,
  padding: 20,
  margin: 20,
  borderWidth: 1,
  borderColor: 'rgba(59, 130, 246, 0.3)',
},

instructionsTitle: {
  color: '#fff',
  fontSize: 18,
  fontWeight: '900',
  marginBottom: 8,
},

instructionsText: {
  color: '#A78BFA',
  fontSize: 14,
  lineHeight: 20,
},

// Analyzer Container
analyzerContainer: {
  padding: 20,
},

// Your Fund Card
yourFundCard: {
  backgroundColor: 'rgba(124, 58, 237, 0.15)',
  borderRadius: 20,
  padding: 20,
  marginBottom: 24,
  borderWidth: 1,
  borderColor: 'rgba(124, 58, 237, 0.3)',
},

yourFundDetails: {
  marginTop: 12,
},

yourFundName: {
  color: '#fff',
  fontSize: 18,
  fontWeight: '900',
  marginBottom: 12,
},

yourFundMetrics: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 12,
  marginTop: 16,
},

metricItem: {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: 12,
  padding: 12,
  flex: 1,
  minWidth: '45%',
},

metricLabel: {
  color: '#A78BFA',
  fontSize: 12,
  fontWeight: '700',
  marginBottom: 4,
},

metricValue: {
  color: '#fff',
  fontSize: 20,
  fontWeight: '900',
},

scoreDisplay: {
  flexDirection: 'row',
  alignItems: 'baseline',
  gap: 8,
},

scoreTierText: {
  color: '#A78BFA',
  fontSize: 14,
  fontWeight: '600',
},

// Recommendations Section
recommendationsSection: {
  marginTop: 24,
},

// Recommendation Card
recommendationCard: {
  backgroundColor: 'rgba(26, 26, 26, 0.8)',
  borderRadius: 20,
  padding: 20,
  marginBottom: 16,
  borderWidth: 1,
  borderColor: 'rgba(124, 58, 237, 0.3)',
},

// Switch Potential Badge
switchPotentialBadge: {
  alignSelf: 'flex-start',
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 20,
  marginBottom: 12,
},

switchPotentialHigh: {
  backgroundColor: 'rgba(34, 197, 94, 0.2)',
  borderWidth: 1,
  borderColor: 'rgba(34, 197, 94, 0.5)',
},

switchPotentialModerate: {
  backgroundColor: 'rgba(251, 146, 60, 0.2)',
  borderWidth: 1,
  borderColor: 'rgba(251, 146, 60, 0.5)',
},

switchPotentialLow: {
  backgroundColor: 'rgba(156, 163, 175, 0.2)',
  borderWidth: 1,
  borderColor: 'rgba(156, 163, 175, 0.5)',
},

switchPotentialText: {
  color: '#fff',
  fontSize: 12,
  fontWeight: '700',
},

// Recommendation Name
recommendationName: {
  color: '#fff',
  fontSize: 18,
  fontWeight: '900',
  marginBottom: 8,
},

// Score Comparison
scoreComparison: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: 'rgba(124, 58, 237, 0.1)',
  borderRadius: 12,
  padding: 16,
  marginVertical: 12,
},

scoreCompareItem: {
  flex: 1,
  alignItems: 'center',
},

scoreCompareLabel: {
  color: '#A78BFA',
  fontSize: 12,
  fontWeight: '600',
  marginBottom: 4,
},

scoreCompareValue: {
  color: '#fff',
  fontSize: 24,
  fontWeight: '900',
},

scoreCompareHighlight: {
  color: '#22C55E',
},

scoreArrow: {
  color: '#A78BFA',
  fontSize: 24,
  marginHorizontal: 12,
},

// Improvement Row
improvementRow: {
  backgroundColor: 'rgba(34, 197, 94, 0.1)',
  borderRadius: 8,
  padding: 12,
  marginBottom: 12,
},

improvementText: {
  color: '#22C55E',
  fontSize: 14,
  fontWeight: '700',
  textAlign: 'center',
},

// Recommendation Metrics
recMetrics: {
  flexDirection: 'row',
  gap: 12,
  marginVertical: 12,
},

recMetricItem: {
  flex: 1,
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: 8,
  padding: 10,
},

recMetricLabel: {
  color: '#A78BFA',
  fontSize: 11,
  fontWeight: '600',
  marginBottom: 4,
},

recMetricValue: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '900',
},

expenseSavings: {
  color: '#22C55E',
  fontSize: 10,
  fontWeight: '600',
  marginTop: 2,
},

// Recommendation Actions
recActions: {
  flexDirection: 'row',
  gap: 12,
  marginTop: 16,
},

recButtonPrimary: {
  flex: 1,
  backgroundColor: '#7C3AED',
  borderRadius: 12,
  padding: 14,
  alignItems: 'center',
},

recButtonPrimaryText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: '700',
},

recButtonSecondary: {
  flex: 1,
  backgroundColor: 'rgba(124, 58, 237, 0.2)',
  borderRadius: 12,
  padding: 14,
  alignItems: 'center',
  borderWidth: 1,
  borderColor: 'rgba(124, 58, 237, 0.4)',
},

recButtonSecondaryText: {
  color: '#A78BFA',
  fontSize: 14,
  fontWeight: '700',
},

// No Recommendations
noRecommendationsCard: {
  backgroundColor: 'rgba(34, 197, 94, 0.1)',
  borderRadius: 20,
  padding: 30,
  marginTop: 24,
  alignItems: 'center',
  borderWidth: 1,
  borderColor: 'rgba(34, 197, 94, 0.3)',
},

noRecommendationsEmoji: {
  fontSize: 48,
  marginBottom: 12,
},

noRecommendationsTitle: {
  color: '#22C55E',
  fontSize: 20,
  fontWeight: '900',
  marginBottom: 8,
  textAlign: 'center',
},

noRecommendationsText: {
  color: '#A78BFA',
  fontSize: 14,
  textAlign: 'center',
  lineHeight: 20,
},

// Reset Button
resetButton: {
  backgroundColor: 'rgba(124, 58, 237, 0.2)',
  borderRadius: 12,
  padding: 16,
  marginTop: 24,
  marginBottom: 40,
  alignItems: 'center',
  borderWidth: 1,
  borderColor: 'rgba(124, 58, 237, 0.4)',
},

resetButtonText: {
  color: '#A78BFA',
  fontSize: 14,
  fontWeight: '700',
},

// ========== PHASE 5: COMPARISON SCREEN ==========

// Comparison Header
comparisonHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 20,
  gap: 12,
},

comparisonFundCard: {
  flex: 1,
  backgroundColor: 'rgba(124, 58, 237, 0.15)',
  borderRadius: 16,
  padding: 16,
  borderWidth: 1,
  borderColor: 'rgba(124, 58, 237, 0.3)',
},

comparisonFundName: {
  color: '#fff',
  fontSize: 14,
  fontWeight: '700',
  marginBottom: 8,
  minHeight: 40,
},

comparisonScore: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},

comparisonScoreEmoji: {
  fontSize: 20,
},

comparisonScoreValue: {
  color: '#fff',
  fontSize: 24,
  fontWeight: '900',
},

comparisonVs: {
  color: '#A78BFA',
  fontSize: 16,
  fontWeight: '900',
},

// Comparison Table
comparisonTable: {
  padding: 20,
  paddingTop: 0,
},

comparisonRow: {
  backgroundColor: 'rgba(26, 26, 26, 0.8)',
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: 'rgba(124, 58, 237, 0.2)',
},

comparisonMetricName: {
  color: '#A78BFA',
  fontSize: 14,
  fontWeight: '700',
  marginBottom: 12,
},

comparisonValues: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},

comparisonValue: {
  flex: 1,
  color: '#fff',
  fontSize: 18,
  fontWeight: '900',
  textAlign: 'center',
},

comparisonValueBetter: {
  color: '#22C55E',
},

// Comparison Legend
comparisonLegend: {
  padding: 20,
  paddingTop: 0,
  marginBottom: 40,
},

comparisonLegendText: {
  color: '#A78BFA',
  fontSize: 12,
  textAlign: 'center',
  fontStyle: 'italic',
},

// ========== UTILITY STYLES ==========

greenGradient: {
  backgroundColor: '#22C55E',
},

// Investment Calculator Styles
recButtonCalculator: {
  flex: 1,
  backgroundColor: '#F3F4F6',
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 8,
  alignItems: 'center',
  marginLeft: 8,
  borderWidth: 1,
  borderColor: '#E5E7EB',
},
recButtonCalculatorText: {
  color: '#374151',
  fontSize: 13,
  fontWeight: '600',
},
calculatorSection: {
  marginTop: 16,
  padding: 16,
  backgroundColor: '#F9FAFB',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#E5E7EB',
},
calculatorTitle: {
  fontSize: 16,
  fontWeight: '700',
  color: '#111827',
  marginBottom: 16,
},
inputGroup: {
  marginBottom: 16,
},
inputLabel: {
  fontSize: 13,
  fontWeight: '600',
  color: '#6B7280',
  marginBottom: 8,
},
amountInput: {
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#D1D5DB',
  borderRadius: 8,
  paddingVertical: 12,
  paddingHorizontal: 16,
  fontSize: 15,
  color: '#111827',
},
dateInput: {
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#D1D5DB',
  borderRadius: 8,
  paddingVertical: 12,
  paddingHorizontal: 16,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},
dateInputText: {
  fontSize: 15,
  color: '#111827',
},
dateInputPlaceholder: {
  fontSize: 15,
  color: '#9CA3AF',
},
dateInputIcon: {
  fontSize: 18,
},
calculateButton: {
  backgroundColor: '#8B5CF6',
  paddingVertical: 14,
  borderRadius: 8,
  alignItems: 'center',
  marginTop: 8,
},
calculateButtonText: {
  color: '#FFFFFF',
  fontSize: 15,
  fontWeight: '700',
},
resultsSection: {
  marginTop: 20,
},
resultsTitle: {
  fontSize: 16,
  fontWeight: '700',
  color: '#111827',
  marginBottom: 12,
},
resultCard: {
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: '#E5E7EB',
},
resultCardHighlight: {
  borderColor: '#8B5CF6',
  borderWidth: 2,
},
resultHeader: {
  marginBottom: 12,
  paddingBottom: 8,
  borderBottomWidth: 1,
  borderBottomColor: '#E5E7EB',
},
resultLabel: {
  fontSize: 14,
  fontWeight: '700',
  color: '#6B7280',
},
resultDetails: {
  gap: 8,
},
resultRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 4,
},
resultKey: {
  fontSize: 13,
  color: '#6B7280',
},
resultValue: {
  fontSize: 14,
  color: '#111827',
  fontWeight: '600',
},
resultValueBold: {
  fontSize: 16,
  fontWeight: '700',
  color: '#111827',
},
returnPositive: {
  color: '#10B981',
},
returnNegative: {
  color: '#EF4444',
},
differenceCard: {
  padding: 20,
  borderRadius: 12,
  alignItems: 'center',
  marginTop: 12,
},
differencePositive: {
  backgroundColor: '#D1FAE5',
  borderWidth: 2,
  borderColor: '#10B981',
},
differenceNegative: {
  backgroundColor: '#FEE2E2',
  borderWidth: 2,
  borderColor: '#EF4444',
},
differenceTitle: {
  fontSize: 14,
  fontWeight: '600',
  color: '#374151',
  marginBottom: 8,
},
differenceAmount: {
  fontSize: 28,
  fontWeight: '800',
  color: '#111827',
  marginBottom: 4,
},
differenceSubtext: {
  fontSize: 15,
  color: '#6B7280',
  fontWeight: '600',
  marginBottom: 8,
},
differenceDetail: {
  fontSize: 13,
  color: '#6B7280',
},


adjustmentNotice: {
  backgroundColor: '#FEF3C7',
  borderLeftWidth: 4,
  borderLeftColor: '#F59E0B',
  padding: 15,
  borderRadius: 8,
  marginBottom: 15,
  flexDirection: 'row',
  gap: 12,
},
adjustmentIcon: {
  fontSize: 24,
},
adjustmentTextContainer: {
  flex: 1,
},
adjustmentTitle: {
  fontSize: 14,
  fontWeight: '700',
  color: '#92400E',
  marginBottom: 6,
},
adjustmentText: {
  fontSize: 13,
  color: '#78350F',
  lineHeight: 18,
  marginBottom: 8,
},
adjustmentDetail: {
  fontSize: 12,
  color: '#92400E',
  marginBottom: 2,
},


});