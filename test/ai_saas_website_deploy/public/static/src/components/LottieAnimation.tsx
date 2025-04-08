import { Player } from '@lottiefiles/react-lottie-player';

interface LottieAnimationProps {
  className?: string;
  animationPath: string;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
}

export const LottieAnimation = ({
  className = '',
  animationPath,
  loop = true,
  autoplay = true,
  speed = 1,
}: LottieAnimationProps) => {
  return (
    <div className={`${className}`}>
      <Player
        src={animationPath}
        className="w-full h-full"
        loop={loop}
        autoplay={autoplay}
        speed={speed}
        style={{ opacity: 0.8 }}
      />
    </div>
  );
};

export default LottieAnimation;
