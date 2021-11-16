import React, {useState} from 'react'
import Sound from 'react-sound'
import jazz from './jazz.mp3'

const PlaySound = (
    handleSongLoading,
    handleSongPlaying,
    handleSongFinishedPlaying
) => {
    return(
        <div>
            <Sound
                url={jazz}
                playStatus={Sound.status.PLAYING}
                playFromPosition={300}
                onLoading={handleSongLoading}
                onPlaying={handleSongPlaying}
                onFinishedPlaying={handleSongFinishedPlaying}
                loop={true}
            />
        </div>
    )
}

export default PlaySound