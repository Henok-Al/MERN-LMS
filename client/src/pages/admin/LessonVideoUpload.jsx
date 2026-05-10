import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Loader2, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

export function LessonVideoUpload({ chapterId, lessonId, currentVideoUrl, onVideoUploaded }) {
  const [uploading, setUploading] = useState(false);

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file size (500 MB)
    if (file.size > 500 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Maximum file size is 500 MB",
      });
      return;
    }

    // Validate file type
    const allowedTypes = ["video/mp4", "video/webm", "video/quicktime"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type", {
        description: "Only MP4, WebM, and MOV files are allowed",
      });
      return;
    }

    const formData = new FormData();
    formData.append("video", file);

    setUploading(true);
    try {
      const res = await api.post(`/courses/chapters/${chapterId}/lessons/${lessonId}/video`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        toast.success("Video uploaded successfully");
        onVideoUploaded?.(res.data.data);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload video", {
        description: error.response?.data?.message || "Please try again",
      });
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".webm", ".mov"],
    },
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024,
    disabled: uploading,
  });

  return (
    <div className="relative">
      {currentVideoUrl ? (
        <div className="flex items-center gap-2">
          <Video className="h-4 w-4 text-green-600" />
          <span className="text-xs text-green-600">Video uploaded</span>
          <div
            {...getRootProps()}
            className="cursor-pointer p-1 hover:bg-accent rounded"
            title="Replace video"
          >
            <input {...getInputProps()} />
            <Upload className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "flex items-center gap-1 cursor-pointer px-2 py-1 rounded text-xs border border-dashed",
            isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
            uploading && "opacity-50 pointer-events-none"
          )}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Upload className="h-3 w-3" />
          )}
          <span>{uploading ? "Uploading..." : "Upload Video"}</span>
        </div>
      )}
    </div>
  );
}
