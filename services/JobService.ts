import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Job {
  id: number;
  title: string;
  company_name: string;
  primary_details: {
    Place: string;
    Salary: string;
    Job_Type: string;
    Experience: string;
    Qualification: string;
  };
  other_details: string;
  whatsapp_no?: string;
  creatives?: Array<{
    file: string;
    thumb_url: string;
  }>;
  job_category?: string;
  status?: number;
  is_bookmarked?: boolean;
}

const API_BASE_URL = 'https://testapi.getlokalapp.com/common/jobs';

export async function fetchJobs(page: number = 1): Promise<Job[]> {
  try {
    const response = await fetch(`${API_BASE_URL}?page=${page}`);
    
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
}

class WebDatabaseService {
  private readonly STORAGE_KEY = 'bookmarked_jobs';

  async setupDatabase(): Promise<void> {
    // No setup needed for localStorage
    return Promise.resolve();
  }

  async addBookmark(job: Job): Promise<void> {
    try {
      const existingData = localStorage.getItem(this.STORAGE_KEY);
      const bookmarks = existingData ? JSON.parse(existingData) : [];
      const now = Date.now();
      
      const newBookmark = {
        id: job.id,
        job_data: JSON.stringify(job),
        bookmarked_at: now
      };
      
      const existingIndex = bookmarks.findIndex((b: any) => b.id === job.id);
      if (existingIndex !== -1) {
        bookmarks[existingIndex] = newBookmark;
      } else {
        bookmarks.push(newBookmark);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookmarks));
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  }

  async removeBookmark(jobId: number): Promise<void> {
    try {
      const existingData = localStorage.getItem(this.STORAGE_KEY);
      if (!existingData) return;
      
      const bookmarks = JSON.parse(existingData);
      const filteredBookmarks = bookmarks.filter((b: any) => b.id !== jobId);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredBookmarks));
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw error;
    }
  }

  async getBookmarkedJobs(): Promise<Job[]> {
    try {
      const existingData = localStorage.getItem(this.STORAGE_KEY);
      if (!existingData) return [];
      
      const bookmarks = JSON.parse(existingData);
      return bookmarks
        .sort((a: any, b: any) => b.bookmarked_at - a.bookmarked_at)
        .map((bookmark: any) => JSON.parse(bookmark.job_data));
    } catch (error) {
      console.error('Error getting bookmarked jobs:', error);
      throw error;
    }
  }

  async isJobBookmarked(jobId: number): Promise<boolean> {
    try {
      const existingData = localStorage.getItem(this.STORAGE_KEY);
      if (!existingData) return false;
      
      const bookmarks = JSON.parse(existingData);
      return bookmarks.some((b: any) => b.id === jobId);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
      throw error;
    }
  }
}

class NativeDatabaseService {
  private readonly STORAGE_KEY = '@bookmarked_jobs';

  async setupDatabase(): Promise<void> {
    // No setup needed for AsyncStorage
    return Promise.resolve();
  }

  async addBookmark(job: Job): Promise<void> {
    try {
      console.log('Adding bookmark for job:', job.id);
      const existingData = await AsyncStorage.getItem(this.STORAGE_KEY);
      const bookmarks = existingData ? JSON.parse(existingData) : [];
      const now = Date.now();
      
      const newBookmark = {
        id: job.id,
        job_data: JSON.stringify(job),
        bookmarked_at: now
      };
      
      const existingIndex = bookmarks.findIndex((b: any) => b.id === job.id);
      if (existingIndex !== -1) {
        bookmarks[existingIndex] = newBookmark;
      } else {
        bookmarks.push(newBookmark);
      }
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookmarks));
      console.log('Bookmark added successfully');
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  }

  async removeBookmark(jobId: number): Promise<void> {
    try {
      console.log('Removing bookmark for job:', jobId);
      const existingData = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (!existingData) return;
      
      const bookmarks = JSON.parse(existingData);
      const filteredBookmarks = bookmarks.filter((b: any) => b.id !== jobId);
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredBookmarks));
      console.log('Bookmark removed successfully');
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw error;
    }
  }

  async getBookmarkedJobs(): Promise<Job[]> {
    try {
      console.log('Getting bookmarked jobs...');
      const existingData = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (!existingData) return [];
      
      const bookmarks = JSON.parse(existingData);
      const jobs = bookmarks
        .sort((a: any, b: any) => b.bookmarked_at - a.bookmarked_at)
        .map((bookmark: any) => JSON.parse(bookmark.job_data));
      
      console.log('Retrieved bookmarked jobs:', jobs.length);
      return jobs;
    } catch (error) {
      console.error('Error getting bookmarked jobs:', error);
      throw error;
    }
  }

  async isJobBookmarked(jobId: number): Promise<boolean> {
    try {
      console.log('Checking if job is bookmarked:', jobId);
      const existingData = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (!existingData) return false;
      
      const bookmarks = JSON.parse(existingData);
      const isBookmarked = bookmarks.some((b: any) => b.id === jobId);
      console.log('Job bookmark status:', isBookmarked);
      return isBookmarked;
    } catch (error) {
      console.error('Error checking bookmark status:', error);
      throw error;
    }
  }
}

export class DatabaseService {
  private service: WebDatabaseService | NativeDatabaseService;

  constructor() {
    if (Platform.OS === 'web') {
      console.log('Initializing Web Database Service');
      this.service = new WebDatabaseService();
    } else {
      console.log('Initializing Native Database Service');
      this.service = new NativeDatabaseService();
    }
  }

  async setupDatabase(): Promise<void> {
    return this.service.setupDatabase();
  }

  async addBookmark(job: Job): Promise<void> {
    return this.service.addBookmark(job);
  }

  async removeBookmark(jobId: number): Promise<void> {
    return this.service.removeBookmark(jobId);
  }

  async getBookmarkedJobs(): Promise<Job[]> {
    return this.service.getBookmarkedJobs();
  }

  async isJobBookmarked(jobId: number): Promise<boolean> {
    return this.service.isJobBookmarked(jobId);
  }
}