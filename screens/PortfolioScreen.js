import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { API_ENDPOINTS } from '../config/api';
import { analyzePortfolio, searchFunds } from '../services/fundService';

const PortfolioScreen = ({ 
  setSelectedFund, 
  navigation, 
  portfolioStage, 
  setPortfolioStage, 
  portfolioAnalysis, 
  setPortfolioAnalysis 
}) => {
  const [csvText, setCsvText] = useState('');
  
  const stage = portfolioStage || 'import';
  const setStage = setPortfolioStage;
  const analysis = portfolioAnalysis || null;
  const setAnalysis = setPortfolioAnalysis;
  
  const [rawItems, setRawItems] = useState([]);
  const [mappingIndex, setMappingIndex] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🟢 STATES FOR AUTOMATIC FOMO CHECK
  const [fomoData, setFomoData] = useState({});
  const [fomoLoading, setFomoLoading] = useState(false);

  // 🟢 HELPER: Format large numbers into compact text (e.g., 1.5L, 10K) so it fits above the bars
  const formatCompact = (num) => {
    if (!num) return '0';
    if (num >= 10000000) return (num / 10000000).toFixed(2) + 'Cr';
    if (num >= 100000) return (num / 100000).toFixed(1) + 'L';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.round(num).toString();
  };

  // --- STAGE 1: IMPORT & PARSE ---
  const loadDemoData = () => {
    const demoData = `Parag Parikh Flexi Cap, SIP, 01-01-2022, 10000\nQuant Small Cap, Lumpsum, 15-06-2023, 50000\nHDFC Defence Fund, SIP, 10-01-2023, 5000`;
    setCsvText(demoData);
  };

  const handleParseCsv = () => {
    if (!csvText.trim()) {
      Alert.alert("Hold up! 🛑", "Please paste your portfolio data or click 'Load Demo Portfolio' first.");
      return;
    }

    const rows = csvText.split('\n').filter(row => row.trim() !== '');
    const items = rows.map(row => {
      const parts = row.split(',');
      const amt = parseFloat(parts[3]);
      
      return { 
        fund_name: parts[0]?.trim() || 'Unknown Fund', 
        amfi_code: null, 
        investment_type: parts[1]?.trim() || 'Lumpsum', 
        invested_date: parts[2]?.trim() || '01-01-2023', 
        invested_amount: isNaN(amt) ? 10000 : amt
      };
    });

    setRawItems(items);
    setMappingIndex(0); 
    setStage('mapping');
    performFuzzySearch(items[0].fund_name);
  };

  // --- STAGE 2: FUZZY MAPPING ---
  const performFuzzySearch = async (query) => {
    if (!query) return;
    setLoading(true);
    try {
      const data = await searchFunds(query);
      setSearchResults(data.results || []);
    } catch (e) { 
      console.error(e); 
    } finally {
      setLoading(false);
    }
  };

  const selectFund = (fund) => {
    const updatedRaw = [...rawItems];
    updatedRaw[mappingIndex].amfi_code = fund.code ? parseInt(fund.code, 10) : null;
    updatedRaw[mappingIndex].fund_name = fund.name; 
    setRawItems(updatedRaw);

    if (mappingIndex < rawItems.length - 1) {
      setMappingIndex(mappingIndex + 1);
      setSearchResults([]);
      performFuzzySearch(rawItems[mappingIndex + 1].fund_name);
    } else {
      handleFinalAnalysis(updatedRaw);
    }
  };

  // --- STAGE 3: DASHBOARD API CALL ---
  const handleFinalAnalysis = async (finalItems) => {
    setLoading(true);
    setStage('dashboard');
    setFomoData({}); 
    setFomoLoading(true);

    try {
      const data = await analyzePortfolio(finalItems);
      setAnalysis(data);
      setLoading(false);

      // AUTOMATICALLY RUN FOMO FOR ALL REBALANCE FUNDS
      const newFomoData = {};
      const promises = data.funds.map(async (fund) => {
        if (fund.verdict === 'Rebalance' && fund.recommendation) {
          const originalItem = finalItems.find(item => item.amfi_code === fund.amfi_code);
          if (!originalItem) return;

          const payload = {
            fund1_code: fund.amfi_code,
            fund2_code: fund.recommendation.code,
            investment_date: originalItem.invested_date || '01-01-2023',
            investment_amount: originalItem.invested_amount || 10000,
            investment_type: originalItem.investment_type || 'LUMPSUM'
          };

          try {
            const response = await fetch(API_ENDPOINTS.COMPARE_INVESTMENT, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            if (response.ok) {
              const resData = await response.json();
              newFomoData[fund.amfi_code] = resData;
            }
          } catch (e) {
            console.log(`FOMO failed for ${fund.amfi_code}`);
          }
        }
      });

      await Promise.all(promises);
      setFomoData(newFomoData);

    } catch (e) { 
      Alert.alert("Error", "Vibe check failed! Make sure the backend is running."); 
      setStage('import'); 
      setLoading(false);
    } finally { 
      setFomoLoading(false); 
    }
  };

  // ==========================================
  // DATA PREP FOR DASHBOARD STAGE
  // ==========================================
  let topPerformer = null;
  let worstPerformer = null;
  let totalWins = 0;
  let totalLosses = 0;
  let totalPortfolioValue = analysis?.vibe_check?.current_value || 1;
  let validFunds = [];
  let maxFundValue = 1; 

  let totalMissedGains = 0;
  let maxOptValue = 1;

  if (analysis?.funds?.length > 0) {
    validFunds = analysis.funds.filter(f => !f.error && f.returns);
    
    if (validFunds.length > 0) {
      const sortedFunds = [...validFunds].sort((a, b) => b.returns.absolute - a.returns.absolute);
      topPerformer = sortedFunds[0];
      worstPerformer = sortedFunds[sortedFunds.length - 1];
      
      maxFundValue = Math.max(...validFunds.map(f => Math.max(f.current_value, f.current_value - (f.returns.absolute || 0))));
    }
    
    totalWins = analysis.funds.filter(f => f.status === 'W').length;
    totalLosses = analysis.funds.filter(f => f.status === 'L').length;

    // Prep Optimization Graph Scaling
    validFunds.forEach(fund => {
        let optVal = fund.current_value;
        if (fund.verdict === 'Rebalance' && fomoData[fund.amfi_code]) {
            const diff = fomoData[fund.amfi_code]?.comparison?.value_difference || 0;
            if (diff > 0) totalMissedGains += diff;
            optVal = fomoData[fund.amfi_code]?.fund2?.current?.value || fund.current_value;
        }
        maxOptValue = Math.max(maxOptValue, fund.current_value, optVal);
    });
  }

  const totalAbsoluteReturn = (analysis?.vibe_check?.current_value || 0) - (analysis?.vibe_check?.total_invested || 0);
  const isOverallProfit = totalAbsoluteReturn >= 0;


  // ==========================================
  // RENDER: IMPORT STAGE
  // ==========================================
  if (stage === 'import') return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <Text style={styles.title}>Vibe Check ⚡</Text>
        <Text style={styles.subtitle}>Paste your mutual fund data below (Name, Type, Date, Amount)</Text>
      </View>

      <TextInput
        style={styles.csvInput}
        placeholder="e.g., HDFC Small Cap, SIP, 01-01-2023, 5000"
        placeholderTextColor="#6B7280"
        multiline
        value={csvText}
        onChangeText={setCsvText}
      />

      <TouchableOpacity style={styles.demoButton} onPress={loadDemoData}>
        <Text style={styles.demoButtonText}>🧪 Load Demo Portfolio</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.primaryButton} onPress={handleParseCsv}>
        <Text style={styles.primaryButtonText}>Analyze Portfolio 🚀</Text>
      </TouchableOpacity>
    </View>
  );

  // ==========================================
  // RENDER: MAPPING STAGE
  // ==========================================
  if (stage === 'mapping') return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <Text style={styles.title}>Mapping Vibes 🔍</Text>
        <Text style={styles.subtitle}>
          Linking item {mappingIndex + 1} of {rawItems.length}: 
          <Text style={{color: '#A855F7', fontWeight: 'bold'}}> {rawItems[mappingIndex]?.fund_name}</Text>
        </Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Correct fund name if needed..."
        placeholderTextColor="#6B7280"
        defaultValue={rawItems[mappingIndex]?.fund_name}
        onChangeText={performFuzzySearch}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#A855F7" style={{marginTop: 20}} />
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={item => item.code.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.searchResult} onPress={() => selectFund(item)}>
              <Text style={styles.resultName}>{item.name}</Text>
              <Text style={styles.resultMeta}>{item.category} • Score: {item.score?.total ? Math.round(item.score.total) : 'N/A'}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={{color: '#6B7280', textAlign: 'center', marginTop: 20}}>No exact matches. Try typing a different name.</Text>
          }
        />
      )}
    </View>
  );

  // ==========================================
  // RENDER: DASHBOARD STAGE
  // ==========================================
  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <View style={{alignItems: 'center', marginTop: 100}}>
          <ActivityIndicator size="large" color="#00FF41" />
          <Text style={{color: '#00FF41', marginTop: 16, fontWeight: 'bold'}}>Calculating Aura...</Text>
        </View>
      ) : (
        <View style={{ paddingBottom: 100 }}>
          <View style={styles.headerArea}>
            <TouchableOpacity onPress={() => { 
              setStage('import'); 
              setAnalysis(null); 
              setCsvText(''); 
              setRawItems([]);
              setFomoData({});
            }}>
              <Text style={{color: '#A855F7', marginBottom: 10}}>← Check Another</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Portfolio Results</Text>
          </View>

          {/* ========== AURA CARD ========== */}
          <View style={styles.auraCard}>
            <View style={styles.auraHeader}>
              <View>
                <Text style={styles.auraSmallLabel}>TOTAL INVESTED</Text>
                <Text style={styles.auraSmallValue}>₹{analysis?.vibe_check?.total_invested?.toLocaleString(undefined, {maximumFractionDigits: 0})}</Text>
              </View>
              <View style={{alignItems: 'flex-end'}}>
                <Text style={styles.auraSmallLabel}>CURRENT VALUE</Text>
                <Text style={[styles.auraSmallValue, { color: '#A855F7' }]}>
                  ₹{analysis?.vibe_check?.current_value?.toLocaleString(undefined, {maximumFractionDigits: 0})}
                </Text>
              </View>
            </View>

            <View style={styles.auraDivider} />

            <Text style={styles.auraLabel}>NET AURA</Text>
            <Text style={[styles.auraValue, { color: isOverallProfit ? '#10B981' : '#EF4444' }]}>
              {isOverallProfit ? '+' : ''}{analysis?.vibe_check?.net_aura}%
            </Text>
            <View style={styles.aiBubble}>
              <Text style={styles.aiText}>✨ {analysis?.vibe_check?.ai_message || "Your portfolio is giving main character energy!"}</Text>
            </View>
          </View>

          {/* ========== PERFORMANCE GRAPH ========== */}
          <Text style={styles.sectionTitle}>Performance Graph 📈</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: '#6B7280'}]}/><Text style={styles.legendText}>Invested</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: '#A855F7'}]}/><Text style={styles.legendText}>Current Value</Text></View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chartScrollContent}>
              {validFunds.map((fund, idx) => {
                const invested = fund.current_value - (fund.returns?.absolute || 0);
                const current = fund.current_value;
                
                const investedHeight = (invested / maxFundValue) * 150;
                const currentHeight = (current / maxFundValue) * 150;
                const isProfit = fund.returns?.absolute >= 0;

                return (
                  <View key={idx} style={styles.chartCol}>
                    <Text style={[styles.chartReturnText, { color: isProfit ? '#10B981' : '#EF4444' }]}>
                      {isProfit ? '+' : ''}{fund.returns?.percentage}%
                    </Text>
                    
                    <View style={styles.barGroupContainer}>
                      {/* 🟢 Invested Bar with Value on Top */}
                      <View style={styles.barWrapper}>
                        <Text style={styles.barValueText}>{formatCompact(invested)}</Text>
                        <View style={[styles.bar, { height: investedHeight, backgroundColor: '#6B7280' }]} />
                      </View>
                      
                      {/* 🟢 Current Bar with Value on Top */}
                      <View style={styles.barWrapper}>
                        <Text style={styles.barValueText}>{formatCompact(current)}</Text>
                        <View style={[styles.bar, { height: currentHeight, backgroundColor: isProfit ? '#A855F7' : '#EF4444' }]} />
                      </View>
                    </View>
                    
                    <Text style={styles.chartFundLabel} numberOfLines={2}>
                      {fund.fund_name.split(' ').slice(0, 2).join(' ')}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>


          {/* 🟢 FOMO SUMMARY & OPTIMIZATION GRAPH */}
          <Text style={styles.sectionTitle}>Portfolio Optimization 🎯</Text>
          
          {fomoLoading ? (
              <View style={styles.fomoLoadingCard}>
                  <ActivityIndicator size="small" color="#A855F7" />
                  <Text style={styles.fomoLoadingText}>Simulating Alternate Timelines...</Text>
              </View>
          ) : (
              <View style={styles.optimizationContainer}>
                  {/* Summary Card */}
                  <View style={[styles.missedGainsCard, { borderColor: totalMissedGains > 0 ? '#EF4444' : '#10B981' }]}>
                     <Text style={styles.missedGainsTitle}>💸 Wealth Left on the Table</Text>
                     <Text style={styles.missedGainsValue}>₹{totalMissedGains.toLocaleString(undefined, {maximumFractionDigits: 0})}</Text>
                     <Text style={styles.missedGainsSub}>
                        {totalMissedGains > 0 
                          ? "If you had invested in the AI optimal alternatives." 
                          : "Your portfolio is fully optimized! Zero missed gains."}
                     </Text>
                  </View>

                  {/* Combined Optimization Graph */}
                  <View style={styles.chartCard}>
                      <View style={styles.chartLegend}>
                          <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: '#A855F7'}]}/><Text style={styles.legendText}>Your Value</Text></View>
                          <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: '#10B981'}]}/><Text style={styles.legendText}>Optimal Value</Text></View>
                      </View>

                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chartScrollContent}>
                          {validFunds.map((fund, idx) => {
                              const currentVal = fund.current_value;
                              let optimalVal = currentVal;
                              let isKeep = fund.verdict === 'Keep';

                              if (!isKeep && fomoData[fund.amfi_code]) {
                                  optimalVal = fomoData[fund.amfi_code]?.fund2?.current?.value || currentVal;
                              }

                              const currentHeight = (currentVal / maxOptValue) * 150;
                              const optimalHeight = (optimalVal / maxOptValue) * 150;

                              return (
                                  <View key={idx} style={styles.chartCol}>
                                      <View style={[styles.verdictTag, { backgroundColor: isKeep ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' }]}>
                                          <Text style={[styles.verdictTagText, { color: isKeep ? '#10B981' : '#EF4444' }]}>
                                              {isKeep ? '✅ KEEP' : '🔄 SWAP'}
                                          </Text>
                                      </View>
                                      
                                      <View style={styles.barGroupContainer}>
                                          {/* 🟢 Your Value Bar with Top Text */}
                                          <View style={styles.barWrapper}>
                                              <Text style={styles.barValueText}>{formatCompact(currentVal)}</Text>
                                              <View style={[styles.bar, { height: currentHeight, backgroundColor: '#A855F7' }]} />
                                          </View>
                                          
                                          {/* 🟢 Optimal Value Bar with Top Text */}
                                          <View style={styles.barWrapper}>
                                              <Text style={styles.barValueText}>{formatCompact(optimalVal)}</Text>
                                              <View style={[styles.bar, { height: optimalHeight, backgroundColor: '#10B981' }]} />
                                          </View>
                                      </View>
                                      
                                      <Text style={styles.chartFundLabel} numberOfLines={2}>
                                          {fund.fund_name.split(' ').slice(0, 2).join(' ')}
                                      </Text>
                                  </View>
                              );
                          })}
                      </ScrollView>
                  </View>
              </View>
          )}

          {/* ========== PORTFOLIO DNA ========== */}
          <Text style={styles.sectionTitle}>Portfolio DNA 🧬</Text>
          <View style={styles.dnaContainer}>
            <View style={styles.dnaBar}>
              {Object.entries(analysis?.vibe_check?.category_distribution || {}).map(([cat, val], idx) => {
                const colors = ['#A855F7', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#EC4899'];
                const widthPct = (val / totalPortfolioValue) * 100;
                return (
                  <View key={idx} style={[styles.dnaSegment, { width: `${widthPct}%`, backgroundColor: colors[idx % colors.length] }]} />
                );
              })}
            </View>
            <View style={styles.dnaLegend}>
              {Object.entries(analysis?.vibe_check?.category_distribution || {}).map(([cat, val], idx) => {
                const colors = ['#A855F7', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#EC4899'];
                return (
                  <View key={idx} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors[idx % colors.length] }]} />
                    <Text style={styles.legendText}>{cat.split(' ')[0]} ({((val / totalPortfolioValue) * 100).toFixed(0)}%)</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* ========== TEAM STATS ========== */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statBoxTitle}>W/L Ratio</Text>
              <Text style={styles.statBoxValue}>{totalWins}W - {totalLosses}L</Text>
              <Text style={styles.statBoxSub}>Win Rate: {totalWins + totalLosses > 0 ? Math.round((totalWins/(totalWins+totalLosses))*100) : 0}%</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statBoxTitle}>Rebalance Target</Text>
              <Text style={[styles.statBoxValue, {color: '#EF4444'}]}>
                {analysis?.funds?.filter(f => f.verdict === 'Rebalance').length} Funds
              </Text>
              <Text style={styles.statBoxSub}>Action needed</Text>
            </View>
          </View>

          {/* ========== FUND LIST (INLINE AUTOMATIC FOMO) ========== */}
          <Text style={styles.sectionTitle}>Your Holdings</Text>
          {analysis?.funds?.map((fund, i) => {
            if (fund.error) {
              return (
                <View key={i} style={[styles.fundItem, { borderColor: 'rgba(239, 68, 68, 0.5)' }]}>
                  <Text style={{color: '#EF4444', fontWeight: 'bold', fontSize: 15, marginBottom: 4}}>
                    ⚠️ {fund.fund_name}
                  </Text>
                  <Text style={{color: '#9CA3AF', fontSize: 13}}>{fund.message || "Failed to process fund."}</Text>
                </View>
              );
            }

            return (
              <View key={i} style={styles.fundItem}>
                <TouchableOpacity onPress={() => setSelectedFund && setSelectedFund(fund.amfi_code)}>
                  <View style={styles.fundHeader}>
                    <Text style={styles.fundNameText} numberOfLines={1}>{fund.category_emoji} {fund.fund_name}</Text>
                    <Text style={fund.status === 'W' ? styles.wBadge : styles.lBadge}>{fund.status}</Text>
                  </View>
                  
                  <Text style={styles.fundReturnText}>
                    Returns: ₹{fund.returns?.absolute?.toLocaleString(undefined, {maximumFractionDigits: 0})} ({fund.returns?.percentage}%)
                  </Text>
                  
                  <View style={styles.actionRow}>
                    <View style={fund.verdict === 'Keep' ? styles.keepTag : styles.rebalanceTag}>
                      <Text style={styles.tagText}>{fund.verdict?.toUpperCase()}</Text>
                    </View>

                    {fund.verdict === 'Rebalance' && fund.recommendation && (
                      <TouchableOpacity 
                        style={styles.compareBtn}
                        onPress={() => navigation?.navigate('Compare', { fund1: fund.amfi_code, fund2: fund.recommendation.code })}
                      >
                        <Text style={styles.compareBtnText}>Compare Alt ↗</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>

                {/* 🟢 INLINE AUTOMATIC FOMO TEXT */}
                {fund.verdict === 'Rebalance' && fund.recommendation && !fomoLoading && fomoData[fund.amfi_code] && (
                  <View style={styles.inlineFomoContainer}>
                    <Text style={styles.fomoSubtitleSmall}>
                      Alternative: <Text style={{color: '#FFF'}}>{fund.recommendation.name}</Text>
                    </Text>
                    <Text style={styles.fomoVerdictSmall}>
                      Missed Gains: <Text style={{color: '#10B981'}}>
                        +₹{(fomoData[fund.amfi_code]?.comparison?.value_difference || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}
                      </Text> 💸
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

// --- ISOLATED COMPONENT STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D', padding: 20 },
  headerArea: { marginTop: 40, marginBottom: 20 },
  title: { fontSize: 28, color: '#FFFFFF', fontWeight: '900' },
  subtitle: { color: '#9CA3AF', fontSize: 14, marginTop: 8 },
  sectionTitle: { fontSize: 18, color: '#FFF', fontWeight: 'bold', marginVertical: 15 },
  
  csvInput: { backgroundColor: '#1F1F1F', color: '#FFF', borderRadius: 12, padding: 16, height: 180, textAlignVertical: 'top', borderWidth: 1, borderColor: '#333', fontSize: 14 },
  searchInput: { backgroundColor: '#1F1F1F', color: '#FFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#333', fontSize: 16, marginBottom: 15 },
  demoButton: { backgroundColor: 'rgba(168, 85, 247, 0.2)', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 15, borderWidth: 1, borderColor: 'rgba(168, 85, 247, 0.5)' },
  demoButtonText: { color: '#A855F7', fontWeight: 'bold', fontSize: 16 },
  primaryButton: { backgroundColor: '#7C3AED', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 15 },
  primaryButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  searchResult: { padding: 16, backgroundColor: '#1A1A1A', borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  resultName: { color: '#F9FAFB', fontWeight: 'bold', fontSize: 15 },
  resultMeta: { color: '#9CA3AF', fontSize: 12, marginTop: 4 },

  auraCard: { backgroundColor: '#111', padding: 25, borderRadius: 24, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#A855F7' },
  auraHeader: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 15, paddingHorizontal: 5 },
  auraSmallLabel: { color: '#9CA3AF', fontSize: 10, letterSpacing: 1, fontWeight: 'bold' },
  auraSmallValue: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  auraDivider: { height: 1, backgroundColor: '#333', width: '100%', marginBottom: 15 },
  auraLabel: { color: '#9CA3AF', fontSize: 12, letterSpacing: 2, fontWeight: 'bold' },
  auraValue: { fontSize: 56, fontWeight: '900', marginVertical: 10 },
  aiBubble: { backgroundColor: '#1F2937', padding: 15, borderRadius: 16, marginTop: 10, width: '100%' },
  aiText: { color: '#F9FAFB', fontStyle: 'italic', textAlign: 'center', lineHeight: 20 },

  fomoLoadingCard: { backgroundColor: '#1A1A1A', padding: 20, borderRadius: 16, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#333' },
  fomoLoadingText: { color: '#A855F7', marginTop: 10, fontWeight: 'bold' },
  optimizationContainer: { marginBottom: 20 },
  missedGainsCard: { backgroundColor: '#111', padding: 20, borderRadius: 16, borderWidth: 1, alignItems: 'center', marginBottom: 15 },
  missedGainsTitle: { color: '#9CA3AF', fontSize: 12, textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 5 },
  missedGainsValue: { color: '#FFF', fontSize: 32, fontWeight: '900' },
  missedGainsSub: { color: '#6B7280', fontSize: 11, marginTop: 5 },
  
  chartCard: { backgroundColor: '#1A1A1A', paddingVertical: 20, borderRadius: 16, borderWidth: 1, borderColor: '#333', marginBottom: 20 },
  chartLegend: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20, gap: 15 },
  chartScrollContent: { alignItems: 'flex-end', paddingBottom: 10, flexGrow: 1, justifyContent: 'space-evenly', paddingHorizontal: 15 },
  chartCol: { flex: 1, alignItems: 'center', marginHorizontal: 5, minWidth: 70 },
  
  verdictTag: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, marginBottom: 8 },
  verdictTagText: { fontSize: 9, fontWeight: 'bold' },
  
  // 🟢 NEW GRAPH BAR STYLES
  barGroupContainer: { flexDirection: 'row', alignItems: 'flex-end', height: 170, gap: 6, borderBottomWidth: 1, borderBottomColor: '#444', width: '100%', justifyContent: 'center' },
  barWrapper: { alignItems: 'center', justifyContent: 'flex-end' },
  barValueText: { color: '#9CA3AF', fontSize: 9, fontWeight: 'bold', marginBottom: 4 },
  bar: { width: 22, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  
  chartFundLabel: { color: '#9CA3AF', fontSize: 10, textAlign: 'center', marginTop: 8, height: 30 },

  dnaContainer: { backgroundColor: '#1A1A1A', padding: 20, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#333' },
  dnaBar: { height: 24, borderRadius: 12, flexDirection: 'row', overflow: 'hidden', marginBottom: 15 },
  dnaSegment: { height: '100%' },
  dnaLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 10, marginBottom: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 5 },
  legendText: { color: '#9CA3AF', fontSize: 12, fontWeight: 'bold' },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: '#1A1A1A', padding: 15, borderRadius: 16, borderWidth: 1, borderColor: '#333', alignItems: 'center' },
  statBoxTitle: { color: '#9CA3AF', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  statBoxValue: { color: '#FFF', fontSize: 20, fontWeight: '900', marginVertical: 5 },
  statBoxSub: { color: '#6B7280', fontSize: 10 },

  fundItem: { backgroundColor: '#1A1A1A', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#333' },
  fundHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  fundNameText: { color: '#F9FAFB', fontWeight: 'bold', fontSize: 15, flex: 1, paddingRight: 10 },
  wBadge: { color: '#10B981', fontWeight: '900', fontSize: 20 },
  lBadge: { color: '#EF4444', fontWeight: '900', fontSize: 20 },
  fundReturnText: { color: '#9CA3AF', fontSize: 13 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  keepTag: { backgroundColor: 'rgba(16, 185, 129, 0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  rebalanceTag: { backgroundColor: 'rgba(239, 68, 68, 0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  tagText: { fontSize: 11, fontWeight: 'bold', color: '#FFF' },
  compareBtn: { backgroundColor: 'rgba(59, 130, 246, 0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  compareBtnText: { color: '#60A5FA', fontWeight: 'bold', fontSize: 12 },

  inlineFomoContainer: { marginTop: 15, borderTopWidth: 1, borderTopColor: '#333', paddingTop: 12 },
  fomoSubtitleSmall: { color: '#9CA3AF', fontSize: 12, marginBottom: 4 },
  fomoVerdictSmall: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
});

export default PortfolioScreen;