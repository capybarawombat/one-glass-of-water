export const states = ['intro','collect','treatment','testing','delivery','complete'] as const;
export type JourneyState = typeof states[number];
export type JourneyEvent = {type:'NEXT'} | {type:'RESET'};
export function journeyReducer(state:JourneyState,event:JourneyEvent):JourneyState {
 if(event.type==='RESET') return 'intro';
 return states[Math.min(states.indexOf(state)+1,states.length-1)];
}
