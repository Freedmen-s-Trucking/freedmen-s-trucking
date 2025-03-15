import {
  Accordion,
  AccordionContent,
  AccordionPanel,
  AccordionTitle,
  Flowbite,
} from "flowbite-react";

const ACCORDION_THEME = {
  theme: {
    accordion: {
      root: {
        base: "",
        flush: {
          off: "",
          on: "",
        },
      },
      content: {
        base: "border-b border-red-400 p-1 py-2 text-white",
      },
      title: {
        open: {
          on: "border-b-0 p-1 text-red-500", //"bg-red-500 text-white",
        },
        flush: {
          off: "border-b border-red-400 p-1 text-white",
          on: "",
        },
      },
    },
  },
};

const FAQ: React.FC = () => {
  const FAQ_DATA = [
    {
      question: "How Can the Dispatch Company Help Me to Get Loads?",
      answer:
        "The length of stay varies depending on individual needs but typically ranges from 30 to 90 days.",
    },
    {
      question: "What is the Best Dispatch Service for Owner Operators?",
      // TODO: Add the answer for this question
      answer: "[TODO]: Add the answer for this question",
    },
    {
      question: "How do Freight Dispatchers Find Loads?",
      // TODO: Add the answer for this question
      answer: "[TODO]: Add the answer for this question",
    },
  ];
  return (
    <div className="bg-black/50 px-4 py-8 md:px-8 md:py-16">
      <div className="w-100 inset-0 mx-auto max-w-screen-xl">
        <div className="columns-1 gap-2 px-4 py-16 sm:px-12 md:columns-2">
          <div>
            <h2 className="text-center text-4xl font-bold text-white md:text-start">
              Frequently Asked Questions
            </h2>
            <p className="pt-4 text-center text-sm text-white md:text-start">
              We understand you might have questions about our inpatient
              treatment program. Here are some of the most common inquiries we
              receive
            </p>
          </div>
          <div className="mx-auto mt-8 w-full max-w-md overflow-hidden">
            <Flowbite theme={ACCORDION_THEME}>
              <Accordion>
                {FAQ_DATA.map((faq, index) => (
                  <AccordionPanel isOpen={index == 0} key={index}>
                    <AccordionTitle>
                      <span className="text-xl">•</span>
                      {faq.question}
                    </AccordionTitle>
                    <AccordionContent>
                      <p className="mb-2 text-sm">{faq.answer}</p>
                    </AccordionContent>
                  </AccordionPanel>
                ))}
              </Accordion>
            </Flowbite>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
