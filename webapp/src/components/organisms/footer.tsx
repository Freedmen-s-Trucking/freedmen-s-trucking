import { useRouterState } from "@tanstack/react-router";
import { AppImage } from "~/components/atoms";
import logotiny from "~/assets/images/logo-blur.webp";
import logo from "~/assets/images/logo.webp";
import home3Logo from "~/assets/images/home-3.webp";
import home3LogoBlured from "~/assets/images/home-3-blur.webp";
import { PAGE_ROUTES } from "~/utils/constants";
import { Link } from "@tanstack/react-router";
import { AppImageBackground } from "~/components/atoms";
import { twMerge } from "tailwind-merge";

const ImportantLinksAndSubscription: React.FC = () => {
  const onEmailChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };
  const CONTACTS = [
    {
      label: "(480) 555-9999",
      href: "tel://(480)555-9999",
      Icon: () => (
        <AppImage className="inline" src="/icons/tel.webp" alt="[Tel]" />
      ),
    },
    {
      label: "www.logo@gmail.com",
      href: "mailto://www.logo@gmail.com",
      Icon: () => (
        <AppImage className="inline" src="/icons/mail.webp" alt="[Mail]" />
      ),
    },
    {
      label: "1901 Thornridge Cir. Shiloh, Hawaii 81063",
      href: "https://maps.app.goo.gl/i8o2hSnC7BwDsB1w5",
      Icon: () => (
        <AppImage
          className="inline"
          src="/icons/address.webp"
          alt="[Address]"
        />
      ),
    },
  ];
  const SOCIAL_LINKS = [
    {
      href: "https://www.facebook.com/",
      Icon: ({ className }: { className: string }) => (
        <AppImage
          className={className}
          src="/icons/facebook.webp"
          alt="[Facebook]"
        />
      ),
    },
    {
      href: "https://www.instagram.com/",
      Icon: ({ className }: { className: string }) => (
        <AppImage
          className={className}
          src="/icons/instagram.webp"
          alt="[Instagram]"
        />
      ),
    },
    {
      href: "https://www.linkedin.com/",
      Icon: ({ className }: { className: string }) => (
        <AppImage
          className={className}
          src="/icons/linkedin.webp"
          alt="[LinkedIn]"
        />
      ),
    },
    {
      href: "https://www.x.com/",
      Icon: ({ className }: { className: string }) => (
        <AppImage
          className={className}
          src="/icons/twitter-x.webp"
          alt="[Twitter-X]"
        />
      ),
    },
    {
      href: "https://www.pinterest.com/",
      Icon: ({ className }: { className: string }) => (
        <AppImage
          className={className}
          src="/icons/pinterest.webp"
          alt="[Pinterest]"
        />
      ),
    },
  ];
  const router = useRouterState();
  return (
    <div className="w-100 inset-0 mx-auto max-w-screen-xl">
      <div className="columns-1 gap-8 px-4 py-8 sm:px-12 md:columns-2 lg:gap-16">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <AppImage
            placeholder={logotiny}
            src={logo}
            alt="logo"
            className="h-auto w-[60px] rounded-full sm:w-[90px]"
          />
          <p className="mx-auto max-w-md text-center text-xs text-white md:max-w-none md:text-start">
            long established fact that a reader will be distracted by the
            readable content by the readable content established fact that long
            established fact that a reader
          </p>
          <div className="relative mb-3">
            <input
              onChange={onEmailChanged}
              type="email"
              autoComplete="email"
              required
              id="subscription-email"
              className="block w-full border-0 border-b border-gray-300 bg-transparent px-0 pe-10 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-transparent"
              placeholder="my-email-name@domain.xxx"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center ps-3.5">
              <svg
                className="h-4 w-4 text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 16"
              >
                <path d="m10.036 8.278 9.258-7.79A1.979 1.979 0 0 0 18 0H2A1.987 1.987 0 0 0 .641.541l9.395 7.737Z" />
                <path d="M11.241 9.817c-.36.275-.801.425-1.255.427-.428 0-.845-.138-1.187-.395L0 2.6V14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2.5l-8.759 7.317Z" />
              </svg>
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg bg-gradient-to-r from-red-400 via-red-500 to-orange-600 px-5 py-1.5 text-center text-sm font-medium text-white hover:bg-gradient-to-bl focus:outline-none"
          >
            Subscribe
          </button>
        </div>
        <div className="mx-auto mt-8 flex w-full max-w-md flex-row gap-4 overflow-hidden">
          <div className="flex-1">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Important Links
            </h3>
            <ul className="text-sm">
              {PAGE_ROUTES.map((item, index) => (
                <Link
                  key={index}
                  to={item.href}
                  className={twMerge(
                    "bg-transparent py-2.5",
                    router.location.pathname === item.href
                      ? "pointer-events-none block rounded-sm text-red-400"
                      : "block rounded-sm text-white hover:text-red-400",
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </ul>
          </div>
          <div className="flex-1 gap-2">
            <h3 className="mb-4 text-end text-lg font-semibold text-white md:text-start">
              Quick Contacts
            </h3>
            <ul className="text-sm text-white">
              {CONTACTS.map((item, index) => (
                <Link
                  target="_blank"
                  key={index}
                  to={item.href}
                  className="block rounded-sm bg-transparent py-3 text-end text-white hover:text-red-400 md:text-start"
                >
                  <item.Icon /> {item.label}
                </Link>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <hr className="mx-12" />
      <div className="flex flex-col items-center gap-5 px-11 sm:flex-row sm:justify-between">
        <div className="flex flex-row">
          {SOCIAL_LINKS.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              target="_blank"
              className="m-1 rounded-full p-1 text-black hover:bg-red-400"
            >
              <item.Icon className="" />
            </Link>
          ))}
        </div>
        <span className="text-sm text-white">
          Copyright © logo 2024. All Right Reserved.
        </span>
      </div>
    </div>
  );
};

const AppFooter: React.FC = () => {
  return (
    <AppImageBackground
      src={home3Logo}
      placeholder={home3LogoBlured}
      customGradient="linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7))"
      className="px-4 py-8 md:px-8 md:py-16"
    >
      <ImportantLinksAndSubscription />
    </AppImageBackground>
  );
};

export default AppFooter;
