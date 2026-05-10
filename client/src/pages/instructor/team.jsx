import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/auth-context";
import {
  Loader2,
  Users,
  UserPlus,
  Mail,
  Shield,
  MoreHorizontal,
  Trash2,
  UserCheck,
  UserX,
  Clock,
  Search,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import InstructorSidebar from "@/components/instructor-sidebar";
import Navbar from "@/components/navbar";
import api from "@/lib/api";

const ROLES = [
  { value: "co-instructor", label: "Co-Instructor", color: "bg-blue-100 text-blue-700" },
  { value: "assistant", label: "Assistant", color: "bg-green-100 text-green-700" },
  { value: "editor", label: "Editor", color: "bg-purple-100 text-purple-700" },
];

export default function InstructorTeam() {
  const { user, isAuthenticated, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("co-instructor");
  const [inviting, setInviting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (
      !isLoading &&
      (!isAuthenticated || (user?.role !== "instructor" && user?.role !== "admin"))
    ) {
      navigate("/dashboard");
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  const fetchMembers = async () => {
    try {
      const res = await api.get("/team");
      setMembers(res.data.data || []);
    } catch {
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMembers();
    }
  }, [isAuthenticated]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    setInviting(true);
    try {
      const res = await api.post("/team/invite", {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      setMembers((prev) => [...prev, res.data.data]);
      setInviteEmail("");
      setInviteRole("co-instructor");
      setInviteOpen(false);
      toast.success(res.data.message || "Team member invited");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to invite member");
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      const res = await api.put(`/team/${memberId}/role`, { role: newRole });
      setMembers((prev) =>
        prev.map((m) =>
          m._id === memberId ? { ...m, role: res.data.data.role } : m
        )
      );
      toast.success("Role updated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update role");
    }
  };

  const handleRemove = async (memberId, memberName) => {
    if (!window.confirm(`Remove ${memberName} from your team?`)) return;
    try {
      await api.delete(`/team/${memberId}`);
      setMembers((prev) => prev.filter((m) => m._id !== memberId));
      toast.success(`${memberName} removed from team`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove member");
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

  const getRoleBadge = (role) => {
    const found = ROLES.find((r) => r.value === role);
    return found || ROLES[0];
  };

  const filteredMembers = members.filter((m) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q)
    );
  });

  const inputClass =
    "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated || (user?.role !== "instructor" && user?.role !== "admin"))
    return null;

  return (
    <div className="flex min-h-screen bg-background">
      <InstructorSidebar />

      <div className="flex-1 flex flex-col">
        <Navbar
          title={`Team (${members.length})`}
          rightContent={
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Add a co-instructor, assistant, or editor to help manage your
                    courses.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium leading-none mb-2 block">
                      Email Address
                    </label>
                    <input
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@example.com"
                      className={inputClass}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleInvite();
                        }
                      }}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium leading-none mb-2 block">
                      Role
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className={inputClass}
                    >
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <DialogClose asChild>
                      <Button variant="outline" type="button">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button onClick={handleInvite} disabled={inviting}>
                      {inviting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <UserPlus className="h-4 w-4 mr-2" />
                      )}
                      Send Invite
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          }
        />

        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Search */}
              {members.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search team members..."
                    className={inputClass + " pl-10"}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}

              {/* Members List */}
              {members.length === 0 ? (
                <div className="border-2 border-dashed rounded-xl p-16 text-center">
                  <Users className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
                  <h2 className="text-xl font-bold mb-2">No team members</h2>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    Invite co-instructors, assistants, or editors to help manage
                    your courses together.
                  </p>
                  <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                    <DialogTrigger asChild>
                      <Button size="lg">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite Member
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="border-2 border-dashed rounded-xl p-16 text-center">
                  <Search className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
                  <h2 className="text-xl font-bold mb-2">No results</h2>
                  <p className="text-muted-foreground">
                    No team members match "{searchQuery}"
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMembers.map((member) => {
                    const roleBadge = getRoleBadge(member.role);
                    return (
                      <div
                        key={member._id}
                        className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow"
                      >
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">
                              {member.name}
                            </p>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleBadge.color}`}
                            >
                              {roleBadge.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{member.email}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Clock className="h-3 w-3" />
                            <span>
                              Joined{" "}
                              {new Date(member.invitedAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Shield className="h-4 w-4 mr-1" />
                                Role
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {ROLES.map((r) => (
                                <DropdownMenuItem
                                  key={r.value}
                                  onClick={() =>
                                    handleRoleChange(member._id, r.value)
                                  }
                                  className={
                                    member.role === r.value
                                      ? "bg-muted font-medium"
                                      : ""
                                  }
                                >
                                  <Shield className="h-4 w-4 mr-2" />
                                  {r.label}
                                  {member.role === r.value && (
                                    <span className="ml-auto text-xs text-muted-foreground">
                                      Current
                                    </span>
                                  )}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleRemove(member._id, member.name)
                            }
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Team Stats */}
              {members.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                  <div className="p-4 rounded-xl border bg-card">
                    <p className="text-sm text-muted-foreground mb-1">
                      Total Members
                    </p>
                    <p className="text-2xl font-bold">{members.length}</p>
                  </div>
                  <div className="p-4 rounded-xl border bg-card">
                    <p className="text-sm text-muted-foreground mb-1">
                      Co-Instructors
                    </p>
                    <p className="text-2xl font-bold">
                      {members.filter((m) => m.role === "co-instructor").length}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border bg-card">
                    <p className="text-sm text-muted-foreground mb-1">
                      Assistants/Editors
                    </p>
                    <p className="text-2xl font-bold">
                      {members.filter((m) => m.role !== "co-instructor").length}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}