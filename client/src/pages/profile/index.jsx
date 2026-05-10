import { useContext, useEffect, useState, useCallback } from "react";
import { AuthContext } from "@/context/auth-context";
import {
  Loader2,
  User,
  Mail,
  Phone,
  Globe,
  Twitter,
  Linkedin,
  Github,
  Camera,
  Shield,
  Key,
  AlertTriangle,
  Save,
  ArrowLeft,
  Building2,
  FileText,
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Calendar,
  BarChart3,
  Flame,
  Target,
  Zap,
  Trophy,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import api from "@/lib/api";

export default function ProfilePage() {
  const { isAuthenticated, isLoading, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const [formData, setFormData] = useState({
    userName: "",
    bio: "",
    phone: "",
    title: "",
    website: "",
    socialLinks: { twitter: "", linkedin: "", github: "" },
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/profile");
      const data = res.data.data;
      setProfile(data);
      setFormData({
        userName: data.userName || "",
        bio: data.bio || "",
        phone: data.phone || "",
        title: data.title || "",
        website: data.website || "",
        socialLinks: {
          twitter: data.socialLinks?.twitter || "",
          linkedin: data.socialLinks?.linkedin || "",
          github: data.socialLinks?.github || "",
        },
      });
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/auth/profile/stats");
      setStats(res.data.data);
    } catch {
      // Stats are optional, don't show error
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
      fetchStats();
    }
  }, [isAuthenticated]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (platform, value) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put("/auth/profile", formData);
      setProfile(res.data.data);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Convert to base64 for simple avatar storage
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const res = await api.put("/auth/profile", { avatar: e.target.result });
        setProfile(res.data.data);
        toast.success("Avatar updated");
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to upload avatar");
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleAvatarDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handlePasswordChange = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (!currentPassword || !newPassword) {
      toast.error("All password fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    setChangingPassword(true);
    try {
      await api.put("/auth/profile/password", {
        currentPassword,
        newPassword,
      });
      toast.success("Password changed successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete("/auth/profile");
      toast.success("Account deleted");
      logout();
      navigate("/auth");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete account");
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const inputClass =
    "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  const textareaClass =
    "flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  const labelClass = "text-sm font-medium leading-none mb-2 block";

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-16 border-b flex items-center px-4 lg:px-6 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="text-lg font-semibold">Skillio Profile</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8 pt-4">
          <div className="relative mb-4">
            <div {...getRootProps()} className="cursor-pointer group">
              <input {...getInputProps()} />
              <Avatar className="h-24 w-24 ring-4 ring-background shadow-xl">
                <AvatarImage src={profile?.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {getInitials(profile?.userName)}
                </AvatarFallback>
              </Avatar>
              <div
                className={`absolute inset-0 rounded-full flex items-center justify-center transition-all ${
                  isDragActive
                    ? "bg-primary/30"
                    : "bg-black/40 opacity-0 group-hover:opacity-100"
                }`}
              >
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <h2 className="text-xl font-bold">{profile?.userName}</h2>
          <p className="text-muted-foreground">{profile?.userEmail}</p>
          <Badge variant="secondary" className="mt-1 capitalize">
            {profile?.role}
          </Badge>
        </div>

        {/* Stats Overview */}
        {!statsLoading && stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalCourses}</p>
                    <p className="text-xs text-muted-foreground">Courses Enrolled</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.completedLessons}</p>
                    <p className="text-xs text-muted-foreground">Lessons Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.hoursLearned}</p>
                    <p className="text-xs text-muted-foreground">Hours Learned</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.achievements?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Achievements</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Progress Overview */}
        {!statsLoading && stats && stats.totalLessons > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Learning Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Completion</span>
                  <span>{stats.completionRate}%</span>
                </div>
                <Progress value={stats.completionRate} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {stats.completedLessons} of {stats.totalLessons} lessons completed
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="w-full border-b rounded-none bg-transparent p-0 h-auto gap-0 justify-center">
            <TabsTrigger
              value="info"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-sm font-semibold"
            >
              <User className="h-4 w-4 mr-2" />
              Information
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-sm font-semibold"
            >
              <Award className="h-4 w-4 mr-2" />
              Achievements
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-sm font-semibold"
            >
              <Key className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Info Tab */}
          <TabsContent value="info" className="space-y-6 pt-2">
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Display Name</label>
                <input
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Title / Role</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Senior Instructor"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  className={textareaClass}
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.bio?.length || 0}/500 characters
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    <Phone className="h-3 w-3 inline mr-1" />
                    Phone
                  </label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 234 567 890"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    <Globe className="h-3 w-3 inline mr-1" />
                    Website
                  </label>
                  <input
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://yoursite.com"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="pt-2">
                <h3 className="font-semibold mb-3">Social Links</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Twitter className="h-5 w-5 text-sky-500 shrink-0" />
                    <input
                      value={formData.socialLinks.twitter}
                      onChange={(e) => handleSocialChange("twitter", e.target.value)}
                      placeholder="https://twitter.com/username"
                      className={inputClass}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Linkedin className="h-5 w-5 text-blue-700 shrink-0" />
                    <input
                      value={formData.socialLinks.linkedin}
                      onChange={(e) => handleSocialChange("linkedin", e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className={inputClass}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Github className="h-5 w-5 shrink-0" />
                    <input
                      value={formData.socialLinks.github}
                      onChange={(e) => handleSocialChange("github", e.target.value)}
                      placeholder="https://github.com/username"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6 pt-2">
            {statsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats?.achievements?.map((achievement) => (
                    <Card key={achievement.id} className={achievement.earned ? "border-primary/50" : "opacity-50"}>
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl mb-2">{achievement.icon}</div>
                        <h3 className="font-semibold text-sm">{achievement.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                        {achievement.earned && (
                          <Badge variant="default" className="mt-2">
                            Earned
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Recent Activity */}
                {stats?.recentActivity && stats.recentActivity.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {stats.recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-center gap-3 text-sm">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <BookOpen className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">Completed lesson in {activity.courseTitle}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(activity.completedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6 pt-2">
            {/* Change Password */}
            <div className="p-6 rounded-xl border bg-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Key className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Change Password</h3>
                  <p className="text-xs text-muted-foreground">
                    Update your account password
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className={labelClass}>Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </div>
              </div>
              <Button
                onClick={handlePasswordChange}
                disabled={changingPassword}
                className="mt-4"
              >
                {changingPassword ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Key className="h-4 w-4 mr-2" />
                )}
                Update Password
              </Button>
            </div>

            {/* Danger Zone */}
            <div className="p-6 rounded-xl border border-destructive/30 bg-destructive/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-destructive">Danger Zone</h3>
                  <p className="text-xs text-muted-foreground">
                    Irreversible actions for your account
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Once you delete your account, there is no going back. All your
                data, courses, and progress will be permanently removed.
              </p>
              <Button
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your data, courses, and progress
              will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}