import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { Bookmark, BookmarkCheck, MapPin, Briefcase, Clock, Phone } from 'lucide-react-native';
import { router } from 'expo-router';
import { Job } from '@/services/JobService';
import { useJobs } from '@/context/JobsContext';

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const { isBookmarked, toggleBookmark, bookmarkedJobs } = useJobs();
  const bookmarked = isBookmarked(job.id);

  const navigateToJobDetails = () => {
    router.push(`/job/${job.id}`);
  };

  const handleBookmarkToggle = useCallback(async (e: any) => {
    try {
      e.stopPropagation();
      console.log('Bookmark toggle pressed for job:', job.id);
      console.log('Current bookmark status:', bookmarked);
      console.log('Current bookmarked jobs:', bookmarkedJobs);
      
      await toggleBookmark(job);
      
      console.log('Bookmark toggle completed');
      console.log('New bookmark status:', isBookmarked(job.id));
      console.log('Updated bookmarked jobs:', bookmarkedJobs);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  }, [job, bookmarked, toggleBookmark, isBookmarked, bookmarkedJobs]);

  // Default image if none provided
  const imageUrl = job.creatives && job.creatives[0]?.thumb_url
    ? job.creatives[0].thumb_url
    : 'https://images.pexels.com/photos/3760529/pexels-photo-3760529.jpeg';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={navigateToJobDetails}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Image source={{ uri: imageUrl }} style={styles.companyLogo} />
        <View style={styles.headerContent}>
          <Text style={styles.title} numberOfLines={1}>{job.title}</Text>
          <Text style={styles.company}>{job.company_name}</Text>
        </View>
        <TouchableOpacity 
          onPress={handleBookmarkToggle} 
          style={styles.bookmarkButton}
          activeOpacity={0.7}
        >
          {bookmarked ? (
            <BookmarkCheck size={24} color="#ffbb00" />
          ) : (
            <Bookmark size={24} color="#9CA3AF" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsContainer}>
        {job.primary_details?.Place && (
          <View style={styles.detailRow}>
            <MapPin size={16} color="#6B7280" />
            <Text style={styles.detailText}>{job.primary_details.Place}</Text>
          </View>
        )}
        
        {job.primary_details?.Salary && (
          <View style={styles.detailRow}>
            <Briefcase size={16} color="#6B7280" />
            <Text style={styles.detailText}>{job.primary_details.Salary}</Text>
          </View>
        )}
        
        {job.primary_details?.Experience && (
          <View style={styles.detailRow}>
            <Clock size={16} color="#6B7280" />
            <Text style={styles.detailText}>{job.primary_details.Experience}</Text>
          </View>
        )}
        
        {job.whatsapp_no && (
          <View style={styles.detailRow}>
            <Phone size={16} color="#6B7280" />
            <Text style={styles.detailText}>{job.whatsapp_no}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.tagContainer}>
          {job.job_category && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{job.job_category}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity 
          style={styles.applyButton} 
          onPress={navigateToJobDetails}
          activeOpacity={0.7}
        >
          <Text style={styles.applyButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 2,
  },
  company: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  bookmarkButton: {
    padding: 8,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#FFF8E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#ffbb00',
    fontFamily: 'Inter-Medium',
  },
  applyButton: {
    backgroundColor: '#ffbb00',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});