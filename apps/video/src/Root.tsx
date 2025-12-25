import "./index.css";
import { Composition } from "remotion";
import { ContentVideo, contentVideoSchema } from "./ContentVideo";

/**
 * Calculate video duration based on content
 * Adjust timing based on your content needs
 */
const calculateDuration = (lines: string[]) => {
  const FRAMES_PER_LINE = 45; // 1.5 seconds per line at 30fps
  const INTRO_FRAMES = 45; // 1.5 seconds intro
  const CTA_FRAMES = 90; // 3 seconds for end CTA

  return INTRO_FRAMES + lines.length * FRAMES_PER_LINE + CTA_FRAMES;
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ContentVideo"
        component={ContentVideo}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        schema={contentVideoSchema}
        defaultProps={{
          lines: [
            'Welcome to Remotion',
            'Create programmatic videos',
            'Using React components',
            'Perfect for social media',
          ],
          title: 'Video Generation',
          subtitle: 'Powered by Remotion',
          ctaText: 'Learn More',
          ctaUrl: 'yourapp.com',
        }}
        calculateMetadata={({ props }) => {
          return {
            durationInFrames: calculateDuration(props.lines),
          };
        }}
      />
    </>
  );
};
