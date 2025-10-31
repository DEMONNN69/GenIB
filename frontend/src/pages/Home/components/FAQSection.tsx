import React, { useState } from 'react';
import { Add, Minus } from 'iconsax-react';
import IllustrationPlaceholder from './IllustrationPlaceholder';

const FAQSection: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqs = [
    {
      question: "What exam boards does GenIB support?",
      answer: "GenIB supports all major international exam boards including Cambridge IGCSE, Cambridge A-Level, Edexcel IGCSE, Edexcel A-Level, and IB Diploma Programme. We regularly update our content to include the latest syllabus changes."
    },
    {
      question: "Are the past papers official and up-to-date?",
      answer: "Yes! All our past papers are official papers from the respective exam boards. We update our database regularly to include the latest papers as soon as they become available, ensuring you have access to the most current materials."
    },
    {
      question: "Can I download the papers for offline study?",
      answer: "Absolutely! Most of our past papers are available for download in PDF format, allowing you to study offline whenever and wherever you want. Some premium content requires an active subscription."
    },
    {
      question: "How does the personalized study plan work?",
      answer: "Our AI-powered system analyzes your performance across different topics and question types to create a customized study plan. It identifies your weak areas and suggests specific papers and questions to help you improve."
    },
    {
      question: "Is there a mobile app available?",
      answer: "While we don't have a dedicated mobile app yet, our website is fully responsive and optimized for mobile devices. You can access all features seamlessly on your smartphone or tablet through your browser."
    },
    {
      question: "What's included in the free version?",
      answer: "The free version includes access to selected past papers, basic practice questions, and limited analytics. Premium subscribers get unlimited access to all papers, detailed explanations, advanced analytics, and priority support."
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Got questions? We've got answers. Here are the most common questions about GenIB.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left FAQ List */}
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openItems.includes(index);
              return (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-semibold text-gray-900 pr-4">
                      {faq.question}
                    </h3>
                    <div className="flex-shrink-0">
                      {isOpen ? (
                        <Minus variant="Bold" size={20} className="text-blue-600" />
                      ) : (
                        <Add variant="Bold" size={20} className="text-gray-400" />
                      )}
                    </div>
                  </button>
                  
                  {isOpen && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Illustration */}
          <div className="relative">
            <IllustrationPlaceholder
              title="Student Support & Help"
              description="3D illustration of a friendly customer support scene with a smiling support agent surrounded by floating question marks, chat bubbles, help icons, and students getting assistance through various devices"
              alt="Customer support helping students with their questions"
              className="w-full h-80 lg:h-96"
              imagePath="illustrations/woman talking with chatbot.png"
            />

            {/* Contact Info Card */}
            <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-4">
                Still have questions?
              </h4>
              <p className="text-gray-600 text-sm mb-4">
                Our support team is here to help you succeed. Get in touch!
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600">📧</span>
                  <span className="text-gray-600">support@genib.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">💬</span>
                  <span className="text-gray-600">Live chat available 24/7</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-purple-600">📱</span>
                  <span className="text-gray-600">Response within 2 hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;