import { Button } from "./ui/button";
import { Check } from "lucide-react";

interface PricingCardProps {
  title: string;
  price: string;
  features: string[];
  isPopular?: boolean;
}

export const PricingCard = ({ title, price, features, isPopular }: PricingCardProps) => {
  return (
    <div
      className={`p-6 rounded-2xl ${
        isPopular
          ? "bg-primary/20 border-primary"
          : "bg-white/50 border-gray-200"
      } backdrop-blur-sm border hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
    >
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <div className="mb-4">
        <span className="text-3xl font-bold">{price}</span>
        <span className="text-gray-600">/month</span>
      </div>
      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-green-500" />
            <span className="text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        className={`w-full ${
          isPopular ? "bg-primary text-primary-foreground" : ""
        }`}
        variant={isPopular ? "default" : "outline"}
      >
        Get Started
      </Button>
    </div>
  );
};
