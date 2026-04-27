import { useRef, useState, useEffect } from "react";
import { Upload, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  onImageUpload: (dataUrl: string, file: File) => void;
  uploadedImage: string | null;
}

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

function showUploadError(message: string) {
  toast.error(message);
}

export function ImageUpload({ onImageUpload, uploadedImage }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);

  // Clear inline error when user clears the image
  useEffect(() => {
    if (!uploadedImage) setInlineError(null);
  }, [uploadedImage]);

  const validateAndRead = (file: File) => {
    if (!file.type.startsWith('image/')) {
      const msg = 'Please upload an image file (PNG, JPG, or GIF).';
      showUploadError(msg);
      setInlineError(msg);
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      const msg = `Image must be under ${MAX_SIZE_MB}MB.`;
      showUploadError(msg);
      setInlineError(msg);
      return;
    }
    setInlineError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onImageUpload(dataUrl, file);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    validateAndRead(file);
    e.target.value = '';
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    validateAndRead(file);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="w-[280px] h-[280px] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors bg-gray-50 hover:bg-gray-100"
      >
        {uploadedImage ? (
          <div className="w-full h-full p-2">
            <img
              src={uploadedImage}
              alt="Uploaded digit"
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
            <Upload className="size-12 mb-3 text-gray-400" />
            <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-400">PNG, JPG, GIF up to 5MB</p>
          </div>
        )}
      </div>
      {inlineError && (
        <div
          className="flex items-center gap-2 w-[280px] px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
          role="alert"
        >
          <AlertCircle className="size-4 shrink-0" />
          <span>{inlineError}</span>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
