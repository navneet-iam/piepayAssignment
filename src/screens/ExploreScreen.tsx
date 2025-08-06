// @ts-nocheck
import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
} from 'react-native';
import Background from '../components/Background';
import SearchBar from '../components/SearchBar';
import EcomTile from '../components/EcomTile';
import LatestPurchasesTile from '../components/LatestPurchasesTile';
import EnhancedWebView from '../components/EnhanceWebView';
// import EnhancedWebView from '../components/EnhancedWebView';

// ---------- mock data ---------- //
const MOCK_MERCHANTS = [
  {
    id: 'flipkart',
    name: 'Flipkart',
    logoUrl: 'https://logos-world.net/wp-content/uploads/2020/11/Flipkart-Logo.png',
    websiteUrl: 'https://www.flipkart.com',
    categories: [
      {
        title: 'Mobiles',
        imageUrl: 'https://img.icons8.com/fluency/96/000000/iphone-x.png',
        productPageUrl: 'https://www.flipkart.com/mobile-phones-store',
      },
      {
        title: 'Fashion',
        imageUrl: 'https://img.icons8.com/fluency/96/000000/clothes.png',
        productPageUrl: 'https://www.flipkart.com/clothing-and-accessories/pr?sid=clo',
      },
      {
        title: 'Electronics',
        imageUrl: 'https://img.icons8.com/fluency/96/000000/laptop.png',
        productPageUrl: 'https://www.flipkart.com/electronics/pr?sid=6bo',
      },
      {
        title: 'Home',
        imageUrl: 'https://img.icons8.com/fluency/96/000000/sofa.png',
        productPageUrl: 'https://www.flipkart.com/furniture/pr?sid=wwe',
      },
      {
        title: 'Beauty',
        imageUrl: 'https://img.icons8.com/fluency/96/000000/lipstick.png',
        productPageUrl: 'https://www.flipkart.com/beauty-and-grooming/pr?sid=p13',
      },
      {
        title: 'Toys',
        imageUrl: 'https://img.icons8.com/fluency/96/000000/teddy-bear.png',
        productPageUrl: 'https://www.flipkart.com/toys-and-baby-care/pr?sid=abc',
      },
      {
        title: 'Books',
        imageUrl: 'https://img.icons8.com/fluency/96/000000/book.png',
        productPageUrl: 'https://www.flipkart.com/books/pr?sid=bks',
      },
    ],
  },
];

const MOCK_PRODUCTS = [
  {
    id: 1,
    title: 'iPhone 14',
    imageUrl: 'https://m.media-amazon.com/images/I/61BGE6iu4AL._AC_UY218_.jpg',
    price: 79999,
    productPageUrl:
      'https://www.flipkart.com/apple-iphone-14-starlight-128-gb/p/itm3485a56f6e676?pid=MOBGHWFHABH3G73H',
  },
  {
    id: 2,
    title: 'Nike Sneakers',
    imageUrl:
      'https://static.nike.com/a/images/t_PDP_936_v1/f_auto,q_auto:eco/44f222ab-96b6-43b9-82e7-9a1bd888611d/NIKE+COURT+VISION+LO.png',
    price: 4599,
    productPageUrl:
      'https://www.flipkart.com/nike-blazer-low-platform-sneakers-women/p/itm23e5c1871e94d?pid=SHOGTHZ23WDFHHYM',
  },
  {
    id: 3,
    title: 'Dell Laptop',
    imageUrl:
      'https://5.imimg.com/data5/ND/GA/MY-44419499/dell-mini-laptop.jpg',
    price: 55999,
    productPageUrl:
      'https://www.flipkart.com/dell-latitude-3440-2024-intel-core-i3-12th-gen-1215u-8-gb-512-gb-ssd-windows-11-pro-business-laptop/p/itm7f265faf0871e?pid=COMH5G3F8BGPNY9N',
  },
  {
    id: 4,
    title: 'Wrist Watch',
    imageUrl:
      'https://www.vaerwatches.com/cdn/shop/files/38-wristWrist-Shot-Lime.jpg?v=1712715073&width=600',
    price: 2499,
    productPageUrl:
      'https://www.flipkart.com/lorenz-mk-4087r-date-dial-analog-watch-blue-magnetic-lock-strap-men/p/itm50682d1116646?pid=WATGZDGQF8GYFA5Y',
  },
];

const ExploreScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [webUri, setWebUri] = useState(null);

  const onSubmitSearch = () => {
    setWebUri('https://www.flipkart.com/search?q=' + searchQuery);
    setSearchQuery('');
  };

  const handleCategoryPress = (url) => {
    console.log('🔗 Opening category URL:', url);
    setWebUri(url);
  };

  const handleMerchantPress = (url) => {
    console.log('🏪 Opening merchant URL:', url);
    setWebUri(url);
  };

  return (
    <Background>
      <ScrollView>
        {/* Header Section */}
        <HeaderSection />

        {/* Searchbar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search products, categories, ..."
          onSubmit={onSubmitSearch}
        />

        {/* Merchants Section */}
        {MOCK_MERCHANTS.map(merchant => (
          <EcomTile
            key={merchant.id}
            merchant={merchant}
            onPress={() => handleMerchantPress(merchant.websiteUrl)}
            onCategoryPress={handleCategoryPress}
          />
        ))}

        {/* Latest purchases */}
        <LatestPurchasesTile
          products={products}
          onRemove={id => {
            const index = products.findIndex(p => p.id === id);
            if (index !== -1) {
              const newList = [...products];
              newList.splice(index, 1);
              setProducts(newList);
            }
          }}
        />
      </ScrollView>

      {/* Enhanced WebView modal */}
      <Modal visible={!!webUri} animationType="slide">
        <View style={{ flex: 1 }}>
          <Pressable style={styles.closeBtn} onPress={() => setWebUri(null)}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
          {webUri && (
            <EnhancedWebView
              uri={webUri}
              onClose={() => setWebUri(null)}
              apiBaseUrl="http://localhost:3001"
            />
          )}
        </View>
      </Modal>
    </Background>
  );
};

export default ExploreScreen;

// ---------------- internal components ---------------- //
const HeaderSection = () => {
  return (
    <View style={headerStyles.container}>
      <Text style={headerStyles.welcomeText}>Welcome!</Text>
      <Text style={headerStyles.subText}>Find amazing deals on your favorite products</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

const headerStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'transparent',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  subText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '400',
  },
});