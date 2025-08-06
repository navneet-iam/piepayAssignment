// // @ts-nocheck
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   Dimensions,
//   Pressable,
//   Modal,
// } from 'react-native';
// import WebView from 'react-native-webview';

// const windowWidth = Dimensions.get('window').width;
// const itemsPerRow = 4;
// const circleSize = windowWidth * 0.2; // 20% of width

// const EcomTile = ({ merchant, onPress }) => {
//   const { name, categories, logoUrl } = merchant;

//   if (categories && categories.length && !categories._mutated) {
//     categories.push({
//       title: 'More',
//       imageUrl: 'https://img.icons8.com/fluency/96/000000/more.png',
//     });
//   }
//   // Limit to two rows by default, allow expand/collapse
//   const [expanded, setExpanded] = useState(false);

//   const visibleCategories = expanded ? categories : categories.slice(0, 7);

//   const rows = [];
//   for (let i = 0; i < visibleCategories.length; i += itemsPerRow) {
//     rows.push(visibleCategories.slice(i, i + itemsPerRow));
//   }

//   const handleToggle = () => setExpanded(!expanded);
//   const [webUri, setWebUri] = useState(null);

//   return (
//     <View style={styles.container}>
//       <Pressable onPress={onPress}>
//         <View style={styles.headerRow}>
//           <Image source={{ uri: logoUrl }} style={styles.logo} />
//           <Text style={styles.headerText}>Buy on {name}</Text>
//         </View>
//       </Pressable>

//       {/* category grid */}
//       {rows.map((row, rowIdx) => (
//         <View
//           key={`row-${rowIdx}`}
//           style={[
//             styles.row,
//             { justifyContent: row.length < 3 ? 'flex-start' : 'space-between' },
//           ]}
//         >
//           {row.map((cat, idx) => (
//             <Pressable
//               key={`cat-${cat.title}-${idx}`}
//               style={styles.circle}
//               onPress={() => {
//                 setWebUri(cat.productPageUrl);
//               }}
//             >
//               <Image
//                 source={{ uri: cat.imageUrl }}
//                 style={styles.categoryImage}
//               />
//               <Text style={styles.categoryTitle}>{cat.title}</Text>
//             </Pressable>
//           ))}
//         </View>
//       ))}

//       {/* view more / less toggle */}
//       {categories.length > 7 && (
//         <Pressable onPress={handleToggle} style={styles.viewMoreBtn}>
//           <Text style={styles.viewMoreText}>
//             {expanded ? 'View less' : 'View more'}
//           </Text>
//         </Pressable>
//       )}

//       {/* WebView modal */}
//       <Modal visible={!!webUri} animationType="slide">
//         <View style={{ flex: 1 }}>
//           <Pressable style={styles.closeBtn} onPress={() => setWebUri(null)}>
//             <Text style={styles.closeText}>✕</Text>
//           </Pressable>
//           {webUri && <WebView source={{ uri: webUri }} startInLoadingState />}
//         </View>
//       </Modal>
//     </View>
//   );
// };

// export default EcomTile;

// const styles = StyleSheet.create({
//   container: {
//     marginTop: 16,
//   },
//   headerRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   logo: {
//     height: 20,
//     width: 20,
//   },
//   headerText: {
//     marginLeft: 10,
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#212121',
//   },
//   row: {
//     flexDirection: 'row',
//     marginBottom: 12,
//     paddingHorizontal: 4,
//   },
//   circle: {
//     width: circleSize,
//     alignItems: 'center',
//   },
//   categoryImage: {
//     width: circleSize * 0.8,
//     height: circleSize * 0.8,
//     borderRadius: circleSize * 0.4,
//     backgroundColor: '#FFF',
//   },
//   categoryTitle: {
//     marginTop: 6,
//     fontSize: 12,
//     color: '#616161',
//     textAlign: 'center',
//     textTransform: 'capitalize',
//   },
//   viewMoreBtn: {
//     alignItems: 'center',
//     paddingVertical: 8,
//   },
//   viewMoreText: {
//     color: '#6C33DB',
//     fontSize: 14,
//   },
//   closeBtn: {
//     position: 'absolute',
//     zIndex: 2,
//     top: 40,
//     right: 20,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     borderRadius: 16,
//     width: 32,
//     height: 32,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   closeText: {
//     color: '#FFF',
//     fontSize: 18,
//   },
// });





// @ts-nocheck
// @ts-nocheck
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';

const windowWidth = Dimensions.get('window').width;
const itemsPerRow = 4;
const circleSize = windowWidth * 0.18; // Slightly smaller for better fit

const EcomTile = ({ merchant, onPress, onCategoryPress }) => {
  const { name, categories, logoUrl } = merchant;

  console.log('🏪 EcomTile render for merchant:', name);

  // Create a copy of categories to avoid mutating the original
  const categoriesWithMore = [...categories];
  
  // Add "More" category if not already present
  if (!categoriesWithMore.find(cat => cat.title === 'More')) {
    categoriesWithMore.push({
      title: 'More',
      imageUrl: 'https://img.icons8.com/fluency/96/000000/more.png',
      productPageUrl: 'https://www.flipkart.com',
    });
  }

  // Limit to two rows by default, allow expand/collapse
  const [expanded, setExpanded] = useState(false);

  const visibleCategories = expanded ? categoriesWithMore : categoriesWithMore.slice(0, 7);

  const rows = [];
  for (let i = 0; i < visibleCategories.length; i += itemsPerRow) {
    rows.push(visibleCategories.slice(i, i + itemsPerRow));
  }

  const handleToggle = () => {
    console.log('🔄 Toggling expanded state:', !expanded);
    setExpanded(!expanded);
  };

  const handleMerchantPress = () => {
    console.log('🏪 Merchant header pressed:', name);
    onPress();
  };

  const handleCategoryPress = (category) => {
    console.log('📂 Category pressed:', category.title, 'URL:', category.productPageUrl);
    onCategoryPress(category.productPageUrl);
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handleMerchantPress}>
        <View style={styles.headerRow}>
          <Image source={{ uri: logoUrl }} style={styles.logo} />
          <Text style={styles.headerText}>Buy on {name}</Text>
        </View>
      </Pressable>

      {/* Category grid */}
      {rows.map((row, rowIdx) => (
        <View
          key={`row-${rowIdx}`}
          style={[
            styles.row,
            { justifyContent: row.length < itemsPerRow ? 'flex-start' : 'space-between' },
          ]}
        >
          {row.map((cat, idx) => (
            <Pressable
              key={`cat-${cat.title}-${idx}`}
              style={styles.circle}
              onPress={() => handleCategoryPress(cat)}
            >
              <View style={styles.categoryImageContainer}>
                <Image
                  source={{ uri: cat.imageUrl }}
                  style={styles.categoryImage}
                  onError={(error) => console.log('🖼️ Category image error:', cat.title, error)}
                  onLoad={() => console.log('🖼️ Category image loaded:', cat.title)}
                />
              </View>
              <Text style={styles.categoryTitle} numberOfLines={1}>
                {cat.title}
              </Text>
            </Pressable>
          ))}
        </View>
      ))}

      {/* View more / less toggle */}
      {categoriesWithMore.length > 7 && (
        <Pressable onPress={handleToggle} style={styles.viewMoreBtn}>
          <Text style={styles.viewMoreText}>
            {expanded ? 'View less ▲' : 'View more ▼'}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginRight: 12,
    resizeMode: 'contain',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  circle: {
    width: circleSize,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  categoryImageContainer: {
    width: circleSize - 8,
    height: circleSize - 8,
    borderRadius: (circleSize - 8) / 2,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E9ECEF',
  },
  categoryImage: {
    width: (circleSize - 8) * 0.6,
    height: (circleSize - 8) * 0.6,
    resizeMode: 'contain',
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
    textAlign: 'center',
    lineHeight: 14,
  },
  viewMoreBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginTop: 8,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C757D',
  },
});

export default EcomTile;