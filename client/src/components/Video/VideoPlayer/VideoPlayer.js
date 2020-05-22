import React, { useState, useEffect, useRef } from "react";
import YouTube from 'react-youtube';
import ReactPlayer from 'react-player';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import './VideoPlayer.css';

const VideoPlayer = ({ log, videoProps, sendVideoState, updateState, playerRef, loadVideoById, loadNextVideo }) => {

    const onYTPlay = (seekTime) => {
        updateState({
            last_YT_state: 1,
            playing: true,
            seekTime
        });
        if (videoProps.receiving) {
            log("Got PLAY", 'others');
            updateState({ receiving: false });
        } else {
            log("Sending PLAY", 'me');
            sendVideoState({
                eventName: 'videoPlay',
                eventParams: { seekTime }
            });
        }
    }
    const onYTPause = (seekTime) => {
        updateState({
            last_YT_state: 2,
            playing: false,
            seekTime
        });
        if (videoProps.receiving) {
            log("Got PAUSE", 'others');
            updateState({ receiving: false });
        } else {
            log("Sending PAUSE", 'me');
            sendVideoState({
                eventName: 'videoPause',
                eventParams: { seekTime }
            });
        }
    }
    const onYTBuffer = (seekTime) => {
        updateState({ last_YT_state: 3 });
    }

    const onYTPlaybackRateChange = (event) => {
        if (videoProps.receiving) {
            log("Got PLAYBACK RATE change", 'others');
            updateState({ receiving: false });
        } else {
            log("Sending PLAYBACK RATE change", 'me');
            let eventParams = {
                playbackRate: event.target.getPlaybackRate()
            };
            updateState({ ...eventParams, receiving: false });
            sendVideoState({
                eventName: 'videoPlaybackRate',
                eventParams: eventParams
            });
        }
    }

    const onYTEnded = () => {
        if (videoProps.receiving) {
            updateState({ receiving: false });
        } else {
            log("ENDING", 'me');
            let queue = videoProps.queueVideoIds;
            if (queue !== undefined && queue.length !== 0) {
                loadNextVideo(queue);
            }
        }
    }

    const onYTCue = () => {
        log("CUED", 'me');
    }

    /** Youtube */
    const YTPlayerState = {
        UNSTARTED: -1,
        ENDED: 0,
        PLAYING: 1,
        PAUSED: 2,
        BUFFERING: 3,
        VIDEO_CUED: 5
    };
    const onYTStateChange = (event) => {
        let playerState = event.data;
        const currTime = event.target.getCurrentTime();
        switch (playerState) {
            case YTPlayerState.UNSTARTED:
                // onYTLoadVideo();
                break;
            case YTPlayerState.ENDED:
                onYTEnded();
                break;
            case YTPlayerState.PLAYING:
                onYTPlay(currTime);
                break;
            case YTPlayerState.PAUSED:
                onYTPause(currTime);
                break;
            case YTPlayerState.BUFFERING:
                onYTBuffer(currTime);
                break;
            case YTPlayerState.VIDEO_CUED:
                onYTCue();
                break;
        }
    }
    const onYTReady = (event) => {
        log("STARTING", 'me');
        if (videoProps.receiving) {
            loadVideoById(videoProps.currVideoId, true);
        } else {
            loadVideoById(videoProps.currVideoId, false);
        }
    }

    const opts = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 1,
        },
    };

    return (
        <div id="videoPlayer">
            <YouTube
                ref={playerRef}
                className='react-player'
                // videoId={videoProps.currVideoId}
                opts={opts}
                // onPlay={onPlay}
                // onPause={onPause}
                // onEnd={onEnd}
                // onError={onError}
                onReady={onYTReady}
                onStateChange={onYTStateChange}
                onPlaybackRateChange={onYTPlaybackRateChange}
            />
        </div>
    );
};

export default VideoPlayer;
