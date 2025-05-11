import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, Modal } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const MENU_CATEGORIES = [
  'All',
  'Grilled',
  'Fried',
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
];

const SAMPLE_DISHES = [
  {
    id: '1',
    name: 'Mixed Grill Platter',
    description: 'Assortment of grilled meats including lamb chops, chicken tikka, and seekh kebab',
    price: '$24.99',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947',
    category: 'Grilled',
    isHalal: true,
    dietaryInfo: ['Dairy-Free'],
    ingredients: ['Lamb', 'Chicken', 'Spices', 'Fresh Herbs'],
    preparationMethod: 'Grilled over charcoal',
  },
  {
    id: '2',
    name: 'Vegetable Biryani',
    description: 'Aromatic rice dish with seasonal vegetables and traditional spices',
    price: '$16.99',
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0',
    category: 'Vegetarian',
    isHalal: true,
    dietaryInfo: ['Vegetarian', 'Gluten-Free'],
    ingredients: ['Basmati Rice', 'Mixed Vegetables', 'Biryani Spices', 'Saffron'],
    preparationMethod: 'Layered and slow-cooked',
  },
  {
    id: '3',
    name: 'Falafel Wrap',
    description: 'Crispy falafel with fresh vegetables and tahini sauce',
    price: '$12.99',
    image: 'https://images.unsplash.com/photo-1592415486689-125cbbfcbee2',
    category: 'Fried',
    isHalal: true,
    dietaryInfo: ['Vegan', 'Dairy-Free'],
    ingredients: ['Chickpeas', 'Fresh Herbs', 'Spices', 'Vegetables'],
    preparationMethod: 'Deep fried',
  },
  {
    id: '4',
    name: 'Butter Chicken',
    description: 'Tender chicken in a rich, creamy tomato sauce',
    price: '$18.99',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398',
    category: 'Grilled',
    isHalal: true,
    dietaryInfo: ['Gluten-Free'],
    ingredients: ['Chicken', 'Tomatoes', 'Cream', 'Butter', 'Indian Spices'],
    preparationMethod: 'Grilled then simmered in sauce',
  },
  {
    id: '5',
    name: 'Mediterranean Salad',
    description: 'Fresh salad with feta, olives, and house dressing',
    price: '$14.99',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999',
    category: 'Vegetarian',
    isHalal: true,
    dietaryInfo: ['Vegetarian', 'Gluten-Free'],
    ingredients: ['Mixed Greens', 'Feta Cheese', 'Olives', 'Cucumber', 'Tomatoes'],
    preparationMethod: 'Fresh assembled',
  },
  {
    id: '6',
    name: 'Shawarma Plate',
    description: 'Seasoned meat with rice and grilled vegetables',
    price: '$19.99',
    image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783',
    category: 'Grilled',
    isHalal: true,
    dietaryInfo: ['Dairy-Free'],
    ingredients: ['Lamb', 'Rice', 'Mixed Vegetables', 'Middle Eastern Spices'],
    preparationMethod: 'Slow-roasted and grilled',
  }
];

interface Dish {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  isHalal: boolean;
  dietaryInfo: string[];
  ingredients: string[];
  preparationMethod: string;
}

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  const renderDishCard = ({ item }: { item: Dish }) => (
    <TouchableOpacity 
      style={styles.dishCard}
      onPress={() => setSelectedDish(item)}
    >
      <Image source={{ uri: item.image }} style={styles.dishImage} />
      <View style={styles.dishInfo}>
        <View style={styles.dishHeader}>
          <Text style={styles.dishName}>{item.name}</Text>
          <Text style={styles.dishPrice}>{item.price}</Text>
        </View>
        <Text style={styles.dishDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.dishTags}>
          {item.isHalal && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>Halal</Text>
            </View>
          )}
          {item.dietaryInfo.map((diet, index) => (
            <View key={index} style={[styles.tag, styles.dietTag]}>
              <Text style={styles.tagText}>{diet}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Menu</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryFilter}
        >
          {MENU_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategory,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.selectedCategoryText,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.menuSection}>
          <FlatList
            data={SAMPLE_DISHES}
            renderItem={renderDishCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.dishList}
          />
        </View>
      </ScrollView>

      {selectedDish && (
        <Modal
          visible={!!selectedDish}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedDish(null)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setSelectedDish(null)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
              
              <Image 
                source={{ uri: selectedDish.image }} 
                style={styles.modalImage} 
              />
              
              <View style={styles.modalInfo}>
                <Text style={styles.modalTitle}>{selectedDish.name}</Text>
                <Text style={styles.modalPrice}>{selectedDish.price}</Text>
                <Text style={styles.modalDescription}>
                  {selectedDish.description}
                </Text>
                
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Ingredients</Text>
                  <View style={styles.ingredientsList}>
                    {selectedDish.ingredients.map((ingredient, index) => (
                      <Text key={index} style={styles.ingredient}>
                        • {ingredient}
                      </Text>
                    ))}
                  </View>
                </View>
                
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Preparation Method</Text>
                  <Text style={styles.preparationText}>
                    {selectedDish.preparationMethod}
                  </Text>
                </View>
                
                <TouchableOpacity style={styles.orderButton}>
                  <Text style={styles.orderButtonText}>Add to Order</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  filterButton: {
    padding: 8,
  },
  categoryFilter: {
    paddingHorizontal: 20,
    marginVertical: 15,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  selectedCategory: {
    backgroundColor: '#2E8B57',
  },
  categoryText: {
    fontSize: 16,
    color: '#666',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  menuSection: {
    padding: 20,
  },
  dishList: {
    paddingBottom: 20,
  },
  dishCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dishImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  dishInfo: {
    padding: 15,
  },
  dishHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dishName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  dishPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginLeft: 10,
  },
  dishDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  dishTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#2E8B57',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  dietTag: {
    backgroundColor: '#666',
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
  },
  modalImage: {
    width: '100%',
    height: 250,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalInfo: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 15,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  ingredientsList: {
    marginLeft: 10,
  },
  ingredient: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  preparationText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  orderButton: {
    backgroundColor: '#2E8B57',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});