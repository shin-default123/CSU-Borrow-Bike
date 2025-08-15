import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bike, Bolt, Package2 } from "lucide-react";

function FilterSection({setVehicleType}) {
  return (
    <div className="px-3 py-4 grid grid-cols-2 md:flex gap-2">
      <Select onValueChange={(value)=>value=='All'?setVehicleType(null): setVehicleType(value)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Vehicle Type" />
        </SelectTrigger>
        <SelectContent>
        <SelectItem value="All">
            <h2 className="flex gap-2">All</h2>
            </SelectItem>
          <SelectItem value="Road bike">
            <h2 className="flex gap-2"><Bike className="h-5 w-5 text-primary"/>Road bike</h2>
            </SelectItem>
            <SelectItem value="Mountain bike">
            <h2 className="flex gap-2"><Bike className="h-5 w-5 text-primary"/>Mountain bike</h2>
            </SelectItem>
            <SelectItem value="City Bike">
            <h2 className="flex gap-2"><Bike className="h-5 w-5 text-primary"/>City Bike</h2>
            </SelectItem>
            <SelectItem value="Electric bike">
            <h2 className="flex gap-2"><Bike className="h-5 w-5 text-primary"/>Electric bike</h2>
            </SelectItem>
            <SelectItem value="Scooter">
            <h2 className="flex gap-2"><Bike className="h-5 w-5 text-primary"/>Scooter</h2>
            </SelectItem>

        </SelectContent>
      </Select>
    </div>
  );
}

export default FilterSection;
