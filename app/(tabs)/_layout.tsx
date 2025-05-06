import { Tabs } from 'expo-router';
import { Bookmark, Briefcase } from 'lucide-react-native';
import { StyleSheet, Image, View, Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ffbb00',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerTitle: () => (
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: '#ffbb00' }]}>Lokal</Text>
            <Text style={styles.headerTitle}> Jobs</Text>
          </View>
        ),
        headerTitleAlign: 'center',
        headerLeft: () => (
          <View style={styles.headerLogoContainer}>
            <Image 
              source={require('../../assets/images/left.png')}
              style={styles.headerLogo}
            />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Jobs',
          tabBarIcon: ({ color, size }) => <Briefcase size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'Bookmarks',
          tabBarIcon: ({ color, size }) => <Bookmark size={size} color={color} />,
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <Text style={[styles.headerTitle, { color: '#ffbb00' }]}>Saved</Text>
              <Text style={styles.headerTitle}> Jobs</Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E5E7EB',
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: '600',
    fontSize: 18,
    color: '#111827',
  },
  headerLogoContainer: {
    paddingLeft: 16,
    justifyContent: 'center',
  },
  headerLogo: {
    width: 38,
    height: 38,
    resizeMode: 'contain',
  },
});