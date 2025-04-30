import { createFileRoute } from "@tanstack/react-router";

import { IoCamera } from "react-icons/io5";
import { useState } from "react";
import { BackButton } from "../../../components/mobile/back-button";
import { MobileButton } from "../../../components/mobile/mobileButton";
function DeliveryDetailsScreen() {
  const [paymentType, setPaymentType] = useState<'sender' | 'recipient'>('sender');
  const [packageDetails, setPackageDetails] = useState({
    itemType: '',
    quantity: '',
    recipientName: '',
    recipientPhone: '',
    paymentMethod: ''
  });

  return (
    <div className="min-h-screen  bg-mobile-background font-mobile text-mobile-text px-6 pt-4">
      {/* Header */}
      {/* <div className="flex items-center gap-4 mb-6">
        <Link to="/app/user/instant-delivery" 
          className="w-10 h-10 flex items-center justify-center">
          <IoArrowBack className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-semibold">Details</h1>
      </div> */}
      <BackButton isPrimary={true} mainText="Details" />
      
      {/* What are you sending */}
      <div className="mb-3">
        <label className="block text-mobile-text  text-[14px]">What are you sending</label>
        <div className="text-[10px] text-mobile-text mb-2">Select type of item (e.g gadget, document)</div>
        <select 
          className="w-full p-4 bg-mobile-background rounded-lg border-0"
          value={packageDetails.itemType}
          onChange={(e) => setPackageDetails({...packageDetails, itemType: e.target.value})}
        >
          <option value="">Select</option>
          <option value="document">Document</option>
          <option value="gadget">Gadget</option>
          <option value="food">Food</option>
          <option value="other">Other</option>
        </select>
        <div className="flex items-center gap-2">
          <span className="text-red-500 mb-2 text-[12px] font-semibold">?</span>
          
          
        <p className="text-[10px] text-mobile-text mt-2">
          Our Prohibited Items include: blah, blah, blah, blah, blah, blah, blah, blah, blah, blah, blah, blah, blah
        </p>
        </div>
       
      </div>

      {/* Quantity */}
      <div className="mb-6">
        <label className="block text-gray-600 mb-2 text-[14px]">Quantity</label>
        <input
          type="number"
          className="w-full p-4 text-[14px] bg-mobile-background rounded-lg border-0"
          value={packageDetails.quantity}
          onChange={(e) => setPackageDetails({...packageDetails, quantity: e.target.value})}
          placeholder="Enter quantity"
        />
      </div>

      {/* Select who pays */}
      <div className="mb-6">
        <label className="block text-gray-600 mb-2 text-[14px]">Select who pays</label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              className="form-radio text-mobile-text"
              checked={paymentType === 'sender'}
              onChange={() => setPaymentType('sender')}
            />
            <span className="ml-2 text-[14px]">Me</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              className="form-radio text-mobile-text"
              checked={paymentType === 'recipient'}
              onChange={() => setPaymentType('recipient')}
            />
            <span className="ml-2 text-[14px] text-mobile-text">Recipient</span>
          </label>
        </div>
      </div>

      {/* Payment Method */}
      <div className="mb-6">
        <label className="block text-mobile-text mb-2 text-[14px]">Payment type</label>
        <select 
          className="w-full p-4 bg-mobile-background rounded-lg border-0 text-[14px]"
          value={packageDetails.paymentMethod}
          onChange={(e) => setPackageDetails({...packageDetails, paymentMethod: e.target.value})}
        >
          <option value="">Select payment method</option>
          <option value="card">Card</option>
          <option value="cash">Cash</option>
          <option value="transfer">Transfer</option>
        </select>
      </div>

      {/* Recipient Details */}
      <div className="mb-6">
        <label className="block text-mobile-text mb-2 text-[14px]">Recipient Name</label>
        <input
          type="text"
          className="w-full p-4 bg-mobile-background rounded-lg border-0"
          value={packageDetails.recipientName}
          onChange={(e) => setPackageDetails({...packageDetails, recipientName: e.target.value})}
          placeholder="Enter recipient's name"
        />
      </div>

      <div className="mb-6">
        <label className="block text-mobile-text mb-2 text-[14px]">Recipient contact number</label>
        <input
          type="tel"
          className="w-full p-4 bg-mobile-background rounded-lg border-0 text-[14px]"
          value={packageDetails.recipientPhone}
          onChange={(e) => setPackageDetails({...packageDetails, recipientPhone: e.target.value})}
          placeholder="Enter recipient's phone number"
        />
      </div>

      {/* Package Photo */}
      <div className="mb-8">
        <button className="w-full p-6 border-2 border-dashed border-mobile-text rounded-lg flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 bg-mobile-text rounded-full flex items-center justify-center">
            <IoCamera className="w-6 h-6 text-mobile-background" />
          </div>
          <span className="text-mobile-text">Take a picture of the package</span>
        </button>
      </div>

      {/* Continue Button */}
      {/* <button className="w-full bg-teal-700 text-white py-4 rounded-xl font-medium mb-8">
        Continue
      </button> */}
      <MobileButton text="Continue" isPrimary={true} link="/app/user/confirm-details"   />
    </div>
  );
}

export const Route = createFileRoute("/app/user/delivery-details")({
  component: DeliveryDetailsScreen,
}); 