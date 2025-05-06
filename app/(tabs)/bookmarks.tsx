import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  SafeAreaView,
} from 'react-native';
import { useJobs } from '@/context/JobsContext';
import { JobCard } from '@/components/JobCard';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { EmptyState } from '@/components/EmptyState';
import { ErrorView } from '@/components/ErrorView';
import { Job } from '@/services/JobService';
import { router } from 'expo-router';

export default function BookmarksScreen() {
  const { bookmarkedJobs, loading, error } = useJobs();

  const renderItem = ({ item }: { item: Job }) => <JobCard job={item} />;

  const navigateToJobs = () => {
    router.navigate('/');
  };

  if (loading && bookmarkedJobs.length === 0) {
    return <LoadingIndicator fullScreen message="Loading your bookmarks..." />;
  }

  if (error) {
    return <ErrorView message={error} />;
  }

  if (bookmarkedJobs.length === 0) {
    return (
      <EmptyState
        title="No Bookmarks Yet"
        message="You haven't saved any jobs yet. Browse jobs and tap the bookmark icon to save them for later."
        buttonTitle="Browse Jobs"
        onAction={navigateToJobs}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={bookmarkedJobs}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContainer: {
    padding: 16,
  },
});