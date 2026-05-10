import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/auth-context";
import {
  GraduationCap,
  LogOut,
  User,
  Loader2,
  PlusCircle,
  FileText,
  Trash2,
  ArrowLeft,
  Menu,
  X,
  LayoutDashboard,
  Home,
  Mail,
  Shield,
  ShieldCheck,
  Search,
  Filter,
  Edit,
  Key,
  Activity,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/navbar";
import api from "@/lib/api";
import { toast } from "sonner";

function AdminSidebar({ pathname }) {
  return (
    <div className="w-64 border-r bg-sidebar flex-col shrink-0 hidden lg:flex">
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-sidebar-primary" />
          <span className="font-bold text-sidebar-foreground">Skillio Admin</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        <Link
          to="/admin"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            pathname === "/admin"
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
        <Link
          to="/admin/courses"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            pathname.startsWith("/admin/courses") && pathname !== "/admin/users"
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          }`}
        >
          <FileText className="h-4 w-4" />
          Courses
        </Link>
        <Link
          to="/admin/users"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            pathname === "/admin/users"
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          Users
        </Link>
        <Link
          to="/admin/courses/create"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          Create Course
        </Link>
        <div className="pt-4 pb-2">
          <p className="text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider px-3">
            Navigation
          </p>
        </div>
        <Link
          to="/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <Home className="h-4 w-4" />
          Student Dashboard
        </Link>
      </nav>
    </div>
  );
}

export default function AdminUsersPage() {
  const { user: currentUser, isAuthenticated, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [activityLogs, setActivityLogs] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // Form state
  const [newUser, setNewUser] = useState({
    userName: "",
    userEmail: "",
    password: "",
    role: "student",
  });
  const [editUser, setEditUser] = useState({
    userName: "",
    userEmail: "",
    role: "student",
  });
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || currentUser?.role !== "admin")) {
      navigate("/dashboard");
    }
  }, [isLoading, isAuthenticated, currentUser, navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users");
        setUsers(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated && currentUser?.role === "admin") {
      fetchUsers();
    }
  }, [isAuthenticated, currentUser]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post("/users", newUser);
      if (res.data.success) {
        setUsers((prev) => [...prev, res.data.data]);
        toast.success("User created successfully");
        setCreateModalOpen(false);
        setNewUser({ userName: "", userEmail: "", password: "", role: "student" });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setUpdating(true);
    try {
      const res = await api.put(`/users/${selectedUser._id}`, editUser);
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === selectedUser._id ? { ...u, ...res.data.data } : u))
        );
        toast.success("User updated successfully");
        setEditModalOpen(false);
        setSelectedUser(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await api.delete(`/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
      toast.success("User role updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update role");
    }
  };

  const handleSuspend = async (userId) => {
    if (!window.confirm("Are you sure you want to suspend this user?")) return;
    try {
      await api.put(`/users/${userId}/suspend`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, status: "suspended" } : u))
      );
      toast.success("User suspended");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to suspend user");
    }
  };

  const handleActivate = async (userId) => {
    try {
      await api.put(`/users/${userId}/activate`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, status: "active" } : u))
      );
      toast.success("User activated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to activate user");
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setResetting(true);
    try {
      await api.post(`/users/${selectedUser?._id}/reset-password`, { newPassword });
      toast.success("Password reset successfully");
      setResetPasswordModalOpen(false);
      setNewPassword("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setResetting(false);
    }
  };

  const openActivityLogs = async (user) => {
    setSelectedUser(user);
    setActivityModalOpen(true);
    setLoadingActivity(true);
    try {
      const res = await api.get(`/users/${user._id}/activity`);
      setActivityLogs(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch activity logs:", error);
      toast.error("Failed to load activity logs");
    } finally {
      setLoadingActivity(false);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditUser({
      userName: user.userName,
      userEmail: user.userEmail,
      role: user.role,
    });
    setEditModalOpen(true);
  };

  const openResetPasswordModal = (user) => {
    setSelectedUser(user);
    setResetPasswordModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated || currentUser?.role !== "admin") return null;

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { color: "destructive", icon: ShieldCheck, label: "Admin" },
      instructor: { color: "primary", icon: Shield, label: "Instructor" },
      student: { color: "secondary", icon: User, label: "Student" },
    };
    const config = roleConfig[role] || roleConfig.student;
    const Icon = config.icon;
    return (
      <Badge variant={config.color} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: "default", icon: CheckCircle, label: "Active" },
      suspended: { color: "outline", icon: XCircle, label: "Suspended" },
      banned: { color: "destructive", icon: AlertTriangle, label: "Banned" },
    };
    const config = statusConfig[status] || statusConfig.active;
    const Icon = config.icon;
    return (
      <Badge variant={config.color} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar pathname="/admin/users" />

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar border-r p-4">
            <div className="flex items-center justify-between mb-4">
              <Link to="/" className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-sidebar-primary" />
                <span className="font-bold text-sidebar-foreground">Skillio Admin</span>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5 text-sidebar-foreground" />
              </button>
            </div>
            <AdminSidebar pathname="/admin/users" />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar
          showBack
          title="User Management"
          onMenuToggle={() => setMobileMenuOpen(true)}
          rightContent={
            <div className="hidden sm:flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-48"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
        />

        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Users</h2>
                <p className="text-muted-foreground">
                  Manage all users in the system ({filteredUsers.length} total)
                </p>
              </div>
              <Button onClick={() => setCreateModalOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <User className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                <h2 className="text-xl font-bold mb-2">No users found</h2>
                <p className="text-muted-foreground">
                  {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "No users have been created yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-semibold">User</th>
                        <th className="text-left p-4 font-semibold">Email</th>
                        <th className="text-left p-4 font-semibold">Role</th>
                        <th className="text-left p-4 font-semibold">Status</th>
                        <th className="text-left p-4 font-semibold">Courses</th>
                        <th className="text-left p-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u._id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium">{u.userName}</div>
                                <div className="text-sm text-muted-foreground">
                                  ID: {u._id?.slice(-6).toUpperCase()}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{u.userEmail}</span>
                            </div>
                          </td>
                          <td className="p-4">{getRoleBadge(u.role)}</td>
                          <td className="p-4">{getStatusBadge(u.status || "active")}</td>
                          <td className="p-4">
                            <Badge variant="outline">
                              {u.enrolledCourses || 0} enrolled
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              {u._id === currentUser?._id ? (
                                <Badge variant="outline" className="text-xs">
                                  Current user
                                </Badge>
                              ) : (
                                <>
                                  <Select
                                    value={u.role}
                                    onValueChange={(value) => handleRoleChange(u._id, value)}
                                  >
                                    <SelectTrigger className="w-[120px] h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="student">Student</SelectItem>
                                      <SelectItem value="instructor">Instructor</SelectItem>
                                      <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                  </Select>

                                  {u.status === "active" ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleSuspend(u._id)}
                                      title="Suspend user"
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleActivate(u._id)}
                                      title="Activate user"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                  )}

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openResetPasswordModal(u)}
                                    title="Reset password"
                                  >
                                    <Key className="h-4 w-4" />
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openActivityLogs(u)}
                                    title="View activity logs"
                                  >
                                    <Activity className="h-4 w-4" />
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditModal(u)}
                                    title="Edit user"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(u._id)}
                                    disabled={u.role === "admin" && users.filter((u) => u.role === "admin").length <= 1}
                                    title="Delete user"
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>Add a new user to the system</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Username *</Label>
                <Input
                  value={newUser.userName}
                  onChange={(e) => setNewUser({ ...newUser, userName: e.target.value })}
                  placeholder="Enter username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={newUser.userEmail}
                  onChange={(e) => setNewUser({ ...newUser, userEmail: e.target.value })}
                  placeholder="Enter email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Password *</Label>
                <Input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Enter password (min 6 chars)"
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label>Role *</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="instructor">Instructor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Create User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Username *</Label>
                <Input
                  value={editUser.userName}
                  onChange={(e) => setEditUser({ ...editUser, userName: e.target.value })}
                  placeholder="Enter username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={editUser.userEmail}
                  onChange={(e) => setEditUser({ ...editUser, userEmail: e.target.value })}
                  placeholder="Enter email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Role *</Label>
                <Select value={editUser.role} onValueChange={(value) => setEditUser({ ...editUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="instructor">Instructor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updating}>
                {updating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={resetPasswordModalOpen} onOpenChange={setResetPasswordModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedUser?.userName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Password *</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 chars)"
                minLength={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword} disabled={resetting}>
              {resetting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activity Logs Modal */}
      <Dialog open={activityModalOpen} onOpenChange={setActivityModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Activity Logs</DialogTitle>
            <DialogDescription>
              Recent activity for {selectedUser?.userName}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {loadingActivity ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : activityLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No activity logs found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activityLogs.map((log) => (
                  <div key={log._id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="outline">{log.action}</Badge>
                        <p className="text-sm mt-1">{log.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
