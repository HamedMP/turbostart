import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { z } from 'zod';

// Color palette (customize for your brand)
const COLORS = {
  background: '#0F172A', // Slate 900
  text: '#F8FAFC', // Slate 50
  accent: '#3B82F6', // Blue 500
  secondary: '#64748B', // Slate 500
};

const FONT_FAMILY = "'Inter', system-ui, -apple-system, sans-serif";

// Schema for props validation
export const contentVideoSchema = z.object({
  lines: z.array(z.string()),
  title: z.string(),
  subtitle: z.string().optional(),
  ctaText: z.string().optional(),
  ctaUrl: z.string().optional(),
  backgroundImageUrl: z.string().optional(),
});

export type ContentVideoProps = z.infer<typeof contentVideoSchema>;

const FRAMES_PER_LINE = 45; // 1.5 seconds per line at 30fps
const INTRO_FRAMES = 45; // 1.5 seconds intro

// Animated text line component
const AnimatedLine: React.FC<{
  text: string;
  index: number;
  startFrame: number;
}> = ({ text, index, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const appearFrame = startFrame + index * FRAMES_PER_LINE;
  const localFrame = frame - appearFrame;

  if (localFrame < 0) return null;

  const opacity = interpolate(localFrame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const translateY = spring({
    fps,
    frame: localFrame,
    config: { damping: 200, stiffness: 100 },
    durationInFrames: 20,
  });

  // Fade out when CTA appears
  const ctaStartFrame = durationInFrames - 90;
  const fadeOutOpacity = interpolate(
    frame,
    [ctaStartFrame - 15, ctaStartFrame + 15],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        opacity: opacity * fadeOutOpacity,
        transform: `translateY(${interpolate(translateY, [0, 1], [30, 0])}px)`,
        fontSize: 42,
        fontFamily: FONT_FAMILY,
        fontWeight: 500,
        color: COLORS.text,
        textAlign: 'center',
        lineHeight: 1.6,
        paddingLeft: 60,
        paddingRight: 60,
        marginBottom: 20,
      }}
    >
      {text}
    </div>
  );
};

// Header component with title animation
const Header: React.FC<{ title: string; subtitle?: string; startFrame: number }> = ({
  title,
  subtitle,
  startFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const localFrame = frame - startFrame;
  if (localFrame < 0) return null;

  const opacity = interpolate(localFrame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = spring({
    fps,
    frame: localFrame,
    config: { damping: 200 },
  });

  // Fade out when CTA appears
  const ctaStartFrame = durationInFrames - 90;
  const fadeOutOpacity = interpolate(
    frame,
    [ctaStartFrame - 15, ctaStartFrame + 15],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        opacity: opacity * fadeOutOpacity,
        transform: `scale(${interpolate(scale, [0, 1], [0.9, 1])})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        marginBottom: 60,
      }}
    >
      <div
        style={{
          fontSize: 56,
          fontFamily: FONT_FAMILY,
          fontWeight: 700,
          color: COLORS.accent,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            fontSize: 28,
            fontFamily: FONT_FAMILY,
            fontWeight: 400,
            color: COLORS.secondary,
          }}
        >
          {subtitle}
        </div>
      )}
      <div
        style={{
          width: 120,
          height: 4,
          background: `linear-gradient(90deg, transparent, ${COLORS.accent}, transparent)`,
          marginTop: 8,
          borderRadius: 2,
        }}
      />
    </div>
  );
};

// End CTA component
const EndCTA: React.FC<{ ctaText?: string; ctaUrl?: string }> = ({
  ctaText = 'Learn More',
  ctaUrl = 'yourapp.com',
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const ctaStartFrame = durationInFrames - 90;
  const localFrame = frame - ctaStartFrame;

  if (localFrame < 0) return null;

  const opacity = interpolate(localFrame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = spring({
    fps,
    frame: localFrame,
    config: { damping: 200, stiffness: 100 },
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(30, 41, 59, 0.95)',
          borderRadius: 24,
          padding: '60px 80px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          border: `2px solid ${COLORS.accent}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          transform: `scale(${interpolate(scale, [0, 1], [0.9, 1])})`,
        }}
      >
        <div
          style={{
            fontSize: 44,
            fontFamily: FONT_FAMILY,
            fontWeight: 700,
            color: COLORS.text,
          }}
        >
          {ctaText}
        </div>
        <div
          style={{
            fontSize: 36,
            fontFamily: FONT_FAMILY,
            fontWeight: 600,
            color: COLORS.accent,
          }}
        >
          {ctaUrl}
        </div>
      </div>
    </div>
  );
};

// Main video composition
export const ContentVideo: React.FC<ContentVideoProps> = ({
  lines,
  title,
  subtitle,
  ctaText,
  ctaUrl,
  backgroundImageUrl,
}) => {
  const hasBackground = !!backgroundImageUrl;
  const contentStartFrame = 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
      }}
    >
      {/* Optional background image */}
      {hasBackground && backgroundImageUrl && (
        <>
          <Img
            src={backgroundImageUrl}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
            }}
          />
        </>
      )}

      {/* Content */}
      <div
        style={{
          position: 'absolute',
          top: 200,
          left: 0,
          right: 0,
          bottom: 200,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: 60,
        }}
      >
        <Header
          title={title}
          subtitle={subtitle}
          startFrame={contentStartFrame}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {lines.map((line, index) => (
            <AnimatedLine
              key={index}
              text={line}
              index={index}
              startFrame={contentStartFrame + INTRO_FRAMES}
            />
          ))}
        </div>
      </div>

      {/* End CTA */}
      <EndCTA ctaText={ctaText} ctaUrl={ctaUrl} />
    </AbsoluteFill>
  );
};
