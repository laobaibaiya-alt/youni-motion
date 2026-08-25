import React from 'react';
import {Composition} from 'remotion';
import config from '../youni-motion.config.json';
import {YouniScene, type YouniSceneProps} from './YouniScene';

const sharedProps: Omit<YouniSceneProps, 'mode'> = {
  sceneId: config.scene.id,
  sceneKind: config.scene.kind as YouniSceneProps['sceneKind'],
  srtFile: config.subtitle.source,
  presenterSafeArea: config.presenterSafeArea,
};

export const YouniMotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="YouniReview"
        component={YouniScene}
        durationInFrames={config.scene.durationInFrames}
        fps={config.video.fps}
        width={config.video.width}
        height={config.video.height}
        defaultProps={{...sharedProps, mode: 'review'}}
      />
      <Composition
        id="YouniAlpha"
        component={YouniScene}
        durationInFrames={config.scene.durationInFrames}
        fps={config.video.fps}
        width={config.video.width}
        height={config.video.height}
        defaultProps={{...sharedProps, mode: 'alpha'}}
      />
    </>
  );
};
