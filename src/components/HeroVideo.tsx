'use client'

import * as contentful from 'contentful'
import React, { useMemo, useEffect, useState } from 'react'

type Props = { space: string; token: string }
export const HeroVideo: React.FC<Props> = (props) => {
  const client = useMemo(
    () =>
      contentful.createClient({
        // This is the space ID. A space is like a project folder in Contentful terms
        space: props.space,
        // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
        accessToken: props.token,
      }),
    [props.space, props.token],
  )

  const [videoUrl, setVideoUrl] = useState<string | undefined>() //assets/video/drone.webm

  useEffect(() => {
    // spefic ID for the video in contentful
    client.getAsset('772l5OashVngRRR1AzXL2r').then((entry) => {
      setVideoUrl(entry.fields.file?.url)
    })
  })

  return (
    <div
      className="video_container overflow-hidden"
      style={{ maxHeight: '50vh' }}
    >
      {videoUrl ? (
        <video
          className="video_content"
          width="100%"
          height="80px"
          src={videoUrl}
          autoPlay
          muted
          loop
        ></video>
      ) : null}
    </div>
  )
}
