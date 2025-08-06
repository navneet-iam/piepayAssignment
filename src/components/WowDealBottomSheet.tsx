// src/components/WowDealBottomSheet.tsx
// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Modal,
  Animated,
  Dimensions,
  PanResponder,
  ActivityIndicator,
} from 'react-native';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

interface WowDealData {
  flipkartPrice: number;
  wowDealPrice: string;
  productImgUri: string;
  savingsPercentage: number;
  productTitle: string;
}

interface WowDealBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  productTitle: string;
  apiBaseUrl?: string;
}

const WowDealBottomSheet: React.FC<WowDealBottomSheetProps> = ({
  visible,
  onClose,
  productTitle,
  apiBaseUrl = 'http://localhost:3001'
}) => {
  const [dealData, setDealData] = useState<WowDealData | null>(null);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [proceeding, setProceeding] = useState(false);
  
  const slideAnim = useState(new Animated.Value(screenHeight))[0];
  const backdropOpacity = useState(new Animated.Value(0))[0];

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (visible && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            console.log('[TIMER] Timer expired, closing bottom sheet');
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [visible, timeLeft, onClose]);

  // Handle proceed button click
  const handleProceed = () => {
    setProceeding(true);
    // Simulate processing time or make actual API call here
    // For demo purposes, we'll show loader for 3 seconds
    setTimeout(() => {
      setProceeding(false);
      // Add your actual proceed logic here
      console.log('Proceed action completed');
    }, 3000);
  };
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`;
  };

  // Fetch deal data from API
  const fetchDealData = useCallback(async () => {
    if (!productTitle) {
      console.log('[API] No product title provided');
      return;
    }
    
    console.log('[API] Fetching deal data for:', productTitle);
    setLoading(true);
    setError(false);
    
    try {
      // Clean product title for API (remove special chars, replace spaces with underscores)
      const cleanTitle = productTitle
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .toLowerCase();
      
      console.log('[API] Clean title for API:', cleanTitle);
      
      const apiUrl = `${apiBaseUrl}/api/prices/${cleanTitle}`;
      console.log('[API] Making request to:', apiUrl);
      
      const response = await fetch(apiUrl);
      console.log('[API] Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[API] Deal data received:', data);
        setDealData(data);
        setError(false);
      } else {
        console.error('[API] Failed to fetch deal data:', response.status);
        setError(true);
      }
    } catch (error) {
      console.error('[API] Error fetching deal data:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [productTitle, apiBaseUrl]);

  // Animation effects
  useEffect(() => {
    if (visible) {
      console.log('[ANIMATION] Showing bottom sheet');
      setTimeLeft(120); // Reset timer
      setDealData(null); // Reset data
      fetchDealData();
      
      // Slide up animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0.7,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      console.log('[ANIMATION] Hiding bottom sheet');
      // Slide down animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fetchDealData]);

  // Pan responder for swipe to dismiss
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dy) > 20;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        slideAnim.setValue(gestureState.dy * 0.8);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 100) {
        onClose();
      } else {
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  if (!visible) {
    return null;
  }

  console.log('[RENDER] WowDealBottomSheet rendering, visible:', visible);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            { opacity: backdropOpacity }
          ]}
        >
          <Pressable style={styles.backdropPress} onPress={onClose} />
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY: slideAnim }]
            }
          ]}
          {...panResponder.panHandlers}
        >
          {/* Handle bar */}
          <View style={styles.handleBar} />
          
          {/* Timer */}
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>

          {loading || proceeding ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingTitle}>Loading Details</Text>
              <View style={styles.loadingDots}>
                <View style={[styles.dot, styles.dot1]} />
                <View style={[styles.dot, styles.dot2]} />
                <View style={[styles.dot, styles.dot3]} />
              </View>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Unable to load deal information</Text>
              <Pressable style={styles.retryButton} onPress={fetchDealData}>
                <Text style={styles.retryText}>Try Again</Text>
              </Pressable>
            </View>
          ) : dealData ? (
            <View style={styles.contentContainer}>
              {/* Main Deal Card */}
              <View style={styles.dealCard}>
                {/* Product Image */}
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: dealData.productImgUri }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                </View>

                {/* Price Info */}
                <View style={styles.priceInfo}>
                  <View style={styles.flipkartPriceRow}>
                    <Text style={styles.flipkartLabel}>Flipkart Price</Text>
                    <Text style={styles.flipkartPrice}>₹{dealData.flipkartPrice.toLocaleString()}</Text>
                  </View>
                  
                  <View style={styles.piepayPriceRow}>
                    <Text style={styles.piepayLabel}>Piepay Price</Text>
                    <View style={styles.piepayPriceContainer}>
                      <Text style={styles.piepayPrice}>
                        ₹{dealData.wowDealPrice.includes('₹') 
                          ? dealData.wowDealPrice.replace('₹', '') 
                          : parseInt(dealData.wowDealPrice).toLocaleString()}
                      </Text>
                      {dealData.savingsPercentage > 0 && (
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountText}>{dealData.savingsPercentage}%</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {/* User Avatar */}
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>👤</Text>
                  </View>
                </View>
              </View>

              {/* Action Button */}
              <Pressable style={styles.proceedButton} onPress={handleProceed}>
                <Text style={styles.proceedText}>Proceed</Text>
                <View style={styles.arrowContainer}>
                  <Text style={styles.arrow}>›››</Text>
                </View>
              </Pressable>
            </View>
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingTitle}>Preparing your deal...</Text>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1a1a1a',
  },
  backdropPress: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: screenHeight * 0.6,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#666',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  timerContainer: {
    backgroundColor: '#FFD54F',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
    marginBottom: 24,
    minWidth: 80,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  loadingContainer: {
    backgroundColor: '#FFD54F',
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000',
    marginHorizontal: 4,
  },
  dot1: {
    opacity: 0.3,
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  dot2: {
    opacity: 0.6,
    animation: 'pulse 1.5s ease-in-out 0.5s infinite',
  },
  dot3: {
    opacity: 1,
    animation: 'pulse 1.5s ease-in-out 1s infinite',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#FFD54F',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FFD54F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#000',
    fontWeight: '600',
  },
  contentContainer: {
    gap: 40,
  },
  dealCard: {
    backgroundColor: '#FFD54F',
    borderRadius: 20,
    padding: 20,
    gap: 40,
    position: 'relative',
  },
  imageContainer: {
    position: 'absolute',
    top: -30,
    right: 20,
    width: 80,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  priceInfo: {
    paddingRight: 100,
    paddingTop: 10,
    gap:40,
  },
  flipkartPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  flipkartLabel: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  flipkartPrice: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  piepayPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  piepayLabel: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  piepayPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  piepayPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  discountBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  avatarContainer: {
    position: 'absolute',
    bottom: 60,
    left: 120,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarText: {
    fontSize: 18,
  },
  proceedButton: {
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  proceedText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  arrowContainer: {
    backgroundColor: '#FFD54F',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  arrow: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});

export default WowDealBottomSheet;