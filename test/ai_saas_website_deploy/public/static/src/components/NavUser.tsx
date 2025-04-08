import { useAuth } from "@/hooks/useAuth";
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebar } from "@/components/SidebarContext";

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={cn("group/menu-item relative", className)}
    {...props}
  />
));
SidebarMenuItem.displayName = "SidebarMenuItem";

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean;
    isActive?: boolean;
    tooltip?: string | React.ComponentProps<typeof TooltipContent>;
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(
  (
    {
      asChild = false,
      isActive = false,
      variant = "default",
      size = "default",
      tooltip,
      className,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    const button = (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
        {...props}
      />
    );

    if (!tooltip) {
      return button;
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent {...(typeof tooltip === "string" ? { children: tooltip } : tooltip)} />
        </Tooltip>
      </TooltipProvider>
    );
  }
);
SidebarMenuButton.displayName = "SidebarMenuButton";

interface NavUserProps {
  onOpenChange?: (open: boolean) => void;
}

export function NavUser({ onOpenChange }: NavUserProps = {}) {
  // Get the user from useAuth
  const { user } = useAuth();
  const { isMobile } = useSidebar();
  const [open, setOpen] = React.useState(false);
  
  if (!user) return null;
  
  // Create a user object with the expected properties
  const userInfo = {
    name: user.name || "User",
    email: user.email || "",
    avatar: ""  // We'll use the avatar fallback with initials
  };

  // Handle dropdown state changes
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    // Call the parent's onOpenChange callback
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
  };

  return <NavUserContent user={userInfo} open={open} onOpenChange={handleOpenChange} isMobileOverride={isMobile} />;
}

// Create a separate component for the content
function NavUserContent({
  user,
  open,
  onOpenChange,
  isMobileOverride,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isMobileOverride?: boolean;
}) {
  const { isMobile: sidebarIsMobile } = useSidebar();
  const isMobile = isMobileOverride !== undefined ? isMobileOverride : sidebarIsMobile;
  const { logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    window.location.href = '/auth';
  };
  
  // Handle dropdown state
  const handleDropdownClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Stop the click event from propagating to parent elements
    e.stopPropagation();

    // Prevent default behavior to ensure sidebar stays open
    e.preventDefault();
  };

  return (
    <DropdownMenu 
      open={open}
      modal={isMobile ? false : true}
      onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:text-white group flex items-center w-full rounded-xl hover:scale-[1.02] hover:bg-[#0077b6]/30 active:scale-[0.98] transition-all duration-200"
          onClick={handleDropdownClick}
        >
          <Avatar className={`${isMobile ? 'h-10 w-10' : 'h-8 w-8'} rounded-lg ring-1 ring-[#0077b6]/40 overflow-hidden`}>
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-lg bg-gradient-to-r from-[#0077b6] to-[#00b4d8]">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight ml-3">
            <span className="truncate font-semibold text-white">{user.name}</span>
            <span className="truncate text-xs text-[#90e0ef]">{user.email}</span>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 text-[#90e0ef] transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-[#051e2f]/90 backdrop-blur-xl border border-[#0077b6]/40 shadow-lg shadow-[#0077b6]/20 animate-in fade-in-0 zoom-in-95 duration-200"
        side={isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={isMobile ? 8 : 4}
        alignOffset={isMobile ? 0 : -4}
        // This allows closable by clickaway on desktop, but not on mobile
        onInteractOutside={(e) => {
          if (isMobile) {
            // Prevent closing on outside click for mobile to keep sidebar open
            e.preventDefault();
          }
        }}
        // Prevent propagation to sidebar
        onClick={(e: React.MouseEvent) => {
          if (isMobile) {
            e.stopPropagation();
          }
        }}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg ring-1 ring-[#0077b6]/40">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-lg bg-[#0077b6]">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold text-white">{user.name}</span>
              <span className="truncate text-xs text-[#90e0ef]">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#0077b6]/40" />
        <DropdownMenuGroup>
          <DropdownMenuItem className="gap-2 px-2 py-1.5 text-sm hover:bg-[#0c4c74]/50 transition-colors focus:bg-[#0c4c74]/50">
            <Sparkles className="h-4 w-4 text-[#00b4d8]" />
            <span className="text-white">Ocean Premium</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-[#0077b6]/40" />
        <DropdownMenuGroup>
          <DropdownMenuItem 
            onClick={() => window.location.href = '/profile'}
            className="gap-2 px-2 py-1.5 text-sm hover:bg-[#0c4c74]/50 transition-colors focus:bg-[#0c4c74]/50"
          >
            <BadgeCheck className="h-4 w-4 text-[#90e0ef]" />
            <span className="text-white">My Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 px-2 py-1.5 text-sm hover:bg-[#0c4c74]/50 transition-colors focus:bg-[#0c4c74]/50">
            <CreditCard className="h-4 w-4 text-[#90e0ef]" />
            <span className="text-white">Billing</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 px-2 py-1.5 text-sm hover:bg-[#0c4c74]/50 transition-colors focus:bg-[#0c4c74]/50">
            <Bell className="h-4 w-4 text-[#90e0ef]" />
            <span className="text-white">Notifications</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-[#0077b6]/40" />
        <DropdownMenuItem 
          onSelect={handleLogout}
          className="gap-2 px-2 py-1.5 text-sm hover:bg-red-500/20 hover:text-red-400 transition-colors focus:bg-red-500/20 focus:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
