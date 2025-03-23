import { Carousel } from "flowbite-react";
import testimonialLogo from "../../assets/images/testimonial-1.webp";
import { AppImage } from "../atoms/image";

const Testimonials: React.FC = () => {
  const TESTIMONIALS_DATA = [
    {
      name: "John S.",
      href: "https://www.linkedin.com/in/john-s-674623252/",
      quote:
        "I've been using this service for a while now, and it's been a game-changer for my business. The team is responsive, and the rates are competitive. Highly recommended!",
    },
    {
      name: "Jane Smith",
      href: "https://www.linkedin.com/in/john-s-674623252/",
      quote:
        "I was skeptical at first, but the service exceeded my expectations. The tracking is accurate, and the customer support is top-notch. I'll definitely be using them again.",
    },
  ];
  return (
    <div className="w-100 inset-0 mx-auto my-8 max-w-screen-xl md:my-16">
      <div className="columns-1 gap-2 px-4 sm:px-12 md:columns-2">
        <div>
          <h4 className="mb-4 flex items-center justify-center gap-4 text-2xl font-bold text-white before:h-[3px] before:max-w-[60px] before:flex-1 before:bg-white after:h-[3px] after:max-w-[60px] after:flex-1 after:bg-white md:justify-start md:after:hidden">
            Testimonials
          </h4>
          <h2 className="text-center text-4xl font-bold text-white md:text-start">
            Our Happy Clients
          </h2>
          <p className="pt-4 text-center text-sm text-white md:text-start">
            Here's what our customers are saying about us:We understand you
            might have questions about our inpatient treatment program. Here are
            some of the most common inquiries.
          </p>
        </div>
        {/* <div className="flex flex-col"> */}
        <div className="mx-auto mt-8 h-56 w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-r from-[rgba(102,102,102,0.6)] to-[rgba(0,0,0,0.6)] sm:h-64">
          <Carousel
            leftControl={<></>}
            rightControl={<></>}
            pauseOnHover
            draggable
          >
            {TESTIMONIALS_DATA.map((testimonial, index) => (
              <div key={index} className="flex h-full flex-col gap-4 p-4 ">
                <div className="flex flex-row items-center gap-2 p-2">
                  <AppImage
                    alt="profile"
                    className="w-12 rounded-2xl"
                    src={testimonialLogo}
                  />
                  <h3 className="text-lg text-white">{testimonial.name}</h3>
                  <span className="ml-auto"></span>
                  <h1 className="absolute right-0 text-7xl text-red-400">“</h1>
                </div>
                <p className="text-sm text-white">{testimonial.quote}</p>
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
