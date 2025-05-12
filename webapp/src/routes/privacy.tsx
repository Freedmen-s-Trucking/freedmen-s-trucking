import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createFileRoute } from "@tanstack/react-router";

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
    }
  };

  const sections = [
    { id: "introduction", title: "Introduction" },
    { id: "information-collection", title: "Information We Collect" },
    { id: "information-use", title: "How We Use Your Information" },
    { id: "data-sharing", title: "Information Sharing and Disclosure" },
    { id: "data-storage", title: "Data Storage and Security" },
    { id: "firebase", title: "Firebase Services" },
    { id: "analytics", title: "Google Analytics" },
    { id: "notifications", title: "Notifications" },
    { id: "children", title: "Children's Privacy" },
    { id: "international", title: "International Users" },
    { id: "changes", title: "Changes to This Privacy Policy" },
    { id: "contact", title: "Contact Us" },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.header
        className="bg-primary-800 py-8 text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4">
          <h1 className="mb-2 text-3xl font-bold">Privacy Policy</h1>
          <p className="text-blue-100">Last Updated: May 12, 2025</p>
        </div>
      </motion.header>

      {/* Navigation Sidebar */}
      <div className="container mx-auto flex flex-col gap-8 px-4 py-8 md:flex-row">
        <motion.aside
          className="mb-6 md:mb-0 md:w-1/4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="sticky top-6 rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-primary-800">
              Contents
            </h2>
            <nav>
              <ul className="space-y-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full rounded px-2 py-1 text-left transition-colors ${
                        activeSection === section.id
                          ? "bg-primary-100 font-medium text-primary-800"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {section.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </motion.aside>

        {/* Main Content */}
        <motion.main
          className="md:w-3/4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="rounded-lg bg-white p-6 shadow-md md:p-8">
            <section id="introduction" className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-primary-800">
                Introduction
              </h2>
              <p className="mb-4">
                This Privacy Policy constitutes a legally binding agreement
                between Freedmen's Trucking (hereinafter, "Us", "We", or "Our")
                and you (hereinafter, "User," "Users," "your," or "yours"). This
                Privacy Policy explains how we collect, use, store, and share
                your information when you use our application (hereinafter,
                "App").
              </p>
              <p className="mb-4">
                By using our App, you agree to the collection and use of
                information in accordance with this Privacy Policy. This Privacy
                Policy is incorporated into and subject to our Terms and
                Conditions.
              </p>
            </section>

            <section id="information-collection" className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-primary-800">
                Information We Collect
              </h2>
              <p className="mb-4">
                We collect several types of information from and about users of
                our App, including:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6">
                <li>
                  <span className="font-medium">Personal Information:</span>{" "}
                  Such as your name, email address, phone number, and other
                  identifiers that you provide during registration.
                </li>
                <li>
                  <span className="font-medium">Device Information:</span>{" "}
                  Information about your mobile device and internet connection,
                  including device type, operating system, unique device
                  identifiers, and mobile network information.
                </li>
                <li>
                  <span className="font-medium">Location Data:</span> If
                  permitted by your device settings, we collect real-time
                  information about the location of your device, especially for
                  driver accounts.
                </li>
                <li>
                  <span className="font-medium">Usage Data:</span> Information
                  about how you interact with our App, including features you
                  use, time spent on the App, and other usage patterns.
                </li>
                <li>
                  <span className="font-medium">Content:</span> Information you
                  provide when using our App, including text, graphics, photos,
                  and other materials you upload or submit.
                </li>
              </ul>
            </section>

            <section id="information-use" className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-primary-800">
                How We Use Your Information
              </h2>
              <p className="mb-4">
                We use the information we collect about you or that you provide
                to us for the following purposes:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6">
                <li>To provide and maintain our App and services</li>
                <li>
                  To notify you about changes to our App or any services we
                  offer
                </li>
                <li>
                  To allow you to participate in interactive features of our App
                </li>
                <li>
                  To provide customer support and respond to your inquiries
                </li>
                <li>To improve our App and develop new features</li>
                <li>To monitor and analyze usage patterns and trends</li>
                <li>
                  To detect, prevent, and address technical issues, fraud, or
                  illegal activities
                </li>
                <li>
                  For driver accounts, to track location for delivery and
                  routing purposes
                </li>
                <li>
                  To send you technical notices, updates, security alerts, and
                  administrative messages
                </li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section id="data-sharing" className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-primary-800">
                Information Sharing and Disclosure
              </h2>
              <p className="mb-4">
                We may disclose your personal information in the following
                circumstances:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6">
                <li>
                  <span className="font-medium">Service Providers:</span> We may
                  share your information with third-party vendors, service
                  providers, and other partners who help us provide and improve
                  our App.
                </li>
                <li>
                  <span className="font-medium">Legal Requirements:</span> We
                  may disclose your information if required to do so by law or
                  in response to valid requests by public authorities.
                </li>
                <li>
                  <span className="font-medium">Business Transfers:</span> In
                  connection with a merger, acquisition, or sale of assets, your
                  information may be transferred as a business asset.
                </li>
                <li>
                  <span className="font-medium">With Your Consent:</span> We may
                  share your information with third parties when we have your
                  consent to do so.
                </li>
              </ul>
              <p className="mb-4">
                We do not sell, rent, or otherwise share your personal
                information with third parties for their marketing purposes
                without your explicit consent.
              </p>
            </section>

            <section id="data-storage" className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-primary-800">
                Data Storage and Security
              </h2>
              <p className="mb-4">
                We store your information primarily in the United States. By
                using our App, you are transferring your data to the United
                States, and you expressly consent to have your data transferred
                to and processed in the United States.
              </p>
              <p className="mb-4">
                We implement appropriate technical and organizational measures
                to protect your personal information from unauthorized access,
                alteration, disclosure, or destruction. However, please be aware
                that no method of transmission over the internet or method of
                electronic storage is 100% secure.
              </p>
              <p className="mb-4">
                We will retain your personal information only for as long as is
                necessary for the purposes set out in this Privacy Policy,
                unless a longer retention period is required or permitted by
                law.
              </p>
            </section>

            <section
              id="firebase"
              className="mb-12"
              aria-label="Firebase Services"
            >
              <h2 className="mb-4 text-2xl font-bold text-primary-800">
                Firebase Services
              </h2>
              <p className="mb-4">
                Our App uses various Firebase services provided by Google,
                including:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6">
                <li>
                  <span className="font-medium">Firebase Authentication:</span>{" "}
                  We use Firebase Authentication to allow you to create and
                  manage your account. This service collects and processes your
                  email address, phone number, and authentication-related
                  information.
                </li>
                <li>
                  <span className="font-medium">Firebase Remote Config:</span>{" "}
                  We use Firebase Remote Config to customize and optimize your
                  experience in our App. This service collects device and usage
                  information.
                </li>
                <li>
                  <span className="font-medium">Firebase Cloud Messaging:</span>{" "}
                  For driver accounts, we use Firebase Cloud Messaging to send
                  you important notifications about deliveries, route updates,
                  and other relevant information.
                </li>
              </ul>
              <p className="mb-4">
                The information collected by Firebase services is subject to
                Google's Privacy Policy, which can be found at{" "}
                <a
                  href="https://policies.google.com/privacy"
                  className="text-blue-600 hover:underline"
                >
                  https://policies.google.com/privacy
                </a>
                .
              </p>
            </section>

            <section
              id="analytics"
              className="mb-12"
              aria-label="Google Analytics"
            >
              <h2 className="mb-4 text-2xl font-bold text-primary-800">
                Google Analytics
              </h2>
              <p className="mb-4">
                We use Google Analytics to collect information about how you use
                our App. Google Analytics collects information such as how often
                users access the App, what pages they visit, and what other
                sites they used prior to coming to our App.
              </p>
              <p className="mb-4">
                We use the information we get from Google Analytics only to
                improve our App and services. Google Analytics collects only the
                IP address assigned to you on the date you visit our App, rather
                than your name or other identifying information.
              </p>
              <p className="mb-4">
                Google's ability to use and share information collected by
                Google Analytics about your visits to our App is restricted by
                the Google Analytics Terms of Use and the Google Privacy Policy.
                You can prevent Google Analytics from recognizing you on return
                visits by disabling cookies on your device.
              </p>
            </section>

            <section
              id="notifications"
              className="mb-12"
              aria-label="Notifications"
            >
              <h2 className="mb-4 text-2xl font-bold text-primary-800">
                Notifications
              </h2>
              <p className="mb-4">
                For driver accounts, our App sends various types of
                notifications:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6">
                <li>
                  <span className="font-medium">Push Notifications:</span> We
                  send push notifications to provide updates on deliveries,
                  route changes, and other important information. You can manage
                  push notifications through your device settings.
                </li>
                <li>
                  <span className="font-medium">Email Notifications:</span> We
                  send email notifications regarding your account, service
                  updates, delivery confirmations, and other relevant
                  information. You can manage your email notification
                  preferences in your account settings.
                </li>
                <li>
                  <span className="font-medium">Text Messages:</span> For
                  security reasons, we may send you text messages with
                  verification codes and important account alerts. These
                  messages may be essential for the functioning of your account.
                </li>
              </ul>
            </section>

            <section
              id="children"
              className="mb-12"
              aria-label="Children's Privacy"
            >
              <h2 className="mb-4 text-2xl font-bold text-primary-800">
                Children's Privacy
              </h2>
              <p className="mb-4">
                Our App is not intended for children under 13 years of age (or
                such greater age required in your country or territory for you
                to be authorized to use our App without parental approval). We
                do not knowingly collect personal information from children
                under 13.
              </p>
              <p className="mb-4">
                In accordance with the U.S. Children's Online Privacy Protection
                Act and EU GDPR Reg. 679/2016 recitals 38 and 58, if we receive
                actual knowledge that anyone under the age of 13 has provided
                personal information to us without verifiable parental consent,
                we will delete that information from our App as quickly as is
                reasonably practical.
              </p>
              <p className="mb-4">
                If you believe we might have any information from or about a
                child under 13, please contact us at{" "}
                <a
                  href="mailto:roland@FreedmensTrucking.net"
                  className="text-blue-600 hover:underline"
                >
                  roland@FreedmensTrucking.net
                </a>
                .
              </p>
            </section>

            <section
              id="international"
              className="mb-12"
              aria-label="International Users"
            >
              <h2 className="mb-4 text-2xl font-bold text-primary-800">
                International Users
              </h2>
              <p className="mb-4">
                Our App is hosted in the United States. If you access our App
                from outside the United States, please be advised that your
                information will be transferred to, stored, and processed in the
                United States. By using our App, you consent to this transfer.
              </p>
              <p className="mb-4">
                In compliance with the EU-US Privacy Shield Principles and the
                Swiss-US Privacy Shield Principles, we commit to resolve
                complaints about your privacy and our collection or use of your
                personal information.
              </p>
              <p className="mb-4">
                European Union, United Kingdom, or Swiss individuals with
                inquiries or complaints regarding this Privacy Policy should
                contact us at{" "}
                <a
                  href="mailto:roland@FreedmensTrucking.net"
                  className="text-blue-600 hover:underline"
                >
                  roland@FreedmensTrucking.net
                </a>
                .
              </p>
              <p className="mb-4">
                Freedmen's Trucking has further committed to refer unresolved
                privacy complaints under the EU-US Privacy Shield Principles and
                the Swiss-US Privacy Shield Principles to an independent dispute
                resolution mechanism, the BBB EU PRIVACY SHIELD, operated by BBB
                National Programs. If you do not receive timely acknowledgment
                of your complaint, or if your complaint is not satisfactorily
                addressed, please visit{" "}
                <a
                  href="https://bbbprograms.org/privacy-shield-complaints/"
                  className="text-blue-600 hover:underline"
                >
                  https://bbbprograms.org/privacy-shield-complaints/
                </a>{" "}
                for more information and to file a complaint.
              </p>
            </section>

            <section
              id="changes"
              className="mb-12"
              aria-label="Changes to This Privacy Policy"
            >
              <h2 className="mb-4 text-2xl font-bold text-primary-800">
                Changes to This Privacy Policy
              </h2>
              <p className="mb-4">
                We reserve the right to update or change our Privacy Policy at
                any time. If we make material changes to this Privacy Policy, we
                will notify you by email or through a notice on our App.
              </p>
              <p className="mb-4">
                Your continued use of our App after we make changes is deemed to
                be acceptance of those changes. Please check this Privacy Policy
                periodically for updates.
              </p>
            </section>

            <section id="contact" className="mb-6" aria-label="Contact Us">
              <h2 className="mb-4 text-2xl font-bold text-primary-800">
                Contact Us
              </h2>
              <p className="mb-4">
                If you have any questions or concerns about this Privacy Policy
                or our data practices, please contact us at:
              </p>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="mb-2 font-medium">Freedmen's Trucking</p>
                <p className="mb-2">
                  Email:{" "}
                  <a
                    href="mailto:roland@FreedmensTrucking.net"
                    className="text-primary-800 hover:underline"
                  >
                    roland@FreedmensTrucking.net
                  </a>
                </p>
                <p>
                  Website:{" "}
                  <a
                    href="https://freedman-trucking-dev.web.app"
                    className="text-primary-800 hover:underline"
                  >
                    https://freedman-trucking-dev.web.app
                  </a>
                </p>
              </div>
            </section>
          </div>
        </motion.main>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed bottom-6 right-6 rounded-full bg-primary-800 p-3 text-white shadow-lg transition-colors hover:bg-primary-700"
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </motion.button>
      )}

      {/* Footer */}
      <footer className="mt-8 bg-primary-900 py-6 text-white">
        <div className="container mx-auto px-4 text-center">
          <p>
            © {new Date().getFullYear()} Freedmen's Trucking. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export const Route = createFileRoute("/privacy")({
  component: PrivacyPolicy,
});
