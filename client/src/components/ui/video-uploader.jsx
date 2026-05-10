import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Loader2, Video, Trash2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export function VideoUploader({ courseId, videos = [], onVideoUpload, onVideoDelete }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [localVideos, setLocalVideos] = useState(videos);

  useEffect(() => {
    setLocalVideos(videos);
  }, [videos]);

  const onDrop = useCallback(
    async (acceptedFiles) => {
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
      formData.append("title", file.name.replace(/\.[^/.]+$/, ""));
      formData.append("order", localVideos.length.toString());

      setUploading(true);
      setUploadProgress(0);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      try {
        const res = await api.post(`/courses/${courseId}/videos`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (res.data.success) {
          const newVideo = res.data.data;
          setLocalVideos((prev) => [...prev, newVideo]);
          onVideoUpload?.(newVideo);
          toast.success("Video uploaded successfully");
        }
      } catch (error) {
        clearInterval(progressInterval);
        console.error("Upload error:", error);
        toast.error("Failed to upload video", {
          description: error.response?.data?.message || "Please try again",
        });
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [courseId, localVideos.length, onVideoUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".webm", ".mov"],
    },
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024,
    disabled: uploading,
  });

  const handleDelete = async (videoId) => {
    try {
      await api.delete(`/courses/${courseId}/videos/${videoId}`);
      setLocalVideos((prev) => prev.filter((v) => v._id !== videoId));
      onVideoDelete?.(videoId);
      toast.success("Video deleted successfully");
    } catch {
      toast.error("Failed to delete video");
    }
  };

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          "relative w-full rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors p-8",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          uploading && "pointer-events-none opacity-60"
        )}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="text-center space-y-2 w-full max-w-md">
              <p className="text-sm font-medium">Uploading video...</p>
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
            </div>
          </>
        ) : (
          <>
            <Upload className="h-10 w-10 text-muted-foreground/50" />
            <div className="text-center">
              <p className="text-sm font-medium">
                {isDragActive ? "Drop video here" : "Drag & drop or click to upload"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                MP4, WebM, MOV up to 500 MB
              </p>
            </div>
          </>
        )}
      </div>

      {/* Upload Error/Warning */}
      {uploading && uploadProgress === 0 && (
        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
          <AlertCircle className="h-4 w-4" />
          <span>Large files may take a while to upload. Please be patient.</span>
        </div>
      )}

      {/* Videos List */}
      {localVideos.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Video className="h-4 w-4" />
            Course Videos ({localVideos.length})
          </h4>
          <div className="space-y-2">
            {localVideos
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((video) => (
                <Card key={video._id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium truncate">{video.title}</h5>
                          {video.duration > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {formatDuration(video.duration)}
                            </Badge>
                          )}
                        </div>
                        {video.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {video.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Order: {video.order + 1}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(video._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
