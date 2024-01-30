import m from 'mithril';

import { TRACKING_STATE } from '../tracker';
import { Button } from './button';



const TRACKING_STATE_STR = ["UNBEKANNT", "FEHLER", "BEREIT", "AUFNAHME", "PAUSE", "FERTIG"];

function AbortButton(tracker) {
 return m(Button, {text: 'Abbruch', left: true, onclick: () => {tracker.stop();tracker.reset();}});
}

function StopButton(tracker) {
  return m(Button, {text: 'Stop', left: true, onclick: async () => {
    tracker.stop(); 
    let from = document.getElementById('ffrom').value;
    let to = document.getElementById('fto').value;
    tracker.track.from = from;
    tracker.track.to = to;
    await tracker.save();}});
 }

function CreateButtons(tracker) {
  var buttons;
  switch (tracker.getState()) {
    case TRACKING_STATE.UNKNWON:
    case TRACKING_STATE.ERROR:
      buttons = m(Button, {text: 'Connect', onclick: () => {tracker.init();}});
      break;
    case TRACKING_STATE.READY:
      buttons = m(Button, {text: 'Start', left: true, onclick: () => {console.log("start"); tracker.start();}});
      break;
    case TRACKING_STATE.TRACKING:
      buttons = [
        m(Button, {text: 'Pause', left: true, onclick: () => {console.log("pause"); tracker.pause();}}),
        StopButton(tracker),
        AbortButton(tracker),
      ];
      break;
    case TRACKING_STATE.PAUSED:
      buttons = [
        m(Button, {text: 'Weiter', left: true, onclick: () => {console.log("resume"); tracker.resume();}}),
        StopButton(tracker),
        AbortButton(tracker),
      ]
      break;
  }
  return m(".ctrl", buttons);
}

var Shorts = {
  view: function(vnode) {
      return m("datalist", {id: 'adr_shorts'}, vnode.attrs.storage.addresses.map(function (adr) { return m('option', {value: adr.short}, adr.short);}));
  }
}

export const Tracking = {
    view: (vnode) => { 
      let tracker = vnode.attrs.tracker;
      console.log("creating tracking view"); 
      return m('div.app',
        m('header', m('h1.gradient-text', 'Aufnahme')),
        m('main', m('.card', 
            m('.stat-item', `Status: ${TRACKING_STATE_STR[tracker.getState()]}`),
            m('.stat-item', `Distanz: ${tracker.track.distance}`),
            m('.stat-item', `Datenpunkte: ${tracker.track.samples.length}` )
          ),
          // address card
          m(Shorts, {storage: tracker.storage}),
          m('.card', m('form', 
            m("label[for='ffrom']", "Von:"),
            m("input.oval-xlg[id='ffrom'][name='ffrom'][type='text'][list='adr_shorts'][placeholder=Kurz]"),
            m("label[for='fto']", "Nach:"),
            m("input.oval-xlg[id='fto'][name='fto'][type='text'][list='adr_shorts'][placeholder=Kurz]"))),
          m('.spaced-container', CreateButtons(tracker))
        ),
        m('footer', 'TLR Tools')
        );
    }
};

