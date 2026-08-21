import { useNavigate } from "react-router-dom";
import { ChevronDown, CircleHelp, LogOut, Settings, UserCircle } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/auth-context";
import { UserAvatar } from "@/shared/components/user-avatar";
import { useOnboardingStore } from "@/features/onboarding/onboarding.store";

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const startTour = useOnboardingStore((state) => state.startTour);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out", { description: "You have been logged out." });
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2 rounded-md p-1 pr-2 outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
        data-onboarding="user-menu"
      >
        <UserAvatar name={user.full_name} src={user.avatar} className="h-8 w-8" />
        <div className="hidden text-left leading-tight md:block">
          <p className="text-sm font-medium text-foreground">
            {user.full_name}
          </p>
          <p className="text-xs text-muted-foreground">{user.role}</p>
        </div>
        <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-0.5">
            <p className="text-sm font-semibold text-foreground">
              {user.full_name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate(ROUTES.PROFILE)}>
          <UserCircle className="h-4 w-4" /> My Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(ROUTES.SETTINGS)}>
          <Settings className="h-4 w-4" /> Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={startTour}>
          <CircleHelp className="h-4 w-4" /> Replay product tour
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:text-destructive [&_svg]:text-destructive"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
