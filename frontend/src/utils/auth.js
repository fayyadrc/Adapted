import { supabase } from '../supabaseConfig';

/**
 * Authentication utility functions for Supabase
 */

/**
 * Get the current authenticated user
 * @returns {Promise<{user: object|null, error: object|null}>}
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  } catch (error) {
    return { user: null, error };
  }
};

/**
 * Get the current session
 * @returns {Promise<{session: object|null, error: object|null}>}
 */
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  } catch (error) {
    return { session: null, error };
  }
};

/**
 * Sign out the current user
 * @returns {Promise<{error: object|null}>}
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

/**
 * Listen to authentication state changes
 * @param {Function} callback - Function to call when auth state changes
 * @returns {object} - Subscription object with unsubscribe method
 */
export const onAuthStateChange = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return subscription;
};

/**
 * Request password reset email
 * @param {string} email - User's email
 * @returns {Promise<{error: object|null}>}
 */
export const resetPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  return { error };
};

/**
 * Update user password
 * @param {string} newPassword - New password
 * @returns {Promise<{error: object|null}>}
 */
export const updatePassword = async (newPassword) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { error };
};

/**
 * Update user metadata
 * @param {object} metadata - User metadata to update
 * @returns {Promise<{user: object|null, error: object|null}>}
 */
export const updateUserMetadata = async (metadata) => {
  const { data: { user }, error } = await supabase.auth.updateUser({
    data: metadata,
  });
  return { user, error };
};
