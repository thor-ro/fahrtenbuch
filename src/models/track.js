import { TrackSample } from "./tracksample";
import { getDistanceFromLatLonInKm } from "./geo_utils";

export class Track {
    start_time;
    start_position;
    from;
    stop_time;
    stop_position;
    to;
    distance = 0;
    notes = "";
    samples = [];
    
    static fromTuple(tup) {
        var t = new Track();
        if (tup.length() == 9) {
            t.start_time = tup[0];
            t.start_position = tup[1];
            t.from = tup[2];
            t.stop_time = tup[3];
            t.stop_position = tup[4];
            t.to = tup[5];
            t.distance = tup[6];
            t.notes = tup[7];
            t.samples = tup[8];
        }
        return t;
    } 

    toTuple() {
        return [
            this.start_time,
            this.start_position,
            this.from,
            this.stop_time,
            this.stop_position,
            this.to,
            this.distance,
            this.notes,
            this.samples
        ];
    }

    start(start_time) {
        this.start_time = start_time;
    }

    stop(stop_time) {
        this.stop_time = stop_time;
        this.stop_position = (this.samples.length > 0) ? this.samples[this.samples.length-1] : this.start_position;

    }

    addPosition(pos) {
        let ts = new TrackSample(pos.coords.latitude, pos.coords.longitude, pos.timestamp);
        if (this.samples.length > 0) {
            let last_pos = this.samples[this.samples.length-1];
            this.distance += getDistanceFromLatLonInKm(last_pos.lat, last_pos.lon, ts.lat, ts.lon);
        } else {
            this.start_position = ts;
        }
        this.samples.push(ts)
    }
}