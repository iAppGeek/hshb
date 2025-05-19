import { Suspense } from 'react'

export const VideoComponent = async (props: { videoUrl: string }) => {
  return (
    <Suspense fallback={<p>Loading video...</p>}>
      <TheVideo videoUrl={props.videoUrl} />
    </Suspense>
  )
}

const TheVideo = (props: { videoUrl: string }) => {
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
