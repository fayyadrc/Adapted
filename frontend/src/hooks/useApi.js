// React Query hooks for API calls
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/apiService';

// Query Keys - centralized for cache management
export const queryKeys = {
  results: (userId) => ['results', userId],
  result: (id) => ['result', id],
  folders: (userId) => ['folders', userId],
  health: ['health'],
};

// ============ Results Hooks ============

export function useResults(userId) {
  return useQuery({
    queryKey: queryKeys.results(userId),
    queryFn: () => apiService.getResults(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useResult(id) {
  return useQuery({
    queryKey: queryKeys.result(id),
    queryFn: () => apiService.getResult(id),
    enabled: !!id,
  });
}

export function useDeleteResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => apiService.deleteResult(id),
    onSuccess: () => {
      // Invalidate results to refetch
      queryClient.invalidateQueries({ queryKey: ['results'] });
    },
  });
}

// ============ Folders Hooks ============

export function useFolders(userId) {
  return useQuery({
    queryKey: queryKeys.folders(userId),
    queryFn: () => apiService.getFolders(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, userId, color }) => apiService.createFolder(name, userId, color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });
}

export function useDeleteFolder(userId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => apiService.deleteFolder(id),
    onSuccess: () => {
      // Invalidate folder queries for this user to refetch updated list
      queryClient.invalidateQueries({ queryKey: ['folders', userId] });
      // Also refresh results as they may reference deleted folder
      queryClient.invalidateQueries({ queryKey: ['results'] });
    },
    onError: (error) => {
      console.error('Delete folder mutation error:', error);
    },
  });
}

export function useMoveLessonToFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, folderId }) => apiService.moveLessonToFolder(lessonId, folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });
}

// ============ Upload Hook ============

export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, title, formats, numQuestions, userId, folderId }) =>
      apiService.uploadFile(file, title, formats, numQuestions, userId, folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
    },
  });
}

// ============ Health Check Hook ============

export function useHealthCheck() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => apiService.healthCheck(),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Check every minute
  });
}
