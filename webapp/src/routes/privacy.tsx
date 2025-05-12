import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";

const PrivacyPolicy = () => {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  // Section data array
  const sections = [
    {
      id: "introduction",
      title: "Introduction",
      content: `This Privacy Policy constitutes a legally binding agreement between Freedmen's Trucking (hereinafter, "Us", "We", or "Our") and you (hereinafter, "User," "Users," "your," or "yours"). This Privacy Policy explains how we collect, use, store, and share your information when you use our application (hereinafter, "App"). By using our App, you agree to the collection and use of information in accordance with this Privacy Policy. This Privacy Policy is incorporated into and subject to our Terms and Conditions.`,
    },
    {
      id: "information-collection",
      title: "Information We Collect",
      content: `We collect several types of information from and about users of our App, including:
      
      • Personal Information: Such as your name, email address, phone number, and other identifiers that you provide during registration.
      • Device Information: Information about your mobile device and internet connection, including device type, operating system, unique device identifiers, and mobile network information.
      • Location Data: If permitted by your device settings, we collect real-time information about the location of your device, especially for driver accounts.
      • Usage Data: Information about how you interact with our App, including features you use, time spent on the App, and other usage patterns.
      • Content: Information you provide when using our App, including text, graphics, photos, and other materials you upload or submit.`,
    },
    {
      id: "information-use",
      title: "How We Use Your Information",
      content: `We use the information we collect about you or that you provide to us for the following purposes:
      
      • To provide and maintain our App and services
      • To notify you about changes to our App or any services we offer
      • To allow you to participate in interactive features of our App
      • To provide customer support and respond to your inquiries
      • To improve our App and develop new features
      • To monitor and analyze usage patterns and trends
      • To detect, prevent, and address technical issues, fraud, or illegal activities
      • For driver accounts, to track location for delivery and routing purposes
      • To send you technical notices, updates, security alerts, and administrative messages
      • To comply with legal obligations`,
    },
    {
      id: "data-sharing",
      title: "Information Sharing and Disclosure",
      content: `We may disclose your personal information in the following circumstances:
      
      • Service Providers: We may share your information with third-party vendors, service providers, and other partners who help us provide and improve our App.
      • Legal Requirements: We may disclose your information if required to do so by law or in response to valid requests by public authorities.
      • Business Transfers: In connection with a merger, acquisition, or sale of assets, your information may be transferred as a business asset.
      • With Your Consent: We may share your information with third parties when we have your consent to do so.
      
      We do not sell, rent, or otherwise share your personal information with third parties for their marketing purposes without your explicit consent.`,
    },
    {
      id: "data-storage",
      title: "Data Storage and Security",
      content: `We store your information primarily in the United States. By using our App, you are transferring your data to the United States, and you expressly consent to have your data transferred to and processed in the United States.
      
      We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, please be aware that no method of transmission over the internet or method of electronic storage is 100% secure.
      
      We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy, unless a longer retention period is required or permitted by law.`,
    },
    {
      id: "firebase",
      title: "Firebase Services",
      content: `Our App uses various Firebase services provided by Google, including:
      
      • Firebase Authentication: We use Firebase Authentication to allow you to create and manage your account. This service collects and processes your email address, phone number, and authentication-related information.
      • Firebase Remote Config: We use Firebase Remote Config to customize and optimize your experience in our App. This service collects device and usage information.
      • Firebase Cloud Messaging: For driver accounts, we use Firebase Cloud Messaging to send you important notifications about deliveries, route updates, and other relevant information.
      
      The information collected by Firebase services is subject to Google's Privacy Policy, which can be found at https://policies.google.com/privacy.`,
    },
    {
      id: "analytics",
      title: "Google Analytics",
      content: `We use Google Analytics to collect information about how you use our App. Google Analytics collects information such as how often users access the App, what pages they visit, and what other sites they used prior to coming to our App.
      
      We use the information we get from Google Analytics only to improve our App and services. Google Analytics collects only the IP address assigned to you on the date you visit our App, rather than your name or other identifying information.
      
      Google's ability to use and share information collected by Google Analytics about your visits to our App is restricted by the Google Analytics Terms of Use and the Google Privacy Policy. You can prevent Google Analytics from recognizing you on return visits by disabling cookies on your device.`,
    },
    {
      id: "notifications",
      title: "Notifications",
      content: `For driver accounts, our App sends various types of notifications:
      
      • Push Notifications: We send push notifications to provide updates on deliveries, route changes, and other important information. You can manage push notifications through your device settings.
      • Email Notifications: We send email notifications regarding your account, service updates, delivery confirmations, and other relevant information. You can manage your email notification preferences in your account settings.
      • Text Messages: For security reasons, we may send you text messages with verification codes and important account alerts. These messages may be essential for the functioning of your account.`,
    },
    {
      id: "children",
      title: "Children's Privacy",
      content: `Our App is not intended for children under 13 years of age (or such greater age required in your country or territory for you to be authorized to use our App without parental approval). We do not knowingly collect personal information from children under 13.
      
      In accordance with the U.S. Children's Online Privacy Protection Act and EU GDPR Reg. 679/2016 recitals 38 and 58, if we receive actual knowledge that anyone under the age of 13 has provided personal information to us without verifiable parental consent, we will delete that information from our App as quickly as is reasonably practical.
      
      If you believe we might have any information from or about a child under 13, please contact us at Roland@FreedmensTrucking.net.`,
    },
    {
      id: "international",
      title: "International Users",
      content: `Our App is hosted in the United States. If you access our App from outside the United States, please be advised that your information will be transferred to, stored, and processed in the United States. By using our App, you consent to this transfer.
      
      In compliance with the EU-US Privacy Shield Principles and the Swiss-US Privacy Shield Principles, we commit to resolve complaints about your privacy and our collection or use of your personal information.
      
      European Union, United Kingdom, or Swiss individuals with inquiries or complaints regarding this Privacy Policy should contact us at Roland@FreedmensTrucking.net.
      
      Freedmen's Trucking has further committed to refer unresolved privacy complaints under the EU-US Privacy Shield Principles and the Swiss-US Privacy Shield Principles to an independent dispute resolution mechanism, the BBB EU PRIVACY SHIELD, operated by BBB National Programs. If you do not receive timely acknowledgment of your complaint, or if your complaint is not satisfactorily addressed, please visit https://bbbprograms.org/privacy-shield-complaints/ for more information and to file a complaint.`,
    },
    {
      id: "changes",
      title: "Changes to This Privacy Policy",
      content: `We reserve the right to update or change our Privacy Policy at any time. If we make material changes to this Privacy Policy, we will notify you by email or through a notice on our App.
      
      Your continued use of our App after we make changes is deemed to be acceptance of those changes. Please check this Privacy Policy periodically for updates.`,
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  // Toggle section expanded state
  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <motion.div
      className="mx-auto max-w-4xl rounded-lg px-4 py-8 shadow-md sm:px-6 lg:px-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={headerVariants} className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">PRIVACY POLICY</h1>
        <p className="mt-2 text-gray-600">Last Updated: May 12, 2025</p>
      </motion.div>

      <motion.div variants={headerVariants} className="mb-8">
        <p className="text-gray-700">
          This Privacy Policy explains how{" "}
          <a
            href="https://freedman-trucking-dev.web.app"
            className="text-primary-800 hover:underline"
          >
            Freedmen's Trucking
          </a>{" "}
          collects, uses, and shares your personal information when you use our
          App. By accessing or using our App, you consent to the practices
          described in this policy.
        </p>
      </motion.div>

      {/* Accordion Sections */}
      {sections.map((section) => (
        <motion.div
          key={section.id}
          variants={sectionVariants}
          className="border-b border-gray-200 py-4"
        >
          <button
            onClick={() => toggleSection(section.id)}
            className="flex w-full items-center justify-between focus:outline-none"
          >
            <h2 className="text-left text-xl font-semibold text-gray-800">
              {section.title}
            </h2>
            {!expandedSections[section.id] ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>

          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate={!expandedSections[section.id] ? "visible" : "hidden"}
            className="overflow-hidden"
          >
            <div className="whitespace-pre-line pb-2 pt-4 leading-relaxed text-gray-600">
              {section.content}
            </div>
          </motion.div>
        </motion.div>
      ))}

      {/* Contact Section */}
      <motion.div variants={sectionVariants} className="mt-8 text-center">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">CONTACT US</h2>
        <p className="text-gray-600">
          If you have any questions or concerns about this Privacy Policy or our
          data practices, please contact us:
        </p>
        <a
          href="mailto:roland@FreedmensTrucking.net"
          className="mt-2 inline-block text-primary-600 hover:underline"
        >
          Roland@FreedmensTrucking.net
        </a>
      </motion.div>
    </motion.div>
  );
};

export const Route = createFileRoute("/privacy")({
  component: PrivacyPolicy,
});
