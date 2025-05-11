import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const CUISINES = [
  'All',
  'Middle Eastern',
  'Indian',
  'Malaysian',
  'Turkish',
  'Indonesian',
  'Lebanese',
  'Persian',
  'Moroccan',
  'Pakistani',
  'Egyptian',
  'Mediterranean',
];

const FEATURED_RESTAURANTS = [
  {
    id: '1',
    name: 'Al-Madina Grill',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
    rating: 4.8,
    cuisine: 'Middle Eastern',
    priceRange: '$$',
    distance: '1.2 km',
    certification: 'Fully Halal',
  },
  {
    id: '2',
    name: 'Istanbul Kitchen',
    image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143',
    rating: 4.6,
    cuisine: 'Turkish',
    priceRange: '$$$',
    distance: '2.5 km',
    certification: 'Fully Halal',
  },
  {
    id: '3',
    name: 'Taj Mahal Palace',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe',
    rating: 4.9,
    cuisine: 'Indian',
    priceRange: '$$$',
    distance: '3.1 km',
    certification: 'Fully Halal',
  },
  {
    id: '4',
    name: 'Rasa Malaysia',
    image: 'https://images.myguide-cdn.com/md/wellington/companies/rasa-malaysian-and-south-indian-restaurant/large/rasa-malaysian-and-south-indian-restaurant-704081.jpg',
    rating: 4.7,
    cuisine: 'Malaysian',
    priceRange: '$$',
    distance: '0.8 km',
    certification: 'Fully Halal',
  },
  {
    id: '5',
    name: 'Beirut Express',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQz7FTT5VnPNLfyLIcC2RA4_cXbSCNWyCKpIQ&s',
    rating: 4.5,
    cuisine: 'Lebanese',
    priceRange: '$$',
    distance: '1.7 km',
    certification: 'Fully Halal',
  },
  {
    id: '6',
    name: 'Tehran Nights',
    image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330',
    rating: 4.8,
    cuisine: 'Persian',
    priceRange: '$$$',
    distance: '2.3 km',
    certification: 'Fully Halal',
  },
  {
    id: '7',
    name: 'Casablanca Delights',
    image: 'https://d31tsesv4zrpsz.cloudfront.net/cache/img/le-casablanca-terrasse-jasmin-191253-1920-1280-crop.jpg?q=1695313769',
    rating: 4.7,
    cuisine: 'Moroccan',
    priceRange: '$$',
    distance: '1.9 km',
    certification: 'Fully Halal',
  },
];

interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  cuisine: string;
  priceRange: string;
  distance: string;
  certification: string;
}

export default function DiscoverScreen() {
  const [selectedCuisine, setSelectedCuisine] = useState('All');

  const renderRestaurantCard = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity style={styles.restaurantCard}>
      <Image
        source={{ uri: item.image }}
        style={styles.restaurantImage}
        resizeMode="cover"
      />
      <View style={styles.certificationBadge}>
        <Text style={styles.certificationText}>{item.certification}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.restaurantName}>{item.name}</Text>
        <View style={styles.restaurantInfo}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>{item.rating}</Text>
          </View>
          <Text style={styles.cuisine}>{item.cuisine}</Text>
          <Text style={styles.priceRange}>{item.priceRange}</Text>
        </View>
        <View style={styles.distanceContainer}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.distance}>{item.distance}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Find Halal Restaurants</Text>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search restaurants, cuisines..."
              placeholderTextColor="#666"
            />
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.cuisineFilter}>
          {CUISINES.map((cuisine) => (
            <TouchableOpacity
              key={cuisine}
              style={[
                styles.cuisineButton,
                selectedCuisine === cuisine && styles.selectedCuisine,
              ]}
              onPress={() => setSelectedCuisine(cuisine)}>
              <Text
                style={[
                  styles.cuisineText,
                  selectedCuisine === cuisine && styles.selectedCuisineText,
                ]}>
                {cuisine}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Restaurants</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={FEATURED_RESTAURANTS}
            renderItem={renderRestaurantCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.restaurantList}
          />
        </View>

        <View style={styles.popularSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Near You</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={FEATURED_RESTAURANTS.slice().reverse()}
            renderItem={renderRestaurantCard}
            keyExtractor={(item) => `popular-${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.restaurantList}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  cuisineFilter: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  cuisineButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  selectedCuisine: {
    backgroundColor: '#2E8B57',
  },
  cuisineText: {
    fontSize: 16,
    color: '#666',
  },
  selectedCuisineText: {
    color: '#fff',
  },
  featuredSection: {
    padding: 20,
  },
  popularSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllButton: {
    color: '#2E8B57',
    fontSize: 16,
    fontWeight: '600',
  },
  restaurantList: {
    paddingRight: 20,
  },
  restaurantCard: {
    width: 280,
    marginRight: 15,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  restaurantImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  certificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(46, 139, 87, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  certificationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 15,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  rating: {
    marginLeft: 4,
    color: '#666',
  },
  cuisine: {
    color: '#666',
    marginRight: 10,
  },
  priceRange: {
    color: '#666',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distance: {
    color: '#666',
    fontSize: 14,
    marginLeft: 4,
  },
});