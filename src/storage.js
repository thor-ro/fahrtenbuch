import { openDB, deleteDB, wrap, unwrap } from 'idb';
import { Track } from './models/track';
import { Address } from './models/address';

const VERSION = 1

export class TrackStorage {
    #db;
    #storage_name;

    tracks = [];
    addresses = [];

    async clearStorage() {
        if (this.#storage_name) {
            await deleteDB(this.#storage_name);
        }
    }


    async initTrackerStorage(storage_name) {
        this.#storage_name = storage_name;
        this.#db = await openDB(this.#storage_name, VERSION, {
            upgrade(db, oldVersion) {
                switch (oldVersion) {
                    case 0: {
                        console.log("initializing db")
                        if (!db.objectStoreNames.contains('tracks')) { // if there's no "books" store
                            console.log("creating tracks store");
                            db.createObjectStore('tracks', {keyPath: 'start_time'}); // create it
                        }
                        if (!db.objectStoreNames.contains('adr')) { // if there's no "books" store
                            db.createObjectStore('adr', {keyPath: 'short'}); // create it
                            console.log("creating tracks adr");
                        }
                        break;
                    }
                }
            }
        });
        this.tracks = await this.getTracksOverview();
        this.addresses = await this.getAddresses();
        console.log(`stored tracks ${this.tracks.length}`);
        console.log(`stored addresses ${this.addresses.length}`);
    }



    async clearTracks() {
        if (this.#storage_name ) {
            await this.#db.transaction('tracks', 'readwrite').objectStore('tracks').clear();
            this.tracks = [];
        }
    }

    async storeTrack(track) {
        let tracks = this.#db.transaction("tracks", "readwrite").store;

        try {
            await tracks.add(track);
            track.samples = [];
            this.tracks.push(track);
        } catch(err) {
            if (err.name == 'ConstraintError') {
                alert("Track exists already");
                console.log("error storing track")
            } else {
                console.log('error', err.message);
                throw err;
            }
        }
    }

    async countTracks() {
        let tracks = this.#db.transaction("tracks", "readonly").store;
        return await tracks.count();
    }

    async getTracks() {
        let tracks = this.#db.transaction("tracks", "readonly").store;
        return await tracks.getAll();
    }

    async mapTracks(cb) {
        let to = [];
        const tx = this.#db.transaction("tracks","readonly");
        for await (const cursor of tx.store) {
            to.push(cb(cursor.value));
        }
        return to;
    }

    async getTracksOverview() {
        let to = [];
        const tx = this.#db.transaction("tracks","readonly");
        for await (const cursor of tx.store) {
            let track_data = cursor.value;
            let track = new Track();
            track.start_time = track_data['start_time'];
            track.start_position = track_data['start_position'];
            track.from = track_data['from'];
            track.stop_time = track_data['stop_time'];
            track.stop_position = track_data['stop_position'];
            track.to = track_data['to'];
            track.distance = track_data['distance'];
            track.notes = track_data['notes'];
            to.push(track);
        }
        return to;
    }

    async storeAddress(adr) {
        let store = this.#db.transaction("adr","readwrite").store;
        try {
            await store.add(adr);
            this.addresses.push(adr);
        } catch(err) {
            if (err.name == 'ConstraintError') {
                alert("Address exists already");
            } else {
                console.log('error', err.message);
                throw err;
            }
        }
    }

    async delAddressByIndex(index) {
        let to_del = this.addresses.splice(index,index);
        let store = this.#db.transaction("adr","readwrite").store;
        await store.delete(to_del.short);
    }
    async delAddressByShort(short) {
        this.addresses = this.addresses.filter(function (value) {return value.short != short});
        let store = this.#db.transaction("adr","readwrite").store;
        await store.delete(short);
    }

    async getAddresses() {
        let to = [];
        let tx = this.#db.transaction("adr","readonly");
        for await (const cursor of tx.store) {
            let adr_data = cursor.value;
            let adr = new Address();
            adr.short = adr_data.short;
            adr.name = adr_data.name;
            adr.company = adr_data.company;
            adr.street_adr_1 = adr_data.street_adr_1;
            adr.city = adr_data.city;
            adr.zip = adr_data.zip;
            to.push(adr);
        }
        return to;
    }

    getAddressByShort(short) {
        return this.addresses.find(function (value) {return value.short == short});
    }
}
