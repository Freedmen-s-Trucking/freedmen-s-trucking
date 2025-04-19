import React from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import homeHeroImg from "~/assets/images/hero.webp";
import homeHeroImgBlured from "~/assets/images/hero-blur.webp";
import home2LogoBlured from "~/assets/images/home-2-blur.webp";
import home2Logo from "~/assets/images/home-2.webp";
import { AppImage } from "~/components/atoms";
import AppFooter from "~/components/organisms/footer";
import FAQ from "~/components/molecules/faq";
import Testimonials from "~/components/molecules/testimonials";
import Hero from "~/components/molecules/hero";
import { SPECIALTIES_DATA } from "~/utils/constants";
import { AppImageBackground } from "~/components/atoms";

export const Route = createFileRoute("/preview/")({
  beforeLoad({ context }) {
    if (!context.remoteConfigs.canShowPreviewLandingPage) {
      throw redirect({
        to: "/",
      });
    }
  },
  component: Index,
});

const WhyUs: React.FC = () => {
  const WHY_US_TITLE = "Why Choose Us";

  const WHY_US_SECTIONS = [
    {
      title: "Fast Delivery",
      description: "Your packages delivered on time, every time.",
      Icon: ({ className }: { className: string }) => (
        <svg
          className={className}
          viewBox="0 0 66 42"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.36599 15.06H1.44496C0.883651 15.06 0.466151 14.854 0.192456 14.442C-0.0835589 14.032 -0.0626842 13.616 0.25508 13.194L7.41522 3.27602C7.61469 3.01602 7.88143 2.92602 8.21543 3.00602C8.54711 3.08602 8.71295 3.28802 8.71295 3.61202V9.75001H12.634C13.1953 9.75001 13.6128 9.95501 13.8865 10.365C14.1602 10.775 14.1393 11.191 13.8239 11.613L6.66372 21.474C6.46425 21.734 6.19751 21.834 5.86351 21.774C5.52951 21.714 5.36367 21.522 5.36599 21.198V15.06ZM16.5133 42C14.1034 42 12.0506 41.27 10.3551 39.81C8.66192 38.348 7.81532 36.578 7.81532 34.5C7.81532 33.48 8.09366 32.545 8.65033 31.695C9.20699 30.845 9.81817 30.021 10.4839 29.223L29.0626 3.00002H19.147C18.653 3.00002 18.2436 2.85702 17.9188 2.57102C17.5941 2.28302 17.4318 1.92602 17.4318 1.50002C17.4318 1.07402 17.5976 0.717021 17.9293 0.429021C18.261 0.141021 18.6738 -0.00197931 19.1679 2.06896e-05H48.9913C49.882 2.06896e-05 50.6092 0.308021 51.1728 0.92402C51.7341 1.54002 51.9138 2.22602 51.7121 2.98202L49.7185 10.5H54.1405C55.0196 10.5 55.8627 10.674 56.6699 11.022C57.4771 11.37 58.1335 11.842 58.6391 12.438L64.8912 19.632C65.3968 20.216 65.725 20.825 65.8758 21.459C66.0289 22.091 66.0405 22.755 65.9106 23.451L63.83 32.562C63.7001 33.146 63.3719 33.615 62.8454 33.969C62.3189 34.323 61.717 34.5 61.0397 34.5H59.3593C59.3593 36.578 58.5127 38.348 56.8195 39.81C55.1263 41.272 53.0736 42.002 50.6613 42C48.2491 41.998 46.1976 41.268 44.5067 39.81C42.8158 38.352 41.9692 36.582 41.9669 34.5H25.2077C25.2077 36.578 24.36 38.348 22.6644 39.81C20.9689 41.272 18.9162 42.002 16.5063 42M16.6698 39C18.1009 39 19.3291 38.559 20.3543 37.677C21.3795 36.793 21.8921 35.734 21.8921 34.5C21.8921 33.266 21.3806 32.207 20.3577 31.323C19.3349 30.439 18.1067 29.998 16.6733 30C15.2399 30.002 14.0117 30.443 12.9889 31.323C11.966 32.207 11.4545 33.266 11.4545 34.5C11.4545 35.734 11.966 36.793 12.9889 37.677C14.0141 38.559 15.2387 39 16.6698 39ZM50.6648 39C52.0959 39 53.3229 38.559 54.3458 37.677C55.3687 36.793 55.8801 35.734 55.8801 34.5C55.8801 33.266 55.3687 32.207 54.3458 31.323C53.3229 30.439 52.0948 29.998 50.6613 30C49.2279 30.002 48.0009 30.443 46.9804 31.323C45.9552 32.207 45.4426 33.266 45.4426 34.5C45.4426 35.734 45.954 36.793 46.9769 37.677C48.0021 38.559 49.2314 39 50.6648 39ZM45.8497 24.75H62.0382L62.6506 22.08L55.2121 13.5H48.887L45.8497 24.75Z"
            fill="white"
          />
        </svg>
      ),
    },
    {
      title: "Affordable Rates",
      description: "Transparent pricing without hidden fees.",
      Icon: ({ className }: { className: string }) => (
        <svg
          className={className}
          viewBox="0 0 68 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M34 43C52.2254 43 67 33.598 67 22C67 10.402 52.2254 1 34 1C15.7746 1 1 10.402 1 22C1 33.598 15.7746 43 34 43Z"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M33.1313 22.8488L35.2632 30.5417M13.1072 33.0539L10.9767 25.3601L14.8999 24.9205C15.9701 24.8119 17.0646 24.9744 17.9488 25.3732C18.833 25.772 19.4365 26.3754 19.63 27.0539C19.8235 27.7325 19.5916 28.4323 18.984 29.0034C18.3764 29.5745 17.4415 29.9713 16.3795 30.109L16.3396 30.1129L12.4165 30.5524M24.0263 31.8281L21.8944 24.1352L25.8237 23.6937C26.8966 23.5808 27.9964 23.7407 28.8857 24.1391C29.775 24.5375 30.3825 25.1424 30.5773 25.8233C30.7721 26.5041 30.5384 27.2065 29.9268 27.7787C29.3152 28.351 28.3746 28.7473 27.3079 28.8822L27.2619 28.8871L23.3326 29.3276M27.5489 28.849L32.0338 30.9285M58.288 26.9951C57.9912 27.3404 57.575 27.6382 57.0709 27.8661C56.5667 28.094 55.9878 28.2461 55.3779 28.3108C54.302 28.4343 53.1931 28.2808 52.295 27.884C51.397 27.4873 50.7833 26.8798 50.589 26.1952L50.5813 26.1737L49.8891 23.6732C49.7922 23.3322 49.8023 22.9823 49.9188 22.6437C50.0353 22.3051 50.2559 21.9846 50.5679 21.7005C50.8799 21.4164 51.2772 21.1744 51.7368 20.9885C52.1964 20.8025 52.7093 20.6763 53.2459 20.617C53.8545 20.5564 54.4765 20.5791 55.0702 20.6837C55.6639 20.7883 56.2157 20.9724 56.6887 21.2235M48.1255 24.0698L53.2659 23.4935M48.6581 25.992L53.7985 25.4157M45.8478 26.705C46.0418 27.3897 45.8006 28.0954 45.1771 28.6668C44.5537 29.2383 43.5991 29.6288 42.5232 29.7525L42.4879 29.7574C41.412 29.8808 40.3031 29.7273 39.4051 29.3306C38.507 28.9338 37.8934 28.3264 37.6991 27.6417L37.6929 27.6202L36.9731 25.0221C36.8756 24.6836 36.884 24.3361 36.9978 23.9997C37.1115 23.6632 37.3285 23.3443 37.6361 23.0613C37.9438 22.7782 38.3361 22.5365 38.7907 22.3501C39.2453 22.1636 39.7532 22.0361 40.2853 21.9747L40.3314 21.9688C40.86 21.9096 41.4019 21.9189 41.9248 21.9959C42.4477 22.073 42.9408 22.2163 43.3747 22.4173C43.8087 22.6183 44.1745 22.8729 44.4504 23.1659C44.7263 23.4589 44.9066 23.7842 44.9806 24.1225M41.6775 11.7745L49.6896 10.8759M47.8938 19.0093L45.7603 11.3164M17.3388 18.517C17.7359 18.4727 18.1428 18.4786 18.5363 18.5343C18.9298 18.5901 19.3022 18.6946 19.6323 18.8419C19.9623 18.9893 20.2435 19.1765 20.4598 19.393C20.6761 19.6095 20.8232 19.851 20.8929 20.1037C20.9625 20.3564 20.9532 20.6153 20.8656 20.8657C20.778 21.1162 20.6137 21.3531 20.3822 21.5632C20.1507 21.7732 19.8564 21.9521 19.5162 22.0897C19.176 22.2274 18.7965 22.321 18.3994 22.3654L13.4203 22.925L11.2868 15.2312L16.2736 14.6715C16.6745 14.621 17.0872 14.6218 17.4875 14.6741C17.8879 14.7264 18.2678 14.8291 18.6049 14.9761C18.942 15.1231 19.2296 15.3115 19.4507 15.5302C19.6719 15.7489 19.8221 15.9935 19.8927 16.2497C19.9632 16.5059 19.9526 16.7684 19.8616 17.0219C19.7705 17.2755 19.6007 17.5149 19.3622 17.7261C19.1238 17.9373 18.8214 18.116 18.4729 18.2518C18.1244 18.3877 17.7367 18.4778 17.3327 18.517H17.3388ZM17.3388 18.517L12.3535 19.0767M30.6064 20.8807L24.5635 21.5595L22.4316 13.8667L28.4744 13.1888M23.4968 17.7131L27.4261 17.2716M33.1435 19.7438C33.581 19.9912 34.1056 20.168 34.6729 20.2595C35.2402 20.3509 35.8338 20.3543 36.4036 20.2693L38.2148 20.0661C38.6125 20.0218 38.9926 19.9279 39.3332 19.79C39.6738 19.652 39.9684 19.4727 40.1999 19.2622C40.4314 19.0517 40.5955 18.8142 40.6825 18.5633C40.7696 18.3124 40.7781 18.053 40.7074 17.8001C40.6371 17.5473 40.4891 17.3059 40.272 17.0896C40.0549 16.8732 39.773 16.6862 39.4423 16.5393C39.1116 16.3923 38.7386 16.2883 38.3447 16.2331C37.9508 16.178 37.5436 16.1727 37.1465 16.2177L35.1819 16.4385C34.3808 16.5279 33.5567 16.4114 32.8905 16.1146C32.2243 15.8177 31.7705 15.3648 31.6286 14.8552C31.5588 14.6024 31.568 14.3434 31.6556 14.0929C31.7433 13.8424 31.9076 13.6053 32.1392 13.3952C32.3708 13.1852 32.6652 13.0062 33.0056 12.8686C33.3459 12.7309 33.7256 12.6373 34.1228 12.593L35.934 12.3899C36.5025 12.2837 37.1053 12.2765 37.6798 12.3689C38.2542 12.4613 38.7792 12.65 39.2002 12.9154"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      title: "Reliable Tracking",
      description: "Track your shipment every step of the way.",
      Icon: ({ className }: { className: string }) => (
        <svg
          className={className}
          viewBox="0 0 70 46"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15.2 29.3H21.8M54.8 29.3V35.6C54.8 39.5606 54.8 41.5388 53.2523 42.7694C51.7772 43.9454 49.4408 43.9979 44.9 44M54.8264 10.4H54.7934M21.8 44H15.2C8.9762 44 5.8676 44 3.9338 42.7694C2 41.5388 2 39.5606 2 35.6V31.4C2 27.4394 2 25.4612 3.9338 24.2306C5.8676 23 8.9762 23 15.2 23H21.8C28.0238 23 31.1324 23 33.0662 24.2306C35 25.4612 35 27.4394 35 31.4V35.6C35 39.5606 35 41.5388 33.0662 42.7694C31.1324 44 28.0238 44 21.8 44ZM54.8 2C47.507 2 41.6 5.7989 41.6 10.484C41.6 13.1636 43.25 15.2468 46.55 17.1074C48.8765 18.4199 51.6947 20.5997 53.3843 22.3637C54.1961 23.2121 55.3445 23.2121 56.2157 22.3637C57.9911 20.6333 60.7235 18.4199 63.05 17.1095C66.35 15.2468 68 13.1636 68 10.484C68 5.801 62.093 2 54.8 2Z"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      title: "24/7 Support",
      description: "We're here to help, anytime.",
      Icon: ({ className }: { className: string }) => (
        <svg
          className={className}
          viewBox="0 0 66 42"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M62.7 21.5133C62.7 8.70333 48.642 0 33 0C17.523 0 3.3 8.51667 3.3 21.6533C1.32 22.4467 0 23.94 0 25.6667V30.3333C0 32.9 2.97 35 6.6 35C8.415 35 9.9 33.95 9.9 32.6667V21.4433C9.9 12.5067 19.635 4.69 32.274 4.43333C35.3673 4.36682 38.4479 4.74001 41.3335 5.5308C44.219 6.32159 46.8507 7.51388 49.0725 9.03703C51.2944 10.5602 53.0612 12.3832 54.2684 14.398C55.4755 16.4128 56.0983 18.5785 56.1 20.7667V37.3333H33C31.185 37.3333 29.7 38.3833 29.7 39.6667C29.7 40.95 31.185 42 33 42H56.1C59.73 42 62.7 39.9 62.7 37.3333V34.4867C64.647 33.7633 66 32.34 66 30.66V25.2933C66 23.66 64.647 22.2367 62.7 21.5133Z"
            fill="white"
          />
          <path
            d="M23.1 25.6667C24.9226 25.6667 26.4 24.622 26.4 23.3333C26.4 22.0447 24.9226 21 23.1 21C21.2775 21 19.8 22.0447 19.8 23.3333C19.8 24.622 21.2775 25.6667 23.1 25.6667Z"
            fill="white"
          />
          <path
            d="M42.9 25.6667C44.7225 25.6667 46.2 24.622 46.2 23.3333C46.2 22.0447 44.7225 21 42.9 21C41.0774 21 39.6 22.0447 39.6 23.3333C39.6 24.622 41.0774 25.6667 42.9 25.6667Z"
            fill="white"
          />
          <path
            d="M52.7999 18.7367C52.0131 15.4563 49.6102 12.4786 46.0166 10.3306C42.4231 8.18253 37.8706 7.00273 33.1649 7C23.1659 7 12.4079 12.8567 13.2659 22.05C17.3361 20.8735 20.9309 19.0026 23.7294 16.6045C26.528 14.2064 28.4431 11.3556 29.3039 8.30667C33.6269 14.4433 42.504 18.6667 52.7999 18.7367Z"
            fill="white"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="w-100 inset-0 mx-auto max-w-screen-xl py-8">
      <h1 className="mb-4 text-center text-4xl font-extrabold uppercase text-[#12151A] underline underline-offset-4 md:text-5xl">
        {WHY_US_TITLE.split(" ").map((word, index) => (
          <span key={index}>
            <span className="text-[1.2em]">{word[0]}</span>
            {word.substring(1)}{" "}
          </span>
        ))}
      </h1>
      <div className="mx-12 columns-1 pt-10 sm:gap-2 md:columns-2 lg:columns-4 lg:pt-16">
        {WHY_US_SECTIONS.map((section, index) => (
          <div
            key={index}
            className="w-100 mx-auto mb-8 aspect-square max-w-96 rounded-full border-2 border-red-400 bg-white p-2 lg:p-1 xl:p-2"
          >
            <div className="flex h-full flex-col items-center gap-2 rounded-full bg-[rgba(18,21,26,0.8)] p-5 shadow-[inset_0_-12px_3px_rgba(0,0,0,0.5)]">
              <div className="flex h-[50%] flex-col items-center justify-end gap-1 sm:gap-3">
                <section.Icon className="w-32 md:w-28 lg:w-20" />
                <h3 className="text-center text-lg font-extrabold text-white sm:text-2xl md:text-xl lg:text-lg">
                  {section.title}
                </h3>
              </div>
              <hr className="mx-auto w-1/2 sm:my-2"></hr>
              <p className="text-center text-xs text-white sm:text-[13px] md:text-sm lg:text-xs">
                {section.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const OurSpecialty: React.FC = () => {
  const SPECIALTIES_TITLE = "Our Specialities";

  return (
    <div className="w-100 inset-0 mx-auto my-16 max-w-screen-xl">
      <h1 className="mb-4 text-center text-4xl font-extrabold uppercase text-[#12151A] underline underline-offset-4 md:text-5xl">
        {SPECIALTIES_TITLE.split(" ").map((word, index) => (
          <span key={index}>
            <span className="text-[1.2em]">{word[0]}</span>
            {word.substring(1)}{" "}
          </span>
        ))}
      </h1>
      <div>
        <div className="columns-1 gap-2 pt-10 md:columns-2 lg:columns-3 lg:pt-16">
          {SPECIALTIES_DATA.map((specialty, index) => (
            <Link
              to="/preview/services"
              search={(prev: Record<string, unknown>) => ({
                ...prev,
                specialty: specialty.sku,
              })}
              key={index}
              className="h-42 mx-auto mb-8 block  w-4/5 self-center justify-self-center rounded-3xl border-[1px] border-secondary-800 bg-white/20 p-3 md:w-[350px] lg:w-[300px]"
            >
              <div className="inline-block rounded-full border-2 border-black bg-gray-400">
                <AppImage
                  className="m-3 h-12 w-12 md:m-4 md:h-16 md:w-16"
                  src={specialty.iconPath}
                  alt={specialty.title}
                />
              </div>
              <div className="flex flex-row items-center">
                <h2 className="text-3xl">{specialty.title.split("/")[0]}</h2>
                <svg
                  className="h-10"
                  viewBox="0 0 62 62"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M40.903 20.3808L25.5113 20.5929M40.903 20.3808L41.1151 35.7725M40.903 20.3808L27.6208 34.0341M20.6635 41.1858L23.8259 37.935"
                    stroke="#B21F25"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-sm sm:line-clamp-2 sm:h-[3em] sm:text-[0.99rem]">
                {specialty.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

const Prices: React.FC = () => {
  const PRICES_TITLE = "Prices for the Truck Dispatch Service";
  const PRICES_DATA = [
    {
      title: "Your Authority",
      description:
        "Price for our truck dispatch services starts from 5% gross revenue and up depending on your equipment: ",
      lists: [
        "Box truck - 10%",
        "Hotshot - 5% ",
        "Flatbed/StepDeck - 5%",
        "Dry Van/Reefer/Power Only - 5%",
      ],
    },
    {
      title: "Our Authority",
      description:
        "Price for freight services under our MC authority starts from 15% gross revenue and up. You will get:",
      lists: [
        `Our MC Authority`,
        `Insurance & Safety`,
        `24/7 Dispatch Support`,
        `Document Management and other Benefits.`,
      ],
    },
  ];
  return (
    <div className="w-100 inset-0 mx-auto my-16 max-w-screen-xl">
      <h1 className="mb-4 text-center text-3xl font-extrabold uppercase text-white underline underline-offset-4 md:text-4xl">
        {PRICES_TITLE.split(" ").map((word, index) => (
          <span key={index}>
            <span className="text-[1.2em]">{word[0]}</span>
            {word.substring(1)}{" "}
          </span>
        ))}
      </h1>
      <div className="flex flex-col gap-8 pt-10 md:flex-row md:justify-center lg:pt-16">
        {PRICES_DATA.map((price, index) => (
          <div
            key={index}
            className="mb-8 flex w-4/5 flex-col gap-5 self-center justify-self-center rounded-3xl bg-gray-200/80 px-2 py-7 sm:w-[350px] sm:px-8 lg:w-[360px]"
          >
            <h1 className="text-center text-2xl font-extrabold uppercase">
              {price.title.split(" ").map((word, index) => (
                <span key={index}>
                  <span className="text-[1.2em]">{word[0]}</span>
                  {word.substring(1)}{" "}
                </span>
              ))}
              <hr className="mx-auto w-2/3 border-black sm:my-2" />
            </h1>
            <p className="text-[13px] ">{price.description}</p>
            <ul>
              {price.lists?.map((list, index) => (
                <li className="text-xs" key={index}>
                  • {list}
                </li>
              ))}
            </ul>
            <button className="self-center rounded-3xl border border-red-400 px-12 py-3 text-sm font-medium text-secondary-950 hover:border-white hover:bg-red-500 hover:text-white focus:border-white focus:bg-red-500 focus:text-white">
              Subscribe
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

function Index() {
  return (
    <>
      <Hero
        image={homeHeroImg}
        bluredImage={homeHeroImgBlured}
        className="h-screen"
      >
        <div className="mx-auto w-full pt-56 text-center md:mx-0 md:w-5/6 md:pt-24 md:text-start">
          <h1 className="mb-4 text-5xl font-extrabold leading-none tracking-tight text-white lg:text-6xl">
            Same-Day Delivery, Simplified.
          </h1>
          <hr className="mx-auto my-3 w-1/2 md:mx-0 md:w-4/5"></hr>
          <p className="mb-8 text-xs font-normal text-gray-300  md:w-3/5 lg:text-lg">
            Fast, reliable, and efficient truck dispatching services tailored to
            your needs.
          </p>

          <Link
            to={"/preview/schedule-delivery"}
            className="focus:outline-hidden inline-flex items-center gap-x-2 rounded-3xl border border-white px-4 py-3 text-sm font-medium text-white hover:border-red-400 hover:text-red-400 focus:border-red-400 focus:text-red-400"
          >
            Schedule Delivery
            <svg
              width="17"
              height="18"
              viewBox="0 0 17 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="fill-current"
            >
              <path d="M8.5 17.5C3.8 17.5 0 13.7 0 9C0 4.3 3.8 0.5 8.5 0.5C13.2 0.5 17 4.3 17 9C17 13.7 13.2 17.5 8.5 17.5ZM8.5 1.5C4.35 1.5 1 4.85 1 9C1 13.15 4.35 16.5 8.5 16.5C12.65 16.5 16 13.15 16 9C16 4.85 12.65 1.5 8.5 1.5Z" />
              <path d="M8.34999 13.85L7.64999 13.15L11.8 9.00002L7.64999 4.85002L8.34999 4.15002L13.2 9.00002L8.34999 13.85Z" />
              <path d="M4 8.5H12.5V9.5H4V8.5Z" />
            </svg>
          </Link>
        </div>
      </Hero>
      <AppImageBackground
        className="bg-scroll"
        src={home2Logo}
        placeholder={home2LogoBlured}
        customGradient="linear-gradient(rgba(0, 0, 0, 0.0), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.8))"
      >
        <div className=" px-4 py-8 md:px-8 md:py-16">
          <WhyUs />
          <OurSpecialty />
          <Prices />
          <Testimonials />
        </div>
        <FAQ />
      </AppImageBackground>
      <AppFooter />
    </>
  );
}
