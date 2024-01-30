import m from 'mithril';

import { Button } from './button';
import { Address } from '../models/address';

const timeDistance = (date1, date2) => {
    let distance = Math.abs(date1 - date2);
    const hours = Math.floor(distance / 3600000);
    distance -= hours * 3600000;
    const minutes = Math.floor(distance / 60000);
    distance -= minutes * 60000;
    const seconds = Math.floor(distance / 1000);
    return `${hours}:${('0' + minutes).slice(-2)}:${('0' + seconds).slice(-2)}`;
  };

function Adr2CSV(adr) {
    let result = '';
    if (adr.name && adr.name.length > 0) {
        result += adr.name + ',';
    }
    if(adr.company && adr.company.length > 0) {
        result += adr.company + ',';
    }
    result += adr.street_adr_1 + ',' + adr.zip + ' ' + adr.city;
    return result;
}

async function ExportCSV(storage, export_adr, export_st_coords, export_samples) {
    let from_head = export_adr ? ";Von" : "";
    let to_head = export_adr ? ";Nach" : "";
    let from_coord_head = export_st_coords ? ";Abfahrt lat;Abfahrt lon" : "";
    let to_coord_head = export_st_coords ? ";Ankunft lat;Ankunft lon" : "";
    let samples_head = export_samples? ";Samples" : "";
    let csv_content = ["Abfahrt Datum;Abfahrt Zeit"+from_head+from_coord_head+";Ankunft Datum;Ankunft Zeit"+to_head+to_coord_head+";Strecke [km];Fahrtdauer [h:m:s]"+samples_head]
    let trackcnt = 0;
    let data = await storage.mapTracks(function(track) {
        console.log(`Export track #${trackcnt}`);
        console.log(track);
        trackcnt += 1;
        let result = [(new Date(track.start_time)).toLocaleString().replace(',',';')];
        var to_str = "";
        if(export_adr) {
            let from_adr = storage.getAddressByShort(track.from);
            let from_str = from_adr ? Adr2CSV(from_adr) : "";
            let to_adr = storage.getAddressByShort(track.to);
            to_str = from_adr ? Adr2CSV(to_adr) : "";
            result.push(from_str);
        }
        if(export_st_coords) {
            result.push(`${track.start_position.lat.toString()};${track.start_position.lon.toString()}`)
        }    
        result.push((new Date(track.stop_time)).toLocaleString().replace(',',';'));
        if(export_adr) {
            result.push(to_str);
        }
        if(export_st_coords) {
            result.push(`${track.stop_position.lat.toString()};${track.stop_position.lon.toString()}`);
        }

        result.push(track.distance > 0 ? (track.distance/1000.0).toString() : '0');
        result.push(timeDistance(track.stop_time, track.start_time));
        result.push(track.samples.map((sample) => {
            return `(${sample.lat},${sample.lon},${sample.timestamp})`;
        }).join(','));
        return result.join(";");
    });

    csv_content.push(data.join('\n'));
        
    /* tracks.map(function(track) {
        console.log(`Export track #${trackcnt}`);
        trackcnt += 1;
        let result = [(new Date(track.start_time)).toLocaleString().replace(',',';')];
        var to_str = "";
        if(export_adr) {
            let from_adr = storage.getAddressByShort(track.from);
            let from_str = from_adr ? Adr2CSV(from_adr) : "";
            let to_adr = storage.getAddressByShort(track.to);
            let to_str = from_adr ? Adr2CSV(to_adr) : "";
            result.push(from_str);
        }
        if(export_st_coords) {
            result.push(`${track.start_position.lat.toString()},${track.start_position.lon.toString()}`)
        }    
        result.push((new Date(track.stop_time)).toLocaleString().replace(',',';'));
        if(export_adr) {
            result.push(to_str);
        }
        if(export_st_coords) {
            result.push(`${track.stop_position.lat.toString()},${track.stop_position.lon.toString()}`);
        }

        result.push(track.distance > 0 ? (track.distance/1000.0).toString() : '0');
        result.push(timeDistance(track.stop_time, track.start_time));
        result.push(track.samples.map((sample) => {
            return `(${sample.lat},${sample.lon},${sample.timestamp})`;
        }).join(','));
        return result.join(";");
    })); */
    csv_content = csv_content.join("\n");

    const blob = new Blob([csv_content], { type: 'text/csv;charset=utf-8,' });

    const objUrl = URL.createObjectURL(blob);
    window.open(objUrl);
}

export const TrackList = {
    view: (vnode) => { 
        var tracks = vnode.attrs.storage.tracks;
        let distance = tracks.length > 0 ? tracks.reduce(function (result, item) {return result + item.distance;}) : 0.0;
        return m('div.app',
            m('header', m('h1.gradient-text', 'Gespeicherte Routen')),
            m('main',
                [m('.card', 
                    m('.stat-item', `Gesamt km: ${ distance>0?(distance/1000.0).toFixed(3) : "0.0"}`),
                    m('.stat-item', `Strecken: ${tracks.length}`),
                ),
                m('.card', m('table', m('thead', m('tr', m('th', 'Datum'), m('th', 'Dauer'), m('th', 'Distanz [km]'), m('th', 'Von'), m('th', 'Nach'))),
                    m('tbody', tracks.map(function(track) {
                        return m('tr', m('th', (new Date(track.start_time)).toLocaleString()), m('th', timeDistance(track.stop_time, track.start_time)), m('th', (track.distance/1000.0).toFixed(2)), m('th', track.from), m('th', track.to));
                    }),
                    ),
                )),
                m('.card', 
                    m('.spaced-container', 
                        m('div',
                        m('label', {for: 'export_adr'}, "Adressen"),
                        m('input', {id: 'export_adr', type: 'checkbox'})),
                        m('div',
                        m('label', {for: 'export_st_coords'}, "Start/Stop Koordinaten"),
                        m('input', {id: 'export_st_coords', type: 'checkbox'})),
                        m('div',
                        m('label', {for: 'export_samples'}, "GPS Punkte"),
                        m('input', {id: 'export_samples', type: 'checkbox'})),
                    ),
                ),
                m('.spaced-container', 
                    m(Button, {text: 'Export', left: true, onclick: async () => {
                        console.log("export"); 
                        let adrs = document.getElementById('export_adr').checked;
                        let coords = document.getElementById('export_st_coords').checked;
                        let samples = document.getElementById('export_samples').checked;
                        await ExportCSV(vnode.attrs.storage, adrs, coords, samples);}}),
                    m(Button, {text: 'Leeren', left: true, onclick: async () => {console.log("clear"); await vnode.attrs.storage.clearTracks();}}),
                )
                ]),
            m('footer', 'TLR Tools')
        );    
    }
    
}