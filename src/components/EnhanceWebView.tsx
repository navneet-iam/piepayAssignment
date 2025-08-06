// src/components/EnhancedWebView.tsx
// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import { Button } from 'react-native';
import WebView from 'react-native-webview';
import WowDealBottomSheet from './WowDealBottomSheet';

interface EnhancedWebViewProps {
  uri: string;
  onClose: () => void;
  apiBaseUrl?: string;
}

const EnhancedWebView: React.FC<EnhancedWebViewProps> = ({
  uri,
  onClose,
  apiBaseUrl = 'http://localhost:3001',
}) => {
  const [showWowDeal, setShowWowDeal] = useState(false);
  const [productTitle, setProductTitle] = useState('');
  const [currentUrl, setCurrentUrl] = useState(uri);
  const webViewRef = useRef<WebView>(null);

  // Check if URL is a Flipkart product page
  function isFlipkartProductPage(url: string): boolean {
  return /^https:\/\/www\.flipkart\.com\/[^/]+\/p\//.test(url);
}

  console.log('EnhancedWebView initialized with URL:', uri);

  // JavaScript code to inject into Flipkart pages
  const injectedJavaScript = `
    (function () {
  try {
    console.log('[INJECTED] Script started on:', window.location.href);

    function extractWowDealData() {
      let productTitle = '';
      const titleSelectors = [
        'h1 span',
        '.B_NuCI',
        '[data-testid="product-title"]',
        '.yhB1nd'
      ];

      for (const selector of titleSelectors) {
        const el = document.querySelector(selector);
        if (el && el.textContent.trim()) {
          productTitle = el.textContent.trim();
          break;
        }
      }

      let wowDealPrice = null;

      // Try to parse embedded JSON
      try {
        const scripts = Array.from(document.querySelectorAll('script'));
        for (let script of scripts) {
          const content = script.textContent;
          if (content.includes('"nepPrice":')) {
            const match = content.match(/"nepPrice"\s*:\s*(\d+)/);
            if (match) {
              wowDealPrice = match[1];
              console.log('[INJECTED] Extracted wowDealPrice:', wowDealPrice);
              break;
            }
          }
        }

        // Fallback: Try from window.__INITIAL_STATE__
        if (!wowDealPrice && window.__INITIAL_STATE__) {
          const stateStr = JSON.stringify(window.__INITIAL_STATE__);
          const match = stateStr.match(/"nepPrice"\s*:\s*(\d+)/);
          if (match) {
            wowDealPrice = match[1];
            console.log('[INJECTED] Fallback wowDealPrice from state:', wowDealPrice);
          }
        }
      } catch (err) {
        console.log('[INJECTED] Error parsing price:', err);
      }

      const payload = {
        type: 'PRODUCT_DATA',
        productTitle,
        wowDealPrice,
        url: window.location.href,
        timestamp: Date.now()
      };

      window.ReactNativeWebView?.postMessage(JSON.stringify(payload));
    }

    setTimeout(extractWowDealData, 1500); // Wait for JS-rendered content
  } catch (err) {
    console.log('[INJECTED ERROR]', err);
  }
})();


  `;

  // Handle messages from WebView
  const onMessage = useCallback(
    async event => {
      try {
        console.log('[WEBVIEW] Raw message received:', event.nativeEvent.data);
        const data = JSON.parse(event.nativeEvent.data);
        console.log('[WEBVIEW] Parsed message data:', data);

        if (data.type === 'PRODUCT_DATA') {
          console.log('[WEBVIEW] Product data received:', data);

          if (data.productTitle) {
            // Always show bottom sheet if we have product title, regardless of wow price
            setProductTitle(data.productTitle);
            setShowWowDeal(true);
            console.log('[WEBVIEW] Bottom sheet should now be visible');

            // Send data to API
            try {
              console.log('[API] Sending data to:', `${apiBaseUrl}/api/prices`);
              const response = await fetch(`${apiBaseUrl}/api/prices`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  productTitle: data.productTitle,
                  wowDealPrice: data.wowDealPrice,
                  flipkartUrl: data.url,
                }),
              });

              if (response.ok) {
                const result = await response.json();
                console.log('[API] Data sent successfully:', result);
              } else {
                console.error('[API] Failed to send data:', response.status);
              }
            } catch (error) {
              console.error('[API] Error sending data:', error);
            }
          } else {
            console.log(
              '[WEBVIEW] No product title in data, not showing bottom sheet',
            );
          }
        }
      } catch (error) {
        console.error('[WEBVIEW] Error parsing message:', error);
      }
    },
    [apiBaseUrl],
  );

  // Handle navigation state changes
  const onNavigationStateChange = useCallback(
    navState => {
      console.log('[WEBVIEW] Navigation to:', navState.url);
      setCurrentUrl(navState.url);

      const isProductPage = isFlipkartProductPage(navState.url);
      console.log('[WEBVIEW] Is product page:', isProductPage);

      // Only hide bottom sheet if navigating away from ANY product page
      if (!isProductPage && showWowDeal) {
        console.log('[WEBVIEW] Not a product page, hiding wow deal');
        setShowWowDeal(false);
        setProductTitle('');
      }

      // If it's a new product page, reset the state but don't hide
      // if (isProductPage && navState.url !== currentUrl) {
      //   console.log('[WEBVIEW] New product page detected, resetting state');
      //   setShowWowDeal(false);
      //   setProductTitle('');
      // }
    },
    [showWowDeal, currentUrl],
  );

  // Handle back button
  useEffect(() => {
    const backAction = () => {
      if (showWowDeal) {
        // setShowWowDeal(false);
        return true;
      }
      onClose();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [showWowDeal, onClose]);

  // console.log('[DEBUG] Auto-injecting JS into product page:', url);
  // webViewRef.current?.injectJavaScript(injectedJavaScript);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri }}
        startInLoadingState
        onMessage={onMessage}
        onNavigationStateChange={onNavigationStateChange}
        injectedJavaScript={
          isFlipkartProductPage(uri) ? injectedJavaScript : undefined
        }
        onLoadEnd={event => {
          console.log('[WEBVIEW] Load ended for:', event.nativeEvent.url);
          const isProductPage = isFlipkartProductPage(event.nativeEvent.url);
          console.log('[WEBVIEW] Is product page after load:', isProductPage);

          // Re-inject script after page loads if it's a product page
          if (isProductPage) {
            console.log('[WEBVIEW] Injecting script for product page');
            setTimeout(() => {
              console.log('[WEBVIEW] Re-injecting script after delay');
              webViewRef.current?.injectJavaScript(injectedJavaScript);
            }, 3000); // Increased delay

            // Try multiple injections to ensure it works
            setTimeout(() => {
              console.log('[WEBVIEW] Second injection attempt');
              webViewRef.current?.injectJavaScript(injectedJavaScript);
            }, 5000);

            setTimeout(() => {
              console.log('[WEBVIEW] Third injection attempt');
              webViewRef.current?.injectJavaScript(injectedJavaScript);
            }, 8000);
          }
        }}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="compatibility"
        userAgent="Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36"
      />

      <Button
        title="Force Inject"
        onPress={() => {
          webViewRef.current?.injectJavaScript(injectedJavaScript);
          console.log('[DEBUG] Force injected JS manually');
        }}
      />

      <WowDealBottomSheet
        visible={showWowDeal}
        onClose={() => {
          console.log('[BOTTOM_SHEET] Closing bottom sheet');
          setShowWowDeal(false);
        }}
        productTitle={productTitle}
        apiBaseUrl={apiBaseUrl}
      />
    </View>
  );
};

export default EnhancedWebView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
