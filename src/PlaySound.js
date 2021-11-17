import React, {useState} from 'react'
import Sound from 'react-sound'
import jazz from './assets/jazz.mp3'

const PlaySound = (
{isPlaying}
) => {
    return isPlaying ?(
        <div>
            <Sound
                url={jazz}
                playStatus={Sound.status.PLAYING}
                playFromPosition={300}
                loop={true}
            />
        </div>
    ): null
}

export default PlaySound