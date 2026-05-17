import React, { Suspense } from 'react'

type Props = { videoUrl: string | undefined }
export const HeroVideo: React.FC<Props> = ({ videoUrl }) => {
  return (
    <div
      className="video_container overflow-hidden"
      style={{ maxHeight: '50vh' }}
    >
      {videoUrl ? (
        <Suspense fallback={<p>Loading video...</p>}>
          <VideoComponent videoUrl={videoUrl} />
        </Suspense>
      ) : null}
    </div>
  )
}

async function VideoComponent(props: { videoUrl: string }) {
  return (
    <video
      className="video_content"
      aria-label="Video player"
      width="100%"
      height="80px"
      src={props.videoUrl}
      autoPlay
      playsInline
      muted
      loop
    >
      Your browser does not support this video.
    </video>
  )
}
