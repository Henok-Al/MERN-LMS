import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "sonner";

export function FileUploader({
  value,
  onChange,
  endpoint = "/media/upload",
  className,
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || "");

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      setUploading(true);
      try {
        const res = await api.post(endpoint, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (res.data.success) {
          const url = res.data.data?.url || res.data.data?.secure_url;
          setPreview(url);
          onChange?.(url);
          toast.success("File uploaded successfully");
        }
      } catch {
        toast.error("Failed to upload file");
      } finally {
        setUploading(false);
      }
    },
    [endpoint, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const removeFile = () => {
    setPreview("");
    onChange?.("");
  };

  return (
    <div className={cn("space-y-2", className)}>
      {preview ? (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-muted">
          <img
            src={preview}
            alt="Upload preview"
            className="w-full h-full object-cover"
          />
          <button
            onClick={removeFile}
            className="absolute top-2 right-2 p-1 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "relative w-full aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50",
            uploading && "pointer-events-none opacity-60"
          )}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </>
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
              <div className="text-center">
                <p className="text-sm font-medium">
                  {isDragActive
                    ? "Drop file here"
                    : "Drag & drop or click to upload"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, GIF, WebP up to 5MB
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}