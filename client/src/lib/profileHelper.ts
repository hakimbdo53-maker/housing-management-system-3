/**
 * Profile Helper Utilities
 * 
 * Handles the logic for fetching and mapping student profile data
 * to application forms with auto-fill functionality.
 * 
 * Data flow:
 * 1. User creates account (Signup.tsx)
 *    ↓ Profile data saved: name, nationalId, phone, email
 * 2. Profile data stored in user object (useAuth.ts)
 * 3. Auto-fill in Application forms (NewStudentApplicationForm.tsx, OldStudentApplicationForm.tsx)
 */

import { studentProfileAPI } from '@/services/api';
import { loadProfileFromLocalStorage } from './profileStorage';

export interface StudentProfileData {
  fullName: string;
  nationalId: string;
  phone: string;
  email?: string | null;
}

/**
 * Fetch student profile data from the API
 * 
 * Tries to fetch from backend API endpoint, which returns the profile
 * data that was saved during account creation.
 * Falls back to localStorage if API fails or returns no data.
 * 
 * @param studentId - The student ID to fetch profile for
 * @returns Promise with profile data or null
 */
export async function fetchStudentProfile(studentId: string): Promise<StudentProfileData | null> {
  try {
    if (!studentId) {
      console.warn('[ProfileHelper] No studentId provided, checking localStorage');
      // Try localStorage as fallback when no studentId
      const savedProfile = loadProfileFromLocalStorage();
      if (savedProfile && isValidProfileData(savedProfile)) {
        return savedProfile;
      }
      return null;
    }

    const profileData = await studentProfileAPI.getProfile(studentId);
    
    if (!profileData || typeof profileData !== 'object') {
      console.warn('[ProfileHelper] Invalid profile data from API, checking localStorage');
      // Try localStorage as fallback
      const savedProfile = loadProfileFromLocalStorage();
      if (savedProfile && isValidProfileData(savedProfile)) {
        return savedProfile;
      }
      return null;
    }

    // Map API response to our standardized format
    // Handles both user object and API response formats
    const mappedProfile: StudentProfileData = {
      fullName: (profileData as any)?.fullName || (profileData as any)?.name || '',
      nationalId: (profileData as any)?.nationalId || (profileData as any)?.nationalIDNumber || '',
      phone: (profileData as any)?.phone || (profileData as any)?.phoneNumber || (profileData as any)?.mobileNumber || '',
      email: (profileData as any)?.email || (profileData as any)?.emailAddress || undefined,
    };

    if (isValidProfileData(mappedProfile)) {
      return mappedProfile;
    }

    // If API returned invalid data after mapping, try localStorage
    const savedProfile = loadProfileFromLocalStorage();
    if (savedProfile && isValidProfileData(savedProfile)) {
      return savedProfile;
    }

    return null;
  } catch (error) {
    console.error('[ProfileHelper] Error fetching profile from API:', error);
    // Try localStorage as fallback when API call fails
    const savedProfile = loadProfileFromLocalStorage();
    if (savedProfile && isValidProfileData(savedProfile)) {
      console.log('[ProfileHelper] Using localStorage fallback');
      return savedProfile;
    }
    return null;
  }
}

/**
 * Validate that essential profile data is available
 * @param profile - Profile data to validate
 * @returns true if profile has required fields
 */
export function isValidProfileData(profile: StudentProfileData | null): boolean {
  if (!profile) return false;
  return !!(profile.fullName && profile.nationalId);
}

/**
 * Extract profile data directly from user object (from useAuth)
 * This is faster than API call for basic profile info
 * 
 * @param user - User object from useAuth
 * @returns StudentProfileData or null
 */
export function extractProfileFromUser(user: any): StudentProfileData | null {
  if (!user) return null;

  // Profile data is stored directly on user object during signup
  const profile: StudentProfileData = {
    fullName: user.name || '',
    nationalId: user.nationalId || '',
    phone: user.phone || '',
    email: user.email,
  };

  if (isValidProfileData(profile)) {
    return profile;
  }
  
  // If user object doesn't have profile data, try localStorage as fallback
  const savedProfile = loadProfileFromLocalStorage();
  if (savedProfile && isValidProfileData(savedProfile)) {
    console.log('[ProfileHelper] Using profile from localStorage');
    return savedProfile;
  }
  
  return null;
}
