import React, { useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Search } from 'lucide-react-native';
import { useJobs } from '@/context/JobsContext';
import { JobCard } from '@/components/JobCard';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { EmptyState } from '@/components/EmptyState';
import { ErrorView } from '@/components/ErrorView';
import { Job } from '@/services/JobService';

export default function JobsScreen() {
  const { 
    jobs, 
    loading, 
    refreshing, 
    error, 
    hasMore,
    fetchMoreJobs, 
    refreshJobs 
  } = useJobs();

  const renderFooter = () => {
    if (!hasMore) return null;
    return loading ? <LoadingIndicator size="small" message="Loading more jobs..." /> : null;
  };

  const handleEndReached = () => {
    if (!loading && hasMore) {
      fetchMoreJobs();
    }
  };

  const renderItem = ({ item }: { item: Job }) => <JobCard job={item} />;

  const keyExtractor = (item: Job | null | undefined) => {
    if (!item) return Math.random().toString(); // Fallback for null/undefined items
    return item.id?.toString() || Math.random().toString(); // Fallback if id is undefined
  };

  if (loading && jobs.length === 0) {
    return <LoadingIndicator fullScreen message="Loading jobs..." />;
  }

  if (error && jobs.length === 0) {
    return <ErrorView message={error} onRetry={refreshJobs} />;
  }

  if (jobs.length === 0) {
    return (
      <EmptyState
        title="No Jobs Found"
        message="We couldn't find any jobs matching your criteria. Try adjusting your search or check back later."
        buttonTitle="Refresh"
        onAction={refreshJobs}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for jobs..."
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>
      
      <FlatList
        data={jobs}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContainer}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshJobs}
            colors={['#ffbb00']}
            tintColor="#ffbb00"
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  listContainer: {
    padding: 16,
  },
});