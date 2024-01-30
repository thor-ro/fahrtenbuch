import { Track } from './models/track';
import { TrackStorage } from './storage';

export const TRACKING_STATE = Object.freeze({
    UNKNOWN: 0,
    ERROR: 1,
    READY: 2,
    TRACKING: 3,
    PAUSED: 4,
    FINISHED: 5
  });

export class Tracker {
    storage = new TrackStorage();
    track = new Track();
    #watch_id;
    #state = TRACKING_STATE.UNKNOWN;
    
    async initTracker() {
        console.log("initializing tracker ...")
        let st_prom = this.storage.initTrackerStorage("tlr_tracker");
        if (!navigator.geolocation) {
            throw new Error("Geolocation is not supported by your browser");
        }
        await st_prom;
        console.log("storage initialized");
        this.#state = TRACKING_STATE.READY;
    }

    getState() {
        return this.#state;
    }

    isReady() {
        return this.#state >= TRACKING_STATE.READY;
    }
    
    #watch() {
        this.#watch_id = navigator.geolocation.watchPosition(this.onNewPosition.bind(this), this.onPositionError.bind(this), {'enableHighAccuracy':true,'timeout':60000,'maximumAge':0});
        this.#state = TRACKING_STATE.TRACKING;
    }
    
    #stopwatch() {
        if (this.#watch_id) {
            navigator.geolocation.clearWatch(this.#watch_id)
            this.#watch_id = null;
        }
    }

    start() {
        this.track.start_time = Date.now();
        this.#watch();
    }
    pause() {
        this.#stopwatch();
        this.#state = TRACKING_STATE.PAUSED;
    }
    resume() {
        this.#watch();
        this.#state = TRACKING_STATE.TRACKING;
    }
    
    stop() {
        this.track.stop(Date.now());
        this.#stopwatch();
        this.#state = this.isReady() ? TRACKING_STATE.FINISHED : this.#state;
    }

    cancle() {
        this.#stopwatch();
        this.reset();
    }

    async save() {
        if (this.track.samples.length>0) {
            await this.storage.storeTrack(this.track);
        }
        this.reset();
    }

    reset() {
        this.track = new Track();
        this.#state = this.isReady() ? TRACKING_STATE.READY : this.#state;
    }

    onNewPosition(position) {
        console.log(`onNewPosition(${position})`);
        if(position) {
            this.track.addPosition(position);
        }
    }

    onPositionError(err) {
        throw new Error(err.code);
    }
}
