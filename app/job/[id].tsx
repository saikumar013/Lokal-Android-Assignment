import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Linking,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Bookmark, BookmarkCheck, MapPin, Briefcase, Clock, Phone, Building, Info, GraduationCap } from 'lucide-react-native';
import { useJobs } from '@/context/JobsContext';
import { Job } from '@/services/JobService';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ErrorView } from '@/components/ErrorView';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { jobs, bookmarkedJobs, isBookmarked, toggleBookmark } = useJobs();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const jobId = parseInt(id as string, 10);
    
    // First check in all jobs
    let foundJob = jobs.find(j => j.id === jobId);
    
    // If not found, check in bookmarked jobs
    if (!foundJob) {
      foundJob = bookmarkedJobs.find(j => j.id === jobId);
    }

    if (foundJob) {
      setJob(foundJob);
    } else {
      setError('Job not found. It may have been removed or is no longer available.');
    }
    
    setLoading(false);
  }, [id, jobs, bookmarkedJobs]);

  const handleBookmarkToggle = () => {
    if (job) {
      toggleBookmark(job);
    }
  };

  const handleCallPhone = () => {
    if (job?.whatsapp_no) {
      Linking.openURL(`tel:${job.whatsapp_no}`);
    }
  };

  const handleWhatsApp = () => {
    if (job?.whatsapp_no) {
      const message = `Hi, I'm interested in the job: ${job.title}`;
      const url = `https://wa.me/${job.whatsapp_no}?text=${encodeURIComponent(message)}`;
      Linking.openURL(url);
    }
  };

  if (loading) {
    return <LoadingIndicator fullScreen message="Loading job details..." />;
  }

  if (error || !job) {
    return <ErrorView message={error || 'Job not found'} />;
  }

  // Default image if none provided
  const imageUrl = job.creatives && job.creatives[0]?.file
    ? job.creatives[0].file
    : 'https://images.pexels.com/photos/3760529/pexels-photo-3760529.jpeg';

  const bookmarked = isBookmarked(job.id);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.image} />
          <TouchableOpacity 
            style={styles.bookmarkButton} 
            onPress={handleBookmarkToggle}
          >
            {bookmarked ? (
              <BookmarkCheck size={24} color="#ffbb00" />
            ) : (
              <Bookmark size={24} color="#ffbb00" />
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.company}>{job.company_name}</Text>
          
          <View style={styles.detailsSection}>
            <View style={styles.detailCard}>
              <MapPin size={20} color="#ffbb00" />
              <Text style={styles.detailTitle}>Location</Text>
              <Text style={styles.detailValue}>{job.primary_details?.Place || 'Not specified'}</Text>
            </View>
            
            <View style={styles.detailCard}>
              <Briefcase size={20} color="#ffbb00" />
              <Text style={styles.detailTitle}>Salary</Text>
              <Text style={styles.detailValue}>{job.primary_details?.Salary || 'Not specified'}</Text>
            </View>
            
            <View style={styles.detailCard}>
              <Clock size={20} color="#ffbb00" />
              <Text style={styles.detailTitle}>Experience</Text>
              <Text style={styles.detailValue}>{job.primary_details?.Experience || 'Not specified'}</Text>
            </View>
            
            <View style={styles.detailCard}>
              <GraduationCap size={20} color="#ffbb00" />
              <Text style={styles.detailTitle}>Education</Text>
              <Text style={styles.detailValue}>{job.primary_details?.Qualification || 'Not specified'}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Description</Text>
            <Text style={styles.description}>{job.other_details || 'No description provided.'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Company</Text>
            <View style={styles.companyInfo}>
              <Building size={20} color="#6B7280" style={styles.companyInfoIcon} />
              <Text style={styles.companyInfoText}>
                {job.company_name}
              </Text>
            </View>
            <View style={styles.companyInfo}>
              <Info size={20} color="#6B7280" style={styles.companyInfoIcon} />
              <Text style={styles.companyInfoText}>
                {job.job_category || 'Industry not specified'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.whatsappButton} 
          onPress={handleWhatsApp}
        >
          <Text style={styles.whatsappButtonText}>Message on WhatsApp</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.callButton} 
          onPress={handleCallPhone}
        >
          <Phone size={20} color="#FFFFFF" />
          <Text style={styles.callButtonText}>Call</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 220,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  bookmarkButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 8,
  },
  company: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 24,
  },
  detailsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  detailCard: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  detailTitle: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    lineHeight: 24,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyInfoIcon: {
    marginRight: 12,
  },
  companyInfoText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  whatsappButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 8,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  whatsappButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  callButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    height: 56,
    width: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginTop: 4,
  },
});