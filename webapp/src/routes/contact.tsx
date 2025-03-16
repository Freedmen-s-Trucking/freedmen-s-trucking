import { createFileRoute } from "@tanstack/react-router";
import home2Logo from "../assets/home-2.webp";
import FAQ from "../components/molecules/faq";
import home2LogoBlured from "../assets/home-2-blur.webp";
import AppFooter from "../components/organisms/footer";
import Hero from "../components/molecules/hero";
import contactHeroImg from "../assets/contact-us-hero.webp";
import contactHeroImgBlured from "../assets/contact-us-hero-blur.webp";
import { AppImageBackground } from "../components/atoms/image-background";

export const Route = createFileRoute("/contact")({
  component: RouteComponent,
});

function RouteComponent() {
  const contacts = [
    {
      label: "Phone",
      value: "3434 804 4604",
    },
    {
      label: "Email",
      value: "hello@domain.com", // TODO: update mail.
    },
    {
      label: "Adress",
      value: "Your address goes here", // TODO: FIXIT.
    },
  ];
  return (
    <>
      <Hero
        image={contactHeroImg}
        bluredImage={contactHeroImgBlured}
        className="min-h-screen"
      >
        <div className="flex flex-col items-center justify-center px-4 pt-20 sm:px-12 md:flex-row">
          <div className="mx-auto mb-8 w-[min(100%,350px)]  max-w-md bg-black/80 px-8 py-8 md:mx-0 md:mb-0 md:w-full">
            <h2 className="text-center text-4xl font-bold text-white md:text-start">
              Contact Us
            </h2>
            <p className="py-4 text-center text-sm text-white md:text-start">
              Have questions? Our support team is here to help. Reach out to us
              anytime at support@grdgggg.com.
            </p>
            {contacts.map((contact, index) => (
              <div
                key={index}
                className="flex w-full flex-row items-center justify-between text-white"
              >
                <span>{contact.label}:</span>
                <span className="text-xs">{contact.value}</span>
              </div>
            ))}
          </div>
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-r from-[rgba(102,102,102,0.6)] to-[rgba(0,0,0,0.6)]">
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-white bg-white/20 p-8">
              <input
                required
                id="contact-name-input"
                maxLength={20}
                className="block w-full rounded-xl border border-gray-300 bg-gray-200 p-3 text-center text-lg text-black focus:border-red-400 focus:outline-none focus:ring-transparent"
                placeholder="Your Name"
              />
              <input
                required
                id="contact-phone-number-input"
                maxLength={20}
                className="block w-full rounded-xl border border-gray-300 bg-gray-200 p-3 text-center text-lg text-black focus:border-red-400 focus:outline-none focus:ring-transparent"
                placeholder="Your Phone Number"
              />
              <input
                required
                id="contact-email-input"
                maxLength={20}
                className="block w-full rounded-xl border border-gray-300 bg-gray-200 p-3 text-center text-lg text-black focus:border-red-400 focus:outline-none focus:ring-transparent"
                placeholder="Your Email"
              />
              <textarea
                spellCheck
                minLength={10}
                required
                id="contact-message-input"
                maxLength={1000}
                className="block w-full rounded-xl border border-gray-300 bg-gray-200 p-3 text-center text-lg text-black focus:border-red-400 focus:outline-none focus:ring-transparent"
                placeholder="Your Message"
              />
              <button className="rounded-xl bg-black/90 px-8 py-3 text-white">
                Submit
              </button>
            </div>
          </div>
        </div>
      </Hero>
      <AppImageBackground
        className="bg-scroll"
        src={home2Logo}
        placeholder={home2LogoBlured}
        customGradient="linear-gradient(rgba(0, 0, 0, 0.0), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.8))"
      >
        <FAQ />
      </AppImageBackground>
      <AppFooter />
    </>
  );
}
