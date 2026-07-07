import React from "react";
import { Composition } from "remotion";
import { LogoSting } from "./compositions/LogoSting";
import { SocialTeaser } from "./compositions/SocialTeaser";
import { SquareDemo } from "./compositions/SquareDemo";
import { HeroLoop } from "./compositions/HeroLoop";

const FPS = 30;

export const RemotionRoot: React.FC = () => (
  <>
    {/* 3.5s branded logo sting / bumper */}
    <Composition id="LogoSting" component={LogoSting} durationInFrames={105} fps={FPS} width={1080} height={1080} />

    {/* 15s vertical social teaser (9:16) */}
    <Composition id="SocialTeaser" component={SocialTeaser} durationInFrames={450} fps={FPS} width={1080} height={1920} />

    {/* 30s square app-store / demo (1:1) */}
    <Composition id="SquareDemo" component={SquareDemo} durationInFrames={900} fps={FPS} width={1080} height={1080} />

    {/* 8s seamless web-hero background loop (16:9) */}
    <Composition id="HeroLoop" component={HeroLoop} durationInFrames={240} fps={FPS} width={1600} height={900} />
  </>
);
