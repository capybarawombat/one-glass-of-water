export const states = ['intro','collect','treatment','testing','delivery','complete'] as const;
export type JourneyState = typeof states[number];
export type JourneyEvent = {type:'NEXT'} | {type:'RESET'};
export function journeyReducer(state:JourneyState,event:JourneyEvent):JourneyState {
 if(event.type==='RESET') return 'intro';
 return states[Math.min(states.indexOf(state)+1,states.length-1)];
}

// Narrative navigation is independent of the original water-service reducer.
export const chapters = ['glass', 'people', 'field', 'river', 'system'] as const;
export type Chapter = typeof chapters[number];
export type StoryEvent = { type: 'GO'; chapter: Chapter } | { type: 'NEXT' } | { type: 'BACK' } | { type: 'RESET' };
export function storyReducer(state: Chapter, event: StoryEvent): Chapter {
 if (event.type === 'RESET') return 'glass';
 if (event.type === 'GO') return chapters.includes(event.chapter) ? event.chapter : state;
 return chapters[Math.max(0, Math.min(chapters.length - 1, chapters.indexOf(state) + (event.type === 'NEXT' ? 1 : -1)))];
}
