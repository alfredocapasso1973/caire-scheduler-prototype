'use client';
/*
    Schedule — thin wrapper around Bryntum SchedulerPro.
    Responsibility: receives resource time ranges (shifts/breaks) and visit events, and renders the timeline.
    Note: horizontal scrolling is scoped to the wrapper to prevent the whole page from scrolling.
*/
import dynamic from 'next/dynamic';

// Bryntum component must be loaded client-side and without SSR.
const Scheduler = dynamic(
    () => import('@bryntum/schedulerpro-react').then(m => m.BryntumSchedulerPro),
    { ssr: false }
);

/**
 * Props for Schedule
 * @property resources  List of technicians/employees (vehicles) { id, name }
 * @property events     Visit events produced by Timefold's solution
 * @property timeRanges Shift and break ranges rendered as resource time ranges
 * @property startDate  Timeline start
 * @property endDate    Timeline end
 */
type VisitMovePayload = {
    id: string;
    name: string;
    resourceId: string;
    startDate: Date;
    endDate: Date;
};
type VisitDropPayload = {
    id: string;
    name: string;
    resourceId: string;
    start: Date;
    end: Date;
};

type ScheduleProps = {
    resources: any[];
    events: any[];
    timeRanges: any[];
    startDate: Date;
    endDate: Date;
    onVisitMove?: (p: VisitMovePayload) => void;
    readOnly?: boolean;
};

export default function Schedule({
         resources,
         events,
         timeRanges,
         startDate,
         endDate,
         onVisitMove,
         readOnly
     }: ScheduleProps) {
    return (
        // Only the schedule area is allowed to scroll horizontally; the rest of the layout remains fixed.
        <div style={{ height: '70vh', overflowX: 'auto' }}>
            <Scheduler
                startDate={startDate}
                endDate={endDate}
                viewPreset="hourAndDay"
                columns={[{ text: 'Anställd', field: 'name', width: 220 }]}
                resources={resources}
                events={events}
                // Displays shifts and breaks as resource time ranges
                resourceTimeRangesFeature={{}}
                resourceTimeRanges={timeRanges}
                // Enables scrolling far forward/backward in the timeline without loading everything at once
                infiniteScroll={true}
                readOnly={!!readOnly}
                listeners={{
                    eventDrop: ({ eventRecords }) => {
                        const e = eventRecords?.[0];
                        if (!e || readOnly) return;

                        onVisitMove?.({
                            id: String(e.id),
                            name: String(e.name),
                            resourceId: String(e.resourceId),
                            startDate: new Date(e.startDate),
                            endDate: new Date(e.endDate)
                        });
                    }
                }}
            />
        </div>
    );
}