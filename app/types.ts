/*
  Shared types for the Timefold + Bryntum prototype.
  Kept small but explicit to improve readability and tooling.
*/

export type ISODateTime = string;
export type ISODuration = string;

export interface Skill {
    name: string;
    level?: number | null;
    multiplier?: number | null;
}

export interface TimeWindow {
    minStartTime: ISODateTime;
    maxEndTime: ISODateTime;
}

export interface RequiredSkill {
    name: string;
    minLevel?: number | null;
}

export interface FloatingBreak {
    id: string;
    type: 'FLOATING';
    minStartTime: ISODateTime;
    maxEndTime?: ISODateTime | null;
    duration: ISODuration;
    costImpact?: 'PAID' | 'UNPAID' | string;
}

export interface FixedBreak {
    id: string;
    type: 'FIXED';
    startTime: ISODateTime;
    endTime: ISODateTime;
    costImpact?: 'PAID' | 'UNPAID' | string;
}

export type RequiredBreak = FloatingBreak | FixedBreak;

export interface Shift {
    id: string;
    minStartTime: ISODateTime;
    maxEndTime: ISODateTime;
    startLocation?: [number, number];
    requiredBreaks?: RequiredBreak[];
    itinerary?: any[]; // Solver output items; kept loose in this prototype
    skills?: Skill[];
    tags?: any[];
}

export interface Vehicle {
    id: string;
    vehicleType?: string;
    shifts: Shift[];
}

export interface Visit {
    id: string;
    name: string;
    location: [number, number];
    timeWindows?: TimeWindow[];
    serviceDuration?: ISODuration;
    requiredSkills?: RequiredSkill[];
    priority?: string;
    pinningRequested?: boolean;
}

export interface DemoInput {
    vehicles: Vehicle[];
    visits: Visit[];
}

export interface KpisProps {
    visits: number;
    distanceKm: number;
    travelHours: number;
}

export interface HeaderProps {
    demoId: string;
    optimizing: boolean;
    onOptimize: () => void;
}