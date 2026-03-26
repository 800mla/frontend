import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { useTranslation } from "react-i18next";
import { useGlobalStore } from "@/stores/global";
import { Logout } from "@/utils/common";

export function UserNav() {
  const { t } = useTranslation("auth");
  const { user } = useGlobalStore();

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="size-10 rounded-2xl border border-[#e8d8c8] bg-white text-[#6f4e37] shadow-none hover:bg-[#f6ede3] hover:text-[#5f4330] dark:border-white/10 dark:bg-white/8 dark:text-[#e7c09a] dark:hover:bg-white/12"
            size="icon"
            variant="ghost"
          >
            <Avatar className="size-8">
              <AvatarImage alt={user?.avatar ?? ""} src={user?.avatar ?? ""} />
              <AvatarFallback className="rounded-xl bg-[#f4e7da] text-[#6f4e37] dark:bg-white/10 dark:text-[#e7c09a]">
                {user?.auth_methods?.[0]?.auth_identifier
                  .toUpperCase()
                  .charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 rounded-2xl border border-[#eadfd3] bg-white/95 shadow-[0_20px_44px_-30px_rgba(121,93,67,0.28)] dark:border-white/10 dark:bg-[#1d1714]/96"
          forceMount
        >
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="font-medium text-sm leading-none">
                {user?.auth_methods?.[0]?.auth_identifier}
              </p>
              {/* <p className='text-xs leading-none text-muted-foreground'>ID: {user?.id}</p> */}
            </div>
          </DropdownMenuLabel>
          {/* <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Billing
              <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Settings
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>New Team</DropdownMenuItem>
          </DropdownMenuGroup> */}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={Logout}>
            {t("logout", "Logout")}
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
}
