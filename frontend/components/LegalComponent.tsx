import React from "react";
import { useRouter } from "next/router";
import { withProtected } from "@/hoc";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useAppSelector } from "@/store/types";

const LegalComponent = () => {
  const router = useRouter();
  const isDarkMode = useAppSelector((state) => state.ui.isDarkMode);
  const isPrivacyPolicy = router.pathname.includes("privacypolicy");

  const legalContent = isPrivacyPolicy
    ? privacyPolicyContent
    : termsOfServiceContent;

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2 text-center">
          Varidaic AI Learning
        </h1>
        <h2 className="text-2xl font-semibold mb-6 text-center">
          {isPrivacyPolicy ? "Privacy Policy" : "Terms of Service"}
        </h2>
        <div
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {legalContent.map((section, index) => (
            <section key={index} className="mb-6">
              <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
              <p>{section.content}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

const termsOfServiceContent = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement.",
  },
  {
    title: "2. Description of Service",
    content:
      "Our app provides an interactive learning platform. We reserve the right to modify or discontinue the service at any time.",
  },
  {
    title: "3. User Conduct",
    content:
      "You agree to use the service for lawful purposes only and in a way that does not infringe the rights of any third party.",
  },
  {
    title: "4. Intellectual Property",
    content:
      "All content included on this site is the property of our company or its content suppliers and protected by copyright laws.",
  },
  {
    title: "5. Termination",
    content:
      "We reserve the right to terminate your access to the service, without cause or notice, which may result in the forfeiture and destruction of all information associated with your account.",
  },
];

const privacyPolicyContent = [
  {
    title: "1. Information We Collect",
    content:
      "We collect information you provide directly to us, such as when you create an account, use our services, or communicate with us.",
  },
  {
    title: "2. How We Use Your Information",
    content:
      "We use the information we collect to provide, maintain, and improve our services, to develop new ones, and to protect our company and our users.",
  },
  {
    title: "3. Information Sharing and Disclosure",
    content:
      "We do not share personal information with companies, organizations, or individuals outside of our company except in the following cases: with your consent, for legal reasons, or to protect rights, property, or safety.",
  },
  {
    title: "4. Data Security",
    content:
      "We work hard to protect our users from unauthorized access to or unauthorized alteration, disclosure, or destruction of information we hold.",
  },
  {
    title: "5. Your Choices",
    content:
      "You may update, correct, or delete your account information at any time by logging into your online account or by contacting us.",
  },
];

export default withProtected(LegalComponent);

export const getServerSideProps = withPageAuthRequired();
