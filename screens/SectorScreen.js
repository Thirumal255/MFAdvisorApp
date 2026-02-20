/**
 * ============================================================
 * SECTOR ALLOCATION SCREEN - Matches Backend Response
 * ============================================================
 * FILE: screens/SectorScreen.js
 * 
 * Backend Response Structure:
 * {
 *   fund_name, category, data_available,
 *   sectors: [{ name, weight, value, color }],
 *   total_sectors,
 *   top3_concentration,
 *   concentration_level,
 *   as_of_date
 * }
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { API_ENDPOINTS } from '../config/api';

// Fallback colors if backend doesn't provide them
const SECTOR_COLORS = [
  '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899',
  '#6366F1', '#78716C', '#EAB308', '#14B8A6', '#06B6D4',
  '#84CC16', '#64748B', '#A855F7', '#EF4444', '#22C55E',
];

// ============================================================
// SECTOR BAR COMPONENT
// ============================================================
const SectorBar = ({ sector, maxWeight, index }) => {
  const weight = sector.weight || sector.value || 0;
  const width = maxWeight > 0 ? Math.min(100, (weight / maxWeight) * 100) : 0;
  const color = sector.color || SECTOR_COLORS[index % SECTOR_COLORS.length];
  
  return (
    <View style={styles.sectorRow}>
      <View style={styles.sectorInfo}>
        <View style={[styles.sectorDot, { backgroundColor: color }]} />
        <Text style={styles.sectorName} numberOfLines={1}>{sector.name}</Text>
      </View>
      <View style={styles.sectorBarContainer}>
        <View style={[styles.sectorBar, { width: `${width}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.sectorWeight}>{weight.toFixed(1)}%</Text>
    </View>
  );
};

// ============================================================
// MAIN SCREEN
// ============================================================
export default function SectorScreen({ route, navigation, fundCode: propFundCode, setScreen, previousScreen }) {
  // Support both navigation params and direct props
  const fundCode = route?.params?.fundCode || propFundCode;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  const fetchSectorData = async () => {
    if (!fundCode) {
      setError('No fund code provided');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching sector allocation for:', fundCode);
      const response = await fetch(`${API_ENDPOINTS.SECTOR_ALLOCATION}/${fundCode}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📊 Sector allocation response:', result);
      setData(result);
    } catch (err) {
      console.error('Sector allocation error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchSectorData();
  }, [fundCode]);
  
  // Handle back navigation
  const handleBack = () => {
    if (navigation?.goBack) {
      navigation.goBack();
    } else if (setScreen && previousScreen) {
      setScreen(previousScreen);
    } else if (setScreen) {
      setScreen('check');
    }
  };
  
  // Loading State
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sector Allocation</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#A78BFA" />
          <Text style={styles.loadingText}>Loading sectors...</Text>
        </View>
      </View>
    );
  }
  
  // Error State
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sector Allocation</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorTitle}>Could not load sectors</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchSectorData}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  const sectors = data?.sectors || [];
  const maxWeight = sectors.length > 0 ? Math.max(...sectors.map(s => s.weight || s.value || 0)) : 0;
  const topSector = sectors[0];
  const concentration = data?.top3_concentration || (data?.concentration?.top_3_percentage) || 0;
  const concentrationLevel = data?.concentration_level || data?.concentration?.risk_level || 'Unknown';
  
  // No data available state
  if (data && data.data_available === false) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sector Allocation</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorEmoji}>📊</Text>
          <Text style={styles.errorTitle}>No Sector Data</Text>
          <Text style={styles.errorText}>{data.message || 'Sector allocation data is not available for this fund.'}</Text>
          {data.asset_allocation && (
            <View style={styles.assetAllocationCard}>
              <Text style={styles.assetAllocationTitle}>Asset Allocation Info:</Text>
              <Text style={styles.assetAllocationText}>{data.asset_allocation}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.backButtonLarge} onPress={handleBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  // Success State
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sector Allocation</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Fund Info */}
        <View style={styles.fundCard}>
          <Text style={styles.fundName} numberOfLines={2}>
            {data?.fund_name || 'Unknown Fund'}
          </Text>
          <Text style={styles.fundCategory}>
            {data?.total_sectors || sectors.length} sectors {data?.as_of_date ? `• As of ${data.as_of_date}` : ''}
          </Text>
        </View>
        
        {/* Concentration Card */}
        <View style={styles.concentrationCard}>
          <View style={styles.concentrationHeader}>
            <Text style={styles.concentrationLabel}>Top 3 Concentration</Text>
            <View style={[
              styles.concentrationBadge,
              { backgroundColor: concentration > 60 ? '#EF444430' : concentration > 40 ? '#F59E0B30' : '#10B98130' }
            ]}>
              <Text style={[
                styles.concentrationBadgeText,
                { color: concentration > 60 ? '#EF4444' : concentration > 40 ? '#F59E0B' : '#10B981' }
              ]}>
                {concentrationLevel}
              </Text>
            </View>
          </View>
          <Text style={styles.concentrationValue}>{concentration.toFixed(1)}%</Text>
          <Text style={styles.concentrationHint}>
            {concentration > 60 
              ? '⚠️ High concentration in few sectors' 
              : concentration > 40 
                ? '👍 Moderate sector concentration'
                : '✅ Well diversified across sectors'}
          </Text>
        </View>
        
        {/* Top Sector Highlight */}
        {topSector && (
          <View style={styles.topSectorCard}>
            <Text style={styles.topSectorLabel}>🏆 Top Sector</Text>
            <Text style={styles.topSectorName}>{topSector.name}</Text>
            <Text style={styles.topSectorWeight}>{(topSector.weight || topSector.value || 0).toFixed(1)}%</Text>
          </View>
        )}
        
        {/* Sector List */}
        <Text style={styles.sectionTitle}>📊 All Sectors</Text>
        
        <View style={styles.sectorsCard}>
          {sectors.length > 0 ? (
            sectors.map((sector, index) => (
              <SectorBar key={index} sector={sector} maxWeight={maxWeight} index={index} />
            ))
          ) : (
            <Text style={styles.noDataText}>No sector data available</Text>
          )}
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F14',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#1A1A24',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3C',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9CA3AF',
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#A78BFA',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  backButtonLarge: {
    backgroundColor: '#2A2A3C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  assetAllocationCard: {
    backgroundColor: '#1A1A24',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    maxWidth: '90%',
  },
  assetAllocationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A78BFA',
    marginBottom: 8,
  },
  assetAllocationText: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  fundCard: {
    backgroundColor: '#1A1A24',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A3C',
  },
  fundName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  fundCategory: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  concentrationCard: {
    backgroundColor: '#1A1A24',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A3C',
  },
  concentrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  concentrationLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  concentrationBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  concentrationBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  concentrationValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  concentrationHint: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  topSectorCard: {
    backgroundColor: '#1A1A24',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#A78BFA40',
    alignItems: 'center',
  },
  topSectorLabel: {
    fontSize: 12,
    color: '#A78BFA',
    marginBottom: 8,
  },
  topSectorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  topSectorWeight: {
    fontSize: 24,
    fontWeight: '700',
    color: '#A78BFA',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    marginTop: 8,
  },
  sectorsCard: {
    backgroundColor: '#1A1A24',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A3C',
  },
  sectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
  },
  sectorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  sectorName: {
    flex: 1,
    fontSize: 13,
    color: '#FFFFFF',
  },
  sectorBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#2A2A3C',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  sectorBar: {
    height: '100%',
    borderRadius: 4,
  },
  sectorWeight: {
    width: 50,
    fontSize: 13,
    fontWeight: '600',
    color: '#A78BFA',
    textAlign: 'right',
  },
  noDataText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    padding: 20,
  },
});
