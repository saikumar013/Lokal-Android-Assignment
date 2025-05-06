import { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { Platform } from 'react-native';
import { Job, DatabaseService } from '@/services/JobService';

interface JobsContextType {
  jobs: Job[];
  bookmarkedJobs: Job[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  fetchMoreJobs: () => Promise<void>;
  refreshJobs: () => Promise<void>;
  toggleBookmark: (job: Job) => Promise<void>;
  isBookmarked: (jobId: number) => boolean;
}

const JobsContext = createContext<JobsContextType | undefined>(undefined);

export function useJobs() {
  const context = useContext(JobsContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobsProvider');
  }
  return context;
}

export function JobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [dbService] = useState(() => {
    console.log('Initializing DatabaseService in JobsProvider');
    return new DatabaseService();
  });

  const loadBookmarkedJobs = useCallback(async () => {
    try {
      console.log('Loading bookmarked jobs...');
      const savedJobs = await dbService.getBookmarkedJobs();
      console.log('Loaded bookmarked jobs:', savedJobs.length);
      setBookmarkedJobs(savedJobs);
    } catch (err) {
      console.error('Error loading bookmarked jobs:', err);
      setError('Failed to load bookmarked jobs');
    }
  }, [dbService]);

  // Initialize database and load bookmarked jobs
  useEffect(() => {
    let mounted = true;

    const initializeDb = async () => {
      try {
        console.log('Setting up database...');
        await dbService.setupDatabase();
        
        if (!mounted) return;
        
        await loadBookmarkedJobs();
      } catch (err) {
        console.error('Failed to initialize database:', err);
        if (mounted) {
          setError('Failed to load saved jobs. Please restart the app.');
        }
      }
    };

    initializeDb();

    return () => {
      mounted = false;
    };
  }, [dbService, loadBookmarkedJobs]);

  const fetchJobs = async (pageNum: number) => {
    try {
      console.log('Fetching jobs for page:', pageNum);
      const response = await fetch(`https://testapi.getlokalapp.com/common/jobs?page=${pageNum}`);
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched jobs:', data.results?.length || 0);
      return data.results || [];
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  };

  // Initial fetch jobs
  useEffect(() => {
    let mounted = true;

    const loadInitialJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const newJobs = await fetchJobs(1);
        
        if (!mounted) return;
        
        setJobs(newJobs);
        setPage(1);
        setHasMore(newJobs.length > 0);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        if (mounted) {
          setError('Failed to load jobs. Please check your connection and try again.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadInitialJobs();

    return () => {
      mounted = false;
    };
  }, []);

  const fetchMoreJobs = async () => {
    if (!hasMore || loading) return;
    
    try {
      setLoading(true);
      const nextPage = page + 1;
      const newJobs = await fetchJobs(nextPage);
      
      if (newJobs.length === 0) {
        setHasMore(false);
      } else {
        setJobs(prevJobs => [...prevJobs, ...newJobs]);
        setPage(nextPage);
      }
    } catch (err) {
      console.error('Error fetching more jobs:', err);
      setError('Failed to load more jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshJobs = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const newJobs = await fetchJobs(1);
      setJobs(newJobs);
      setPage(1);
      setHasMore(newJobs.length > 0);
      await loadBookmarkedJobs(); // Refresh bookmarked jobs as well
    } catch (err) {
      console.error('Error refreshing jobs:', err);
      setError('Failed to refresh jobs. Please check your connection and try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const toggleBookmark = useCallback(async (job: Job) => {
    try {
      console.log('Toggling bookmark for job:', job.id);
      const isCurrentlyBookmarked = bookmarkedJobs.some(bj => bj.id === job.id);
      
      if (isCurrentlyBookmarked) {
        console.log('Removing bookmark...');
        await dbService.removeBookmark(job.id);
        setBookmarkedJobs(prev => prev.filter(j => j.id !== job.id));
        console.log('Bookmark removed');
      } else {
        console.log('Adding bookmark...');
        await dbService.addBookmark(job);
        setBookmarkedJobs(prev => [...prev, job]);
        console.log('Bookmark added');
      }
      
      // Reload bookmarked jobs to ensure consistency
      await loadBookmarkedJobs();
      console.log('Bookmark toggle completed');
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      setError('Failed to update bookmark. Please try again.');
    }
  }, [bookmarkedJobs, dbService, loadBookmarkedJobs]);

  const isBookmarked = useCallback((jobId: number): boolean => {
    const result = bookmarkedJobs.some(job => job.id === jobId);
    console.log('Checking if job is bookmarked:', jobId, result);
    return result;
  }, [bookmarkedJobs]);

  return (
    <JobsContext.Provider value={{
      jobs,
      bookmarkedJobs,
      loading,
      refreshing,
      error,
      page,
      hasMore,
      fetchMoreJobs,
      refreshJobs,
      toggleBookmark,
      isBookmarked,
    }}>
      {children}
    </JobsContext.Provider>
  );
}