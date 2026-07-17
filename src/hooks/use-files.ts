import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Document } from '../types';

/**
 * Custom hook to query and manage documents.
 * Integrates React Query for automatic invalidations and caching.
 */
export function useFiles() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await api.get<{ documents: Document[] }>('/documents');
      return res.documents;
    },
    // Poll documents if any are processing so status updates dynamically
    refetchInterval: (query) => {
      const docs = query.state.data as Document[] | undefined;
      const hasProcessing = docs?.some((d) => d.status === 'processing' || d.status === 'pending');
      return hasProcessing ? 3000 : false;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.upload<{ message: string; document: Document }>('/documents/upload', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete<{ message: string; deletedId: string }>(`/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  return {
    documents: data || [],
    loading: isLoading,
    error: error ? (error as Error).message : null,
    refetch,
    upload: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    uploadError: uploadMutation.error ? (uploadMutation.error as Error).message : null,
    deleteFile: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
export default useFiles;
