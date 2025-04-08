import { useEffect, useRef, useState } from "react";

const ProductVideo = () => {
  const videoRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrollY(scrollPosition);
    };

    // Add event listener for scrolling
    window.addEventListener("scroll", handleScroll);

    // Clean up event listener on component unmount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={videoRef}
      className="fixed top-0 left-0 w-full flex justify-center items-center"
      style={{
        transform: `translateY(${scrollY * 0.5}px)`, // Moves video based on scroll position
        transition: "transform 0.1s ease-out", // Smooth animation
      }}
    >
      <video
        playsInline
        muted
        autoPlay
        loop
        className="w-full max-w-2xl h-auto"
      >
        <source
          src="https://cdn.shopify.com/videos/c/o/v/1b7ffdd1c27f4bebbb6337ba65769ed3.mp4"
          type="video/mp4"
        />
        <source
          src="https://cdn.shopify.com/videos/c/o/v/25c28706e96242049fbcb2f8e4b4b67a.webm"
          type="video/webm"
        />
      </video>
    </div>
  );
};

export default ProductVideo;
