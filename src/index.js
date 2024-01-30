import m from "mithril";
import {Tracking} from './views/tracking';
import {TrackList} from './views/tracks';
import {Tracker} from './tracker';
import {layout} from './views/layout';
import {AddressList} from './views/adr';

var tracker = new Tracker();
tracker.initTracker().then(m.redraw);

const Loading = {
  view: () => m('h1', 'Loading...')
}
  
m.route(document.body, "/tracker", {
  "/tracker": {
    render: function(vnode) {
      return m(layout, 
        !tracker.isReady() ? m(Loading) : m(Tracking, {tracker: tracker}))
    }
  },
  "/tracks": {
    render: function(vnode) {
      return m(layout, m(TrackList, {storage: tracker.storage}))
    }
  },
  "/adr": {
    render: function(vnode) {
      return m(layout, m(AddressList, {storage: tracker.storage}))
    }
  },
})
