import m from 'mithril';
import { Button } from './button';
import { TrackStorage } from '../storage';
import {Address} from '../models/address';

async function saveAddress(storage) {
    var adr = new Address();
    adr.short = document.getElementById("fshort").value;
    adr.name = document.getElementById("fname").value;
    adr.company = document.getElementById("fcompany").value;
    adr.street_adr_1 = document.getElementById("fstreet").value;
    adr.city = document.getElementById("fcity").value;
    adr.zip = document.getElementById("fzip").value;
    await storage.storeAddress(adr);
}

function checkShort(storage) {
    var val = document.getElementById("fshort").value;
    var but = document.getElementById('new_adr_save');
    if (!val) {
        alert("Abkürzung darf nicht leer sein");
        but.disabled = true;
    } else {
        if (storage.addresses.some(function(adr) {return adr.short == val;})) {
            alert("Abkürzung breits vorhanden")
            but.disabled = true;
        } else {
            if(but.disabled) {
                but.disabled = false;
            }
        }
    }
}

const edit_icon = m('svg', {class: 'icon', viewBox: '0 0 256 256'}, m('path', {d: "M197.8,10.6c-6.3,1.6-1.6-3-86.9,82.3l-79.2,79.2L20.7,205c-9.3,27.9-10.9,33.2-10.7,34.8c0.4,3.2,3,5.8,6.2,6.2c1.6,0.2,6.9-1.4,34.8-10.7l32.9-10.9l78.3-78.3c43.1-43,79-79.3,79.9-80.5c4.6-6.9,5.1-15.2,1.6-22.8c-1.2-2.6-3-4.6-13.8-15.5c-8-8.1-13.3-13.1-15-14.1C210.1,10.2,203.3,9.2,197.8,10.6z M206.6,25.6c2.5,1.2,23,21.8,24,24.1c0.9,2.2,0.9,4.1,0,6.3c-0.5,1.1-4.4,5.4-11.2,12.2l-10.5,10.5l-15.8-15.8l-15.8-15.8l10.3-10.3c6-6,11-10.7,12.1-11.2C202,24.5,204.2,24.5,206.6,25.6z M182.7,73.6l15.7,15.7l-61,61l-61,61L53,219.1c-12.8,4.2-23.4,7.7-23.6,7.5c-0.1-0.1,3.2-10.7,7.5-23.5l7.7-23.2l61-61c33.5-33.5,61-61,61.2-61C166.9,57.9,174,65,182.7,73.6z"}));
const del_icon = m('svg', {class: 'icon', viewBox: '0 0 256 256'}, m('path', {fill: "#000000", d: "M95.8,213.8c3.2,0,5.4-2.7,5.4-5.4l-8-128.7c0-3.2-2.7-5.4-5.4-5.4c-3.2,0-5.4,2.7-5.4,5.4l8,128.7C90.5,211.7,93.1,213.8,95.8,213.8z M219.2,42.2h-53.6V20.7c0-5.9-4.8-10.7-10.7-10.7h-53.7c-5.9,0-10.7,4.8-10.7,10.7v21.5H36.8c-3.2,0-5.4,2.1-5.4,5.4c0,3.2,2.1,5.4,5.4,5.4h10.7l10.7,171.6c1.6,11.8,9.7,21.5,21.5,21.5h96.5c11.8,0,19.3-9.7,21.5-21.5l10.7-171.6h10.7c3.2,0,5.4-2.1,5.4-5.4C224.6,44.3,222.4,42.2,219.2,42.2z M101.2,20.7h53.6v21.5h-53.6V20.7z M187,224.5c-0.5,5.9-4.8,10.7-10.7,10.7H79.7c-5.9,0-9.7-4.8-10.7-10.7L58.3,52.9h139.5L187,224.5z M160.2,213.8c3.2,0,5.4-2.1,5.4-5.4l8-128.7c0-3.2-2.1-5.4-5.4-5.4c-3.2,0-5.4,2.1-5.4,5.4l-8,128.7C154.8,211.1,157,213.8,160.2,213.8z M128,213.8c3.2,0,5.4-2.1,5.4-5.4V79.7c0-3.2-2.1-5.4-5.4-5.4c-3.2,0-5.4,2.1-5.4,5.4v128.7C122.6,211.7,124.8,213.8,128,213.8z"}))

function DelButton(storage, short) {
    return ;
   }

export const AddressList = {
    view: (vnode) => { 
        let storage = vnode.attrs.storage;
        return m('div.app',
            m('header', m('h1.gradient-text', 'Gespeicherte Addressen')),
            m('main',
                m('.card', m('form', 
                    m("input.oval-xlg[id='fshort'][required][name='fshort'][type='text'][placeholder=Kurz]", {onblur: async (e) => {e.redraw = false; console.log("blur new address");checkShort(storage);}}), m("br"),
                    m("input.oval-xlg[id='fname'][name='fname'][type='text'][placeholder=Name]"), m("br"),
                    m("input.oval-xlg[id='fcompany'][name='fcompany'][type='text'][placeholder=Firma]"), m("br"),
                    m("input.oval-xlg[id='fstreet'][name='fstreet'][type='text'][placeholder=Fake Street 19]"), m("br"),
                    m("input.oval-xlg[id='fcity'][name='fcity'][type='text'][placeholder=Stuttgart]"), m("br"),
                    m("input.oval-xlg[id='fzip'][name='fzip'][type='text'][placeholder=72304]"), m("br"),
                    m(Button, {text: 'Speichern', id: 'new_adr_save', left: true, onclick: async () => {console.log("save new address");saveAddress(storage)}}),
                )),
                storage.addresses.map(function (adr) {
                    return m('.card', 
                    m('.spaced-container', m('div', `${adr.short}`), m(Button, {text: del_icon, left: true, onclick: async () => {console.log(`delete address ${adr.short}`); await storage.delAddressByShort(adr.short)}})),
                    m('div', `${adr.name}`),
                    m('div', `${adr.company}`),
                    m('div', `${adr.street_adr_1}`),
                    m('div', `${adr.zip} ${adr.city}`),
                )}),
            m('.card', 
                m(Button, {text: 'Leeren', left: true, onclick: async () => {console.log("clear addresses");}}),
            ),),
            m('footer', 'TLR Tools'),
        );    
    }
}