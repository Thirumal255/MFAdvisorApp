import { Search } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Navigation } from '../components/Navigation';
import { getRecommendations } from '../services/comparisonService';
import { searchFunds } from '../services/fundService';
import { styles as appStyles } from '../styles/appStyles';

export default function AnalyzerScreen({ 
  setScreen, 
  myFundCode, 
  setMyFundCode, 
  setCompareMode,
  setCompareFund1,
  setCompareFund2,
  setSelectedFund,
  setActiveTool,
  setSelectedTopic
}) {
  const [fundSearchQuery, setFundSearchQuery] = useState('');
  const [fundSearchResults, setFundSearchResults] = useState([]);
  const [myFundData, setMyFundData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🟢 NEW STATES FOR CALCULATE RETURNS
  const [activeCalcId, setActiveCalcId] = useState(null);
  const [calcAmount, setCalcAmount] = useState('10000');
  const [calcDate, setCalcDate] = useState('01-01-2023');
  const [calcType, setCalcType] = useState('LUMPSUM'); // 🟢 'SIP' or 'LUMPSUM'
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcResult, setCalcResult] = useState(null);

  const handleSearch = async (query) => {
    setFundSearchQuery(query);
    if (query.length < 2) {
      setFundSearchResults([]);
      return;
    }

    try {
      const data = await searchFunds(query);
      setFundSearchResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleSelectFund = async (fund) => {
    setLoading(true);
    try {
      const data = await getRecommendations(fund.code);
      setMyFundData(data.user_fund);
      setRecommendations(data.recommendations || []);
      setMyFundCode(fund.code);
      setFundSearchQuery('');
      setFundSearchResults([]);
      
      // Reset calculator states when searching a new fund
      setActiveCalcId(null); 
      setCalcResult(null);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      alert('Could not fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  // 🟢 API CALL TO CALCULATE RETURNS WITH SIP/LUMPSUM
  const handleCalculate = async (recCode) => {
    if (!calcAmount || !calcDate) {
      alert("Please enter both amount and date.");
      return;
    }

    setCalcLoading(true);
    try {
      const payload = {
        fund1_code: myFundData.code,
        fund2_code: recCode,
        investment_date: calcDate,
        investment_amount: parseFloat(calcAmount),
        investment_type: calcType // 🟢 Passed successfully!
      };

      const response = await fetch('http://192.168.1.8:8000/api/compare-investment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (!response.ok) {
         alert(data.detail || "Error calculating returns.");
         return;
      }
      
      setCalcResult(data);
    } catch (error) {
      console.error('Calculation error:', error);
      alert('Could not calculate returns.');
    } finally {
      setCalcLoading(false);
    }
  };

  return (
    <View style={appStyles.container}>
      <View style={[appStyles.headerBlue, { backgroundColor: '#059669' }]}>
        <Text style={appStyles.pageTitle}>My Fund Analyzer 🎯</Text>
      </View>

      <ScrollView style={appStyles.scrollView} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={appStyles.section}>
          <Text style={appStyles.sectionTitle}>Search Your Fund</Text>
          <View style={appStyles.searchBox}>
            <Search size={20} color="#A78BFA" />
            <TextInput
              style={appStyles.searchInput}
              placeholder="Enter your fund name..."
              placeholderTextColor="#6B7280"
              value={fundSearchQuery}
              onChangeText={handleSearch}
            />
          </View>

          {fundSearchResults.length > 0 && (
            <View style={appStyles.resultsContainer}>
              {fundSearchResults.map((fund, index) => (
                <TouchableOpacity
                  key={index}
                  style={appStyles.fundCard}
                  onPress={() => handleSelectFund(fund)}
                >
                  <Text style={appStyles.fundName}>{fund.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {loading && (
          <View style={appStyles.loadingContainer}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={appStyles.loadingText}>Finding better alternatives...</Text>
          </View>
        )}

        {myFundData && recommendations.length > 0 && (
          <View style={appStyles.section}>
            
            {/* Show User's Current Fund First for Context */}
            <View style={[appStyles.fundCard, { borderColor: '#059669', borderWidth: 1, marginBottom: 20 }]}>
               <Text style={{color: '#059669', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase', marginBottom: 4}}>Your Fund</Text>
               <Text style={appStyles.fundName}>{myFundData.name}</Text>
               <Text style={{color: '#9CA3AF', fontSize: 13, marginTop: 4}}>Score: {myFundData.score?.total ? Math.round(myFundData.score.total) : 'N/A'}</Text>
            </View>

            <Text style={appStyles.sectionTitle}>Better Alternatives</Text>
            
            {recommendations.map((rec, index) => (
              <View key={index} style={appStyles.fundCard}>
                <Text style={appStyles.fundName}>{rec.name || rec.fund_name}</Text>
                <Text style={appStyles.verdictPro}>
                  Score: {rec.score?.total ? Math.round(rec.score.total) : Math.round(rec.composite_score)} (Improvement: +{Math.round(rec.score_difference)})
                </Text>

                {/* 🟢 3 ACTION BUTTONS */}
                <View style={localStyles.actionRow}>
                  <TouchableOpacity 
                    style={localStyles.actionBtn}
                    onPress={() => {
                      if (setSelectedFund) {
                        setSelectedFund(rec.code);
                        setScreen('check'); 
                      }
                    }}
                  >
                    <Text style={localStyles.actionBtnText}>Details</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={localStyles.actionBtn}
                    onPress={() => {
                      if (setCompareFund1 && setCompareFund2 && setActiveTool) {
                        setCompareFund1({code: myFundData.code});
                        setCompareFund2({code: rec.code});
                        setScreen('tools');
                        setActiveTool('compare');
                      }
                    }}
                  >
                    <Text style={localStyles.actionBtnText}>Compare</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[localStyles.actionBtn, activeCalcId === rec.code && { backgroundColor: '#059669' }]}
                    onPress={() => {
                      setActiveCalcId(activeCalcId === rec.code ? null : rec.code);
                      setCalcResult(null); // Reset when toggling
                    }}
                  >
                    <Text style={[localStyles.actionBtnText, activeCalcId === rec.code && { color: '#FFF' }]}>
                      Returns
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* 🟢 INLINE CALCULATOR MODULE */}
                {activeCalcId === rec.code && (
                  <View style={localStyles.calcBox}>
                    <Text style={localStyles.calcTitle}>Calculate Missed Gains 💸</Text>
                    
                    {/* INVESTMENT TYPE TOGGLE (SIP vs LUMPSUM) */}
                    <View style={localStyles.toggleRow}>
                      <TouchableOpacity 
                        style={[localStyles.toggleBtn, calcType === 'LUMPSUM' && localStyles.toggleBtnActive]}
                        onPress={() => setCalcType('LUMPSUM')}
                      >
                        <Text style={[localStyles.toggleText, calcType === 'LUMPSUM' && localStyles.toggleTextActive]}>LUMPSUM</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[localStyles.toggleBtn, calcType === 'SIP' && localStyles.toggleBtnActive]}
                        onPress={() => setCalcType('SIP')}
                      >
                        <Text style={[localStyles.toggleText, calcType === 'SIP' && localStyles.toggleTextActive]}>SIP</Text>
                      </TouchableOpacity>
                    </View>

                    {/* INPUTS (Amount & Date) */}
                    <View style={localStyles.inputRow}>
                      <TextInput 
                        style={localStyles.calcInput}
                        placeholder="Amount (₹)"
                        placeholderTextColor="#666"
                        keyboardType="numeric"
                        value={calcAmount}
                        onChangeText={setCalcAmount}
                      />
                      <TextInput 
                        style={localStyles.calcInput}
                        placeholder="DD-MM-YYYY"
                        placeholderTextColor="#666"
                        value={calcDate}
                        onChangeText={setCalcDate}
                      />
                    </View>

                    <TouchableOpacity 
                      style={localStyles.submitBtn}
                      onPress={() => handleCalculate(rec.code)}
                      disabled={calcLoading}
                    >
                      {calcLoading ? (
                        <ActivityIndicator color="#FFF" size="small" />
                      ) : (
                        <Text style={localStyles.submitBtnText}>Calculate Now</Text>
                      )}
                    </TouchableOpacity>

                    {/* RESULTS DISPLAY */}
                    {calcResult && (
                      <View style={localStyles.resultBox}>
                        <View style={localStyles.resultRow}>
                          <Text style={localStyles.resultLabel}>Your Fund:</Text>
                          <Text style={localStyles.resultBad}>
                            ₹{calcResult.fund1?.current?.value?.toLocaleString(undefined, {maximumFractionDigits: 0})}
                          </Text>
                        </View>
                        <View style={localStyles.resultRow}>
                          <Text style={localStyles.resultLabel}>Recommended ({calcType}):</Text>
                          <Text style={localStyles.resultGood}>
                            ₹{calcResult.fund2?.current?.value?.toLocaleString(undefined, {maximumFractionDigits: 0})}
                          </Text>
                        </View>
                        
                        <View style={localStyles.resultDivider} />
                        
                        <View style={localStyles.resultRow}>
                          <Text style={localStyles.diffLabel}>Missed Wealth:</Text>
                          <Text style={localStyles.diffValue}>
                            +₹{calcResult.comparison?.value_difference?.toLocaleString(undefined, {maximumFractionDigits: 0})}
                          </Text>
                        </View>
                        
                        {calcResult.adjustment?.adjusted && (
                          <Text style={localStyles.disclaimerText}>
                            * {calcResult.adjustment.disclaimer}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                )}

              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Navigation
        screen="analyzer"
        setScreen={setScreen}
        setSelectedFund={setSelectedFund}
        setActiveTool={setActiveTool}
        setSelectedTopic={setSelectedTopic}
      />
    </View>
  );
}

// 🟢 STYLES ADDED FOR THE INLINE CALCULATOR
const localStyles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.3)',
  },
  actionBtnText: {
    color: '#059669',
    fontWeight: 'bold',
    fontSize: 12,
  },
  
  // Calculator Box Styles
  calcBox: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  calcTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: 12,
    fontSize: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#059669', // Uses the Check My Fund theme green
  },
  toggleText: {
    color: '#9CA3AF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  toggleTextActive: {
    color: '#FFF',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  calcInput: {
    flex: 1,
    backgroundColor: '#222',
    color: '#FFF',
    padding: 10,
    borderRadius: 8,
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#333',
  },
  submitBtn: {
    backgroundColor: '#059669',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  
  // Results Styles
  resultBox: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 15,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  resultLabel: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  resultBad: {
    color: '#EF4444',
    fontWeight: 'bold',
    fontSize: 14,
  },
  resultGood: {
    color: '#10B981',
    fontWeight: 'bold',
    fontSize: 14,
  },
  resultDivider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 8,
  },
  diffLabel: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  diffValue: {
    color: '#10B981',
    fontWeight: '900',
    fontSize: 16,
  },
  disclaimerText: {
    color: '#6B7280',
    fontSize: 10,
    marginTop: 8,
    fontStyle: 'italic',
    textAlign: 'center',
  }
});