import { trigger, state, style, transition, animate, AnimationTriggerMetadata } from '@angular/core';

const curves = {
    easeExpoOut: 'cubic-bezier(0.190, 1.000, 0.220, 1.000)'
}

export const revealInOut = (time) => trigger('revealInOut', [
    transition('void => *', [
        style({'max-height': '0px', opacity: 0}),
        animate(`${time || 1000}ms ${curves.easeExpoOut}`),
    ]),
    transition('* => void', [
        animate(`${time || 400}ms ${curves.easeExpoOut}`, style({'max-height': '0px', opacity: 0}))   
    ])
])

export const revealExpandInOut = (time) => trigger('revealExpandInOut', [
    transition('void => *', [
        style({'max-height': '0px', transform: 'scale(0)'}),
        animate(`${time || 400}ms ${curves.easeExpoOut}`),
    ]),
    transition('* => void', [
        animate(`${time || 400}ms ${curves.easeExpoOut}`, style({transform: 'scale(0)', 'max-height': '0px'})), 
    ])
])

export const flipYInOut = (onAnyChange) => trigger('flipYInOut', [
    transition(onAnyChange ? '* => *' : 'void => *', [
        style({transform: 'translateX(-100%)'}),
        animate('0.2s ease-in-out')
    ]),
    
    transition(onAnyChange ? '* => *' : '* => void', [
        animate('0.2s ease-in-out', style({transform: 'translateX(100%)'}))
    ])
])