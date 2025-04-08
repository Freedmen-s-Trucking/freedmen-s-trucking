import { AUTHENTICATE_DOT_COM_TOKEN, isDevMode } from "./envs";
import {
  BsCarFrontFill,
  BsShieldFillCheck,
  BsShieldFillExclamation,
  BsShieldFillX,
  BsTrainFreightFront,
} from "react-icons/bs";
import { TbCarSuv } from "react-icons/tb";
import { PiTruck, PiVan } from "react-icons/pi";
import { VehicleType } from "../../../common/types/src";
import { up } from "up-fetch";

export const SERVER_API = isDevMode
  ? "http://127.0.0.1:5001/freedman-trucking-dev/us-central1/httpServer/api"
  : "/api";

export const PAGE_ROUTES = [
  { name: "Home", href: "/preview" },
  { name: "About", href: "/preview/about" },
  { name: "Services", href: "/preview/services" },
  { name: "Contact", href: "/preview/contact" },
  { name: "Tracking", href: "/preview/tracking" },
] as const;

export const SPECIALTIES_DATA = [
  {
    sku: "box-truck",
    title: "Box Truck",
    description: 'Any type of 26\'L+ * 96"W * 96"H (10K lbs+) trucks with LG',
    iconPath: "/icons/truck-1.webp",
    details:
      "Box truck is one of the most popular types of equipment in the trucking business. However, it's a time-devouring process to find a proper load that can bring you a desirable income. Having both knowledge and experience in the box-truck field, Resolute team can make your business journey easier and more profitable.",
    actionLabel: "Start Trucking Dispatch",
    serviceImage: "/images/our-services-may-trucks.webp",
    serviceImageBlur: "/images/our-services-may-trucks-blur.webp",
  },
  {
    sku: "dry-van",
    title: "Dry Van",
    description: "Any type of 48'-53' trucks",
    iconPath: "/icons/truck-2.webp",
    details:
      "Dry van trailers are the most common type of freight transportation. Our team specializes in finding the best dry van loads that match your routes and preferences, ensuring consistent and reliable income for your business.",
    actionLabel: "Start Dry Van Dispatch",
    serviceImage: "/images/our-services-may-trucks.webp",
    serviceImageBlur: "/images/our-services-may-trucks-blur.webp",
  },
  {
    sku: "reefer",
    title: "Reefer",
    description: "Any type of trailer",
    iconPath: "/icons/truck-3.webp",
    details:
      "Refrigerated transportation requires special attention and expertise. We understand the complexities of temperature-controlled freight and help you maximize your earning potential while maintaining compliance with food safety regulations.",
    actionLabel: "Start Reefer Dispatch",
    serviceImage: "/images/our-services-may-trucks.webp",
    serviceImageBlur: "/images/our-services-may-trucks-blur.webp",
  },
  {
    sku: "power-only",
    title: "Power Only",
    description: "Both Day Cabs and OTR units",
    iconPath: "/icons/truck-4.webp",
    details:
      "Power only operations offer flexibility and efficiency. Our team connects you with reliable trailer pools and helps you optimize your routes to minimize empty miles and maximize profitability.",
    actionLabel: "Start Power Only Dispatch",
    serviceImage: "/images/our-services-may-trucks.webp",
    serviceImageBlur: "/images/our-services-may-trucks-blur.webp",
  },
  {
    sku: "hotshot",
    title: "Hotshot",
    description: "Any type of 40'L+ (15K lbs+) trucks",
    iconPath: "/icons/truck-5.webp",
    details:
      "Hotshot trucking requires quick response and efficient coordination. We specialize in finding time-sensitive and high-paying loads that match your equipment capabilities and preferred operating areas.",
    actionLabel: "Start Hotshot Dispatch",
    serviceImage: "/images/our-services-may-trucks.webp",
    serviceImageBlur: "/images/our-services-may-trucks-blur.webp",
  },
  {
    sku: "flatbed",
    title: "Flat Bed / Step Deck",
    description: "Any type of 48'-53' (45K lbs+) trucks",
    iconPath: "/icons/truck-6.webp",
    details:
      "Flatbed transportation comes with unique challenges and opportunities. Our experienced team helps you navigate the complexities of securing loads, route planning, and ensuring compliance with safety regulations.",
    actionLabel: "Start Flatbed Dispatch",
    serviceImage: "/images/our-services-may-trucks.webp",
    serviceImageBlur: "/images/our-services-may-trucks-blur.webp",
  },
] as const;

/**
 * The set of keys used in Remote Config
 */
export enum RemoteConfigKeys {
  can_show_preview_landing_page = "can_show_preview_landing_page",
  test_number_key = "test_number_key",
  test_string_key = "test_string_key",
}

export const DEFAULT_REMOTE_CONFIG_MAP = {
  [RemoteConfigKeys.can_show_preview_landing_page]: false,
  [RemoteConfigKeys.test_number_key]: 1,
  [RemoteConfigKeys.test_string_key]: "test",
};

export const tabTheme = {
  tablist: {
    // className="focus:[&>button]: focus:[&>button]:ring-secondary-800"
    tabitem: {
      variant: {
        underline: {
          base: "rounded-t-lg focus:outline-transparent focus:ring-transparent",
          active: {
            on: "active rounded-t-lg border-b-2 border-primary-700 text-primary-700",
            off: "border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-600",
          },
        },
      },
    },
  },
};

export const driverVerificationBadges = {
  verified: {
    color: "success",
    icon: BsShieldFillCheck,
    label: "Verified",
  },
  failed: {
    color: "failure",
    icon: BsShieldFillX,
    label: "Verification Failed",
  },
  pending: {
    color: "warning",
    icon: BsShieldFillExclamation,
    label: "Verification Pending",
  },
};

export const vehicleTypes: Record<
  VehicleType,
  { title: string; Icon: React.ComponentType }
> = {
  SEDAN: { title: "Sedan", Icon: BsCarFrontFill },
  SUV: { title: "SUV", Icon: TbCarSuv },
  VAN: { title: "Van", Icon: PiVan },
  TRUCK: { title: "Truck", Icon: PiTruck },
  FREIGHT: { title: "Freight", Icon: BsTrainFreightFront },
};

export const isAuthenticateMockApi = isDevMode;
export const authenticateApiRequest = up(fetch, () => ({
  baseUrl: `https://api-v3.authenticating.com${isAuthenticateMockApi ? "/mock" : ""}`,
  headers: {
    accept: "application/json",
    "content-type": "application/json",
    ...(isDevMode
      ? {}
      : { authorization: `Bearer ${AUTHENTICATE_DOT_COM_TOKEN}` }),
  },
}));
