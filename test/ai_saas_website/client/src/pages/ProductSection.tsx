import { useState } from "react";
import ProductVideo from "./ProductVideo";
const ProductSection = () => {
  const [isDescriptionOpen, setDescriptionOpen] = useState(false);
  const [isNotesOpen, setNotesOpen] = useState(false);
  const [isIngredientsOpen, setIngredientsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("90ml");

  return (
    <section className="max-w-5xl mx-auto p-4">
      {/* Product Media Section */}
      <div className="relative h-[3000px] bg-gray-100">
      <ProductVideo />
      <div className="mt-[100vh] p-10 text-center">
        <h1 className="text-4xl font-bold">Scroll to see the video move</h1>
      </div>
    </div>
    
      {/* Product Details */}
      <div className="mt-8">
        <h2 className="text-3xl font-bold">SIDE EFFECT</h2>
        

        {/* Accordions */}
        <div className="mt-4 space-y-2">
          {/* Description */}
          <div className="border rounded-md">
            <button
              onClick={() => setDescriptionOpen(!isDescriptionOpen)}
              className="w-full p-3 flex justify-between items-center bg-gray-100 hover:bg-gray-200"
            >
              <span className="text-lg font-semibold">Description</span>
              <span>{isDescriptionOpen ? "−" : "+"}</span>
            </button>
            {isDescriptionOpen && (
              <div className="p-3 text-gray-700">
                From the first drop, SIDE EFFECT seizes the senses, sending a
                shiver through the body. Defined by a hypnotic blend of Tobacco,
                Vanilla, Rum, and Cinnamon, this enigmatic perfume captivates
                effortlessly.
              </div>
            )}
          </div>

          {/* Main Notes */}
          <div className="border rounded-md">
            <button
              onClick={() => setNotesOpen(!isNotesOpen)}
              className="w-full p-3 flex justify-between items-center bg-gray-100 hover:bg-gray-200"
            >
              <span className="text-lg font-semibold">Main Notes</span>
              <span>{isNotesOpen ? "−" : "+"}</span>
            </button>
            {isNotesOpen && (
              <div className="p-3 text-gray-700">
                Cinnamon, Rum, Tobacco, Saffron, Sandalwood, Hedione.
              </div>
            )}
          </div>

          {/* Ingredients */}
          <div className="border rounded-md">
            <button
              onClick={() => setIngredientsOpen(!isIngredientsOpen)}
              className="w-full p-3 flex justify-between items-center bg-gray-100 hover:bg-gray-200"
            >
              <span className="text-lg font-semibold">Ingredients</span>
              <span>{isIngredientsOpen ? "−" : "+"}</span>
            </button>
            {isIngredientsOpen && (
              <div className="p-3 text-gray-700">
                ALCOHOL DENAT., PARFUM (FRAGRANCE), AQUA (WATER), LINALOOL,
                LIMONENE, BENZOIC ACID, FARNESOL, COUMARIN.
              </div>
            )}
          </div>
        </div>

        {/* Size Selection */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold">Size</h3>
          <div className="flex space-x-4 mt-2">
            <button
              onClick={() => setSelectedSize("90ml")}
              className={`px-4 py-2 border rounded ${
                selectedSize === "90ml" ? "bg-gray-900 text-white" : "bg-white"
              }`}
            >
              90ml - 270€
            </button>
            <button
              onClick={() => setSelectedSize("50ml")}
              className={`px-4 py-2 border rounded ${
                selectedSize === "50ml" ? "bg-gray-900 text-white" : "bg-white"
              }`}
            >
              50ml - 210€
            </button>
          </div>
        </div>

        {/* Quantity & Add to Cart */}
        <div className="mt-6 flex items-center space-x-4">
          {/* Quantity Selector */}
          <div className="flex items-center border rounded-md">
            <button
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              className="px-3 py-2 bg-gray-200"
            >
              −
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-12 text-center border-0"
            />
            <button
              onClick={() => setQuantity((prev) => prev + 1)}
              className="px-3 py-2 bg-gray-200"
            >
              +
            </button>
          </div>

          {/* Add to Cart Button */}
          <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">
            Add to Cart - {selectedSize === "90ml" ? "270€" : "210€"}
          </button>
        </div>

        {/* PayPal Message */}
        <p className="mt-4 text-gray-500">
          Buy now and pay later with{" "}
          <a
            href="https://www.paypal.com/uk/webapps/mpp/campaigns/paypal-payin3/terms"
            target="_blank"
            className="text-blue-500 underline"
          >
            PayPal
          </a>
        </p>
      </div>
    </section>
  );
};

export default ProductSection;
