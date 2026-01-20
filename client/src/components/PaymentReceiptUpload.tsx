import React, { useState } from "react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useToast } from "@/hooks/useToast";

/**
 * File Upload Component for Payment Receipts
 * Implements server-side validation for security
 */
export const PaymentReceiptUpload: React.FC<{
  onUploadSuccess?: (filename: string, storageRef: string) => void;
  feeId: number;
}> = ({ onUploadSuccess, feeId }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { validateBeforeUpload, uploadFile, isUploading } = useFileUpload();
  const toast = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("يرجى اختيار ملف");
      return;
    }

    try {
      // Validate file before upload
      const validation = await validateBeforeUpload(selectedFile);

      if (!validation.isValid) {
        toast.error(validation.message);
        return;
      }

      // Upload file
      const uploadPromise = uploadFile(selectedFile);
      toast.promise(
        uploadPromise,
        {
          loading: "جاري رفع الملف...",
          success: (data) => {
            onUploadSuccess?.(data.filename, data.storageRef);
            setSelectedFile(null);
            return "تم رفع الملف بنجاح";
          },
          error: (error) => {
            return error instanceof Error
              ? error.message
              : "فشل رفع الملف";
          },
        }
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "فشل رفع الملف، حاول مرة أخرى"
      );
    }
  };

  return (
    <div className="space-y-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
      <h3 className="font-semibold text-gray-700">رفع إيصال الدفع</h3>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          الملف (JPEG, PNG, PDF - 5MB كحد أقصى)
        </label>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={handleFileSelect}
          disabled={isUploading}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {selectedFile && (
          <p className="text-sm text-gray-600">
            الملف المحدد: {selectedFile.name} (
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg
          hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
          transition-colors duration-200"
      >
        {isUploading ? "جاري الرفع..." : "رفع الملف"}
      </button>

      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
        <p className="font-semibold mb-1">معلومات الأمان:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>يتم التحقق من الملف على الخادم فقط</li>
          <li>الملفات المسموحة: JPEG, PNG, PDF فقط</li>
          <li>الحد الأقصى لحجم الملف: 5MB</li>
          <li>سيتم إعادة تسمية الملف تلقائياً لضمان الأمان</li>
        </ul>
      </div>
    </div>
  );
};
