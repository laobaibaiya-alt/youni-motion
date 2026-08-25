import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {parseSrt, type Caption} from '@remotion/captions';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
  useDelayRender,
  useVideoConfig,
} from 'remotion';

type SafeArea = {x: number; y: number; width: number; height: number};

export type YouniSceneProps = {
  mode: 'review' | 'alpha';
  sceneId: string;
  sceneKind: 'opening' | 'middle' | 'closing' | 'single';
  srtFile: string;
  presenterSafeArea: SafeArea;
};

const CARD_WIDTH = 240;
const CARD_HEIGHT = 150;

const cardStyle: React.CSSProperties = {
  position: 'absolute',
  width: CARD_WIDTH,
  height: CARD_HEIGHT,
  borderRadius: 28,
  background: '#fffdf8',
  border: '2px solid #9aaa80',
  boxShadow: '0 20px 60px rgba(61, 67, 48, 0.14)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: '0 28px',
  boxSizing: 'border-box',
  color: '#24251f',
};

export const YouniScene: React.FC<YouniSceneProps> = ({
  mode,
  sceneId,
  srtFile,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {delayRender, continueRender, cancelRender} = useDelayRender();
  const [handle] = useState(() => delayRender('Loading Youni Motion SRT'));
  const [captions, setCaptions] = useState<Caption[]>([]);

  const loadCaptions = useCallback(async () => {
    try {
      const response = await fetch(staticFile(srtFile));
      if (!response.ok) {
        throw new Error(`Unable to read ${srtFile}: ${response.status}`);
      }
      const {captions: parsed} = parseSrt({input: await response.text()});
      setCaptions(parsed);
      continueRender(handle);
    } catch (error) {
      cancelRender(error instanceof Error ? error : new Error(String(error)));
    }
  }, [cancelRender, continueRender, handle, srtFile]);

  useEffect(() => {
    loadCaptions();
  }, [loadCaptions]);

  const currentMs = (frame / fps) * 1000;
  const currentCaption = useMemo(
    () => captions.find((caption) => currentMs >= caption.startMs && currentMs < caption.endMs),
    [captions, currentMs],
  );

  const leftOffset = interpolate(frame, [0, 22], [-110, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const rightOffset = interpolate(frame, [14, 38], [-90, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const relationProgress = interpolate(frame, [36, 58], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const outputProgress = interpolate(frame, [58, 82], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const leftX = 76 + leftOffset;
  const rightX = 390 + rightOffset;
  const cardY = 360;
  const lineStartX = leftX + CARD_WIDTH;
  const lineEndX = lineStartX + (rightX - lineStartX) * relationProgress;
  const lineY = cardY + CARD_HEIGHT / 2;

  return (
    <AbsoluteFill style={{backgroundColor: mode === 'review' ? '#f4f0e8' : 'transparent'}}>
      {mode === 'review' ? (
        <AbsoluteFill
          style={{
            backgroundImage:
              'linear-gradient(rgba(108,118,87,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(108,118,87,0.055) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      ) : null}

      <div style={{position: 'absolute', left: 76, top: 92, width: 560, color: '#24251f'}}>
        <div style={{fontSize: 18, letterSpacing: 4, color: '#70815a'}}>{sceneId} · YOUNI MOTION</div>
        <div style={{fontSize: 62, lineHeight: 1.08, fontWeight: 720, marginTop: 16}}>语义驱动动画</div>
        <div style={{fontSize: 28, marginTop: 18, color: '#686b61'}}>对象依次出现，关系随后建立</div>
      </div>

      <div style={{...cardStyle, left: leftX, top: cardY}}>
        <div style={{fontSize: 18, color: '#8a6b52'}}>INPUT</div>
        <div style={{fontSize: 36, fontWeight: 700, marginTop: 12}}>字幕语义</div>
      </div>

      <svg style={{position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible'}}>
        <defs>
          <marker id="arrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
            <path d="M0,0 L12,6 L0,12 Z" fill="#70815a" />
          </marker>
        </defs>
        <line
          x1={lineStartX}
          y1={lineY}
          x2={lineEndX}
          y2={lineY}
          stroke="#70815a"
          strokeWidth={8}
          strokeLinecap="round"
          markerEnd={relationProgress > 0.92 ? 'url(#arrow)' : undefined}
        />
      </svg>

      <div style={{...cardStyle, left: rightX, top: cardY, borderColor: '#4e8991'}}>
        <div style={{fontSize: 18, color: '#4e8991'}}>RELATION</div>
        <div style={{fontSize: 36, fontWeight: 700, marginTop: 12}}>动画关系</div>
      </div>

      <div
        style={{
          ...cardStyle,
          left: 232,
          top: 650,
          width: 300,
          borderColor: '#70815a',
          opacity: outputProgress,
          scale: 0.88 + outputProgress * 0.12,
        }}
      >
        <div style={{fontSize: 18, color: '#70815a'}}>OUTPUT</div>
        <div style={{fontSize: 38, fontWeight: 760, marginTop: 12}}>逐场视频</div>
      </div>

      {mode === 'review' && currentCaption ? (
        <div
          style={{
            position: 'absolute',
            left: 160,
            right: 160,
            bottom: 72,
            textAlign: 'center',
            fontSize: 42,
            fontWeight: 650,
            color: '#ffffff',
            textShadow: '0 3px 16px rgba(0,0,0,0.55)',
          }}
        >
          {currentCaption.text}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
