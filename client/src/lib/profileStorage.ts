/**
 * Profile LocalStorage Utility
 * 
 * Manages profile data storage and retrieval from localStorage
 * as a fallback when API is not available.
 * 
 * This is a bridge solution until the full Backend API is ready.
 */

export interface ProfileData {
  fullName: string;
  nationalId: string;
  phone: string;
  email?: string | null;
}

const PROFILE_STORAGE_KEY = 'profileData';

/**
 * Save profile data to localStorage
 * Called after successful signup
 * 
 * @param profile - Profile data to save
 */
export function saveProfileToLocalStorage(profile: ProfileData): void {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    console.log('[ProfileStorage] Profile saved:', profile);
  } catch (error) {
    console.error('[ProfileStorage] Error saving profile:', error);
  }
}

/**
 * Load profile data from localStorage
 * Used as fallback when API fails
 * 
 * @returns Profile data or null if not found
 */
export function loadProfileFromLocalStorage(): ProfileData | null {
  try {
    console.log('[ProfileStorage] Attempting to load profile from localStorage...');
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    console.log('[ProfileStorage] localStorage.getItem("' + PROFILE_STORAGE_KEY + '") returned:', saved);
    if (saved) {
      const profile = JSON.parse(saved) as ProfileData;
      console.log('[ProfileStorage] Profile loaded from localStorage:', profile);
      return profile;
    }
    console.log('[ProfileStorage] No profile found in localStorage');
  } catch (error) {
    console.error('[ProfileStorage] Error loading profile:', error);
  }
  return null;
}

/**
 * Update profile data in localStorage
 * Called when user edits their profile
 * 
 * @param updates - Fields to update
 */
export function updateProfileInLocalStorage(updates: Partial<ProfileData>): void {
  try {
    const current = loadProfileFromLocalStorage();
    if (current) {
      const updated = { ...current, ...updates };
      saveProfileToLocalStorage(updated);
      console.log('[ProfileStorage] Profile updated');
    }
  } catch (error) {
    console.error('[ProfileStorage] Error updating profile:', error);
  }
}

/**
 * Clear profile data from localStorage
 * Called on logout or account deletion
 */
export function clearProfileFromLocalStorage(): void {
  try {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    console.log('[ProfileStorage] Profile cleared');
  } catch (error) {
    console.error('[ProfileStorage] Error clearing profile:', error);
  }
}

/**
 * Check if profile data exists in localStorage
 * 
 * @returns true if profile data exists
 */
export function hasProfileInLocalStorage(): boolean {
  try {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    return saved !== null && saved !== '';
  } catch (error) {
    console.error('[ProfileStorage] Error checking profile:', error);
    return false;
  }
}
