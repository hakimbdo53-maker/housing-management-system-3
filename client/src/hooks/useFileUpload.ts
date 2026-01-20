import { trpc } from "@/lib/trpc";

/**
 * Hook for handling file uploads on client side
 * Provides validation and upload functionality
 */
export const useFileUpload = () => {
  const uploadReceipt = trpc.files.uploadReceipt.useMutation();
  const validateFile = trpc.files.validateFile.useQuery(undefined, {
    enabled: false,
  });

  /**
   * Validate file before upload
   * Returns { isValid: boolean, message: string }
   */
  const validateBeforeUpload = async (
    file: File
  ): Promise<{ isValid: boolean; message: string }> => {
    if (!file) {
      return {
        isValid: false,
        message: "الملف مفقود",
      };
    }

    try {
      const response = await trpc.files.validateFile.fetch({
        mimeType: file.type,
        fileSize: file.size,
        filename: file.name,
      });

      return response;
    } catch (error) {
      return {
        isValid: false,
        message: "فشل التحقق من الملف",
      };
    }
  };

  /**
   * Upload receipt file
   * Validates on server side and generates unique filename
   */
  const uploadFile = async (file: File) => {
    if (!file) {
      throw new Error("الملف مفقود");
    }

    return uploadReceipt.mutateAsync({
      filename: file.name,
      mimeType: file.type,
      fileSize: file.size,
    });
  };

  return {
    validateBeforeUpload,
    uploadFile,
    isUploading: uploadReceipt.isPending,
    isValidating: validateFile.isLoading,
  };
};
