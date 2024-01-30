import m from 'mithril';

export const Button = {
    view: ({attrs: {type, text, onclick, id, disabled, left}}) =>
      m('button', {
        id: id,
        class: 'oval-lg',
        type:  type  || 'button',
        disabled,
        onclick,
        style: 'float: ' + (left ? 'none' : 'right')
      }, text)
  }