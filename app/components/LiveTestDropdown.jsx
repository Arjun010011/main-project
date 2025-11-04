import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Loader } from "lucide-react";

const LiveTestDropdown = ({
  onDelete,
  onGoLive,
  onEndTest,
  onSchedule,
  isLoading = false,
  isLive = false,
}) => {
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger disabled={isLoading}>
          {isLoading ? (
            <Loader
              className="animate-spin text-gray-600 dark:text-gray-400"
              size={16}
            />
          ) : (
            <MoreVertical className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200" />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {isLive ? (
            <DropdownMenuItem
              onClick={onEndTest}
              disabled={isLoading}
              className="bg-orange-50 dark:bg-orange-400 dark:text-white text-orange-600 "
            >
              End Test
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={onGoLive} disabled={isLoading}>
              Go Live
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={onSchedule} disabled={isLoading}>
            Schedule
          </DropdownMenuItem>
          <DropdownMenuItem
            className="bg-red-50 dark:bg-red-400 dark:text-white text-red-600 "
            onClick={onDelete}
            disabled={isLoading}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default LiveTestDropdown;
