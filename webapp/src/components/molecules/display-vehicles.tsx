import { RequiredVehicleEntity } from "@freedmen-s-trucking/types";
import { IoCarOutline } from "react-icons/io5";
import { TbCarSuv } from "react-icons/tb";
import { PiVanBold } from "react-icons/pi";
import { GiTruck } from "react-icons/gi";
import { BsTrainFreightFront } from "react-icons/bs";

export const DisplayRequiredVehicles: React.FC<{
  vehicles: RequiredVehicleEntity[] | undefined;
}> = ({ vehicles }) => {
  const vehicleIcons: Record<RequiredVehicleEntity["type"], React.ReactNode> = {
    SEDAN: <IoCarOutline size={24} className="inline" />,
    SUV: <TbCarSuv size={24} className="inline" />,
    VAN: <PiVanBold size={24} className="inline" />,
    TRUCK: <GiTruck size={24} className="inline" />,
    FREIGHT: <BsTrainFreightFront size={24} className="inline" />,
  };
  return (
    <div className="flex items-center gap-2">
      {(vehicles || []).map(
        (vehicle) =>
          vehicle && (
            <span key={vehicle.type} className="flex items-center">
              {vehicle.quantity > 1 && (
                <span className="text-sm">{vehicle.quantity}&nbsp;*&nbsp;</span>
              )}
              {vehicleIcons[vehicle.type]}-
              {vehicle.quantity <= 1 && (
                <span className="text-sm">{vehicle.type}</span>
              )}
            </span>
          ),
      )}
    </div>
  );
};
