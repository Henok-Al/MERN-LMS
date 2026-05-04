import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  GraduationCap,
  Loader2,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "@/context/auth-context";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
});

const signUpSchema = z
  .object({
    userName: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must not exceed 20 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    userEmail: z.string().min(1, "Email is required").email("Please enter a valid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password must not exceed 100 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    role: z.enum(["student", "instructor"], { required_error: "Please select a role" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const signInForm = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: { userName: "", userEmail: "", password: "", confirmPassword: "", role: "student" },
  });

  const onSignIn = async (data) => {
    setServerError("");
    try {
      const result = await login(data.email, data.password);
      if (result.success) {
        navigate("/dashboard");
      } else {
        setServerError(result.message || "Invalid credentials");
      }
    } catch (error) {
      setServerError(error.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  const onSignUp = async (data) => {
    setServerError("");
    try {
      const result = await register({
        userName: data.userName,
        userEmail: data.userEmail,
        password: data.password,
        role: data.role,
      });
      if (result.success) {
        setActiveTab("signin");
        signUpForm.reset();
      } else {
        setServerError(result.message || "Registration failed");
      }
    } catch (error) {
      setServerError(error.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    setServerError("");
    signInForm.clearErrors();
    signUpForm.clearErrors();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-background/80 backdrop-blur-sm">
        <Link to={"/"} className="flex items-center justify-center">
          <GraduationCap className="h-8 w-8 mr-3 text-primary" />
          <span className="font-extrabold text-xl tracking-tight">LMS</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Welcome</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Sign in to your account or create a new one
            </p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                {serverError && (
                  <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {serverError}
                  </div>
                )}

                <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        {...signInForm.register("email")}
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10"
                      />
                    </div>
                    {signInForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{signInForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        {...signInForm.register("password")}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {signInForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{signInForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={signInForm.formState.isSubmitting}>
                    {signInForm.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <span>Sign In</span>
                    )}
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="signup">
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                {serverError && (
                  <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {serverError}
                  </div>
                )}

                <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="userName">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="userName"
                        {...signUpForm.register("userName")}
                        type="text"
                        placeholder="johndoe"
                        className="pl-10"
                      />
                    </div>
                    {signUpForm.formState.errors.userName && (
                      <p className="text-sm text-destructive">{signUpForm.formState.errors.userName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userEmail">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="userEmail"
                        {...signUpForm.register("userEmail")}
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10"
                      />
                    </div>
                    {signUpForm.formState.errors.userEmail && (
                      <p className="text-sm text-destructive">{signUpForm.formState.errors.userEmail.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        {...signUpForm.register("password")}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {signUpForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{signUpForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        {...signUpForm.register("confirmPassword")}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {signUpForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive">{signUpForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>I want to</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => signUpForm.setValue("role", "student")}
                        className={`flex items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-all ${
                          signUpForm.watch("role") === "student"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-input hover:border-muted-foreground/50"
                        }`}
                      >
                        <UserRound className="h-4 w-4" />
                        Learn
                      </button>
                      <button
                        type="button"
                        onClick={() => signUpForm.setValue("role", "instructor")}
                        className={`flex items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-all ${
                          signUpForm.watch("role") === "instructor"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-input hover:border-muted-foreground/50"
                        }`}
                      >
                        <GraduationCap className="h-4 w-4" />
                        Teach
                      </button>
                    </div>
                    {signUpForm.formState.errors.role && (
                      <p className="text-sm text-destructive">{signUpForm.formState.errors.role.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={signUpForm.formState.isSubmitting}>
                    {signUpForm.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Creating account...</span>
                      </>
                    ) : (
                      <span>Create Account</span>
                    )}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}