import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
const DropDownTeacherMenu = ({ onDelete, onPreview, onMoveToLiveTest }) => {
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <MoreVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onPreview}>Preview</DropdownMenuItem>
          <DropdownMenuItem className="bg-red-50" onClick={onDelete}>
            Delete
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onMoveToLiveTest}>
            Move to live test
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default DropDownTeacherMenu;
