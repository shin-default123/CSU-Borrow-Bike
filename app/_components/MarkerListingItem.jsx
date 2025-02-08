import { Button } from "@/components/ui/button";
import { Bolt, MapPin, Package2, X } from "lucide-react";
import Image from "next/image";
import React from "react";
import Link from "next/link";


function MarkerListingItem({ item,closeHandler }) {
  return (
    <div>
      <div
        className="bg-white rounded-lg w-[180px]"
      ><X onClick={()=>closeHandler()}/>
        <Image
          src={item.addBikeImages[0].url}
          width={800}
          height={150}
          className="rounded-lg w-[180px] object-cover h-[120px]"
        />
        <div className="flex mt-2 flex-col gap-2 p-2">
          <h2 className="font-bold text-xl">{item.gears}</h2>
          <h2 className="flex gap-2 text-sm text-gray-400">
            <MapPin className="h-4 w-4" />
            {item?.rackLocation}
          </h2>
        </div>
        <Link href={item.active ? `/payment/${item.id}` : "#"}>
                    <Button size="sm" className="w-full" disabled={!item.active} >
                      Rent
                    </Button>
                  </Link>
      </div>
    </div>
  );
}

export default MarkerListingItem;
