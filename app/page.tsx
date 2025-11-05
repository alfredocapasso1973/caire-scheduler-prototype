'use client';
/*
  Page – Timefold demo with Bryntum SchedulerPro.
  Responsibilities:
  - Load demo input (vehicles, shifts, visits) and render baseline.
  - Submit to /route-plans, poll solution, and render visits per resource.
  - Show lightweight KPIs (visits, distance, travel time).
  Structure:
  - Helpers (imported from ./lib/time)
  - Presentational components (Header, Kpis)
  - Page state/effects/actions (fetch, optimize, apply)
*/

import { useEffect, useRef, useState } from 'react';
import ky from 'ky';
import Schedule from './components/Schedule';
import { wallDate, parseDurationToSeconds, hashEvents } from './lib/time';
import type { DemoInput, FixedBreak } from './types';
import { Header, Kpis } from './components/ui';

export default function Page() {
    // Dataset / input
    const [demoId] = useState('BASIC');
    const [inputJson, setInputJson] = useState<DemoInput | null>(null);

    // Scheduler data
    const [resources, setResources] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [timeRanges, setTimeRanges] = useState<any[]>([]);
    const [startDate, setStartDate] = useState<Date>(new Date(2025, 9, 20, 6));
    const [endDate, setEndDate] = useState<Date>(new Date(2025, 9, 20, 21));

    // Timefold state
    const [routePlanId, setRoutePlanId] = useState<string>('');
    const [optimizing, setOptimizing] = useState(false);

    // KPIs
    const [kpi, setKpi] = useState({ visits: 0, distanceKm: 0, travelHours: 0 });

    // Refs
    const pollRef = useRef<any>(null);
    const lastHashRef = useRef<string>('');

    // Load baseline input, derive time window, and build shift/break time ranges
    useEffect(() => {
        const ctrl = new AbortController();
        let cancelled = false;

        (async () => {
            try {
                const data = await ky
                    .get(`/api/timefold/demo-data/${demoId}/input`, { signal: ctrl.signal })
                    .json<DemoInput>();

                if (cancelled) return;

                setInputJson(data);

                // Resources (vehicles -> rows)
                const res = (data.vehicles ?? []).map((v: any) => ({ id: v.id, name: v.id }));
                setResources(res);

                // Compute visible window from min/max shift boundaries (wall-clock)
                const allShifts = (data.vehicles ?? []).flatMap((v: any) => v.shifts ?? []);
                const times = allShifts.flatMap((s: any) => [s.minStartTime, s.maxEndTime]).filter(Boolean);
                const dates = times.map((t: any) => wallDate(String(t)));
                if (dates.length) {
                    const min = new Date(Math.min(...dates.map(d => d.getTime())));
                    const max = new Date(Math.max(...dates.map(d => d.getTime())));
                    setStartDate(new Date(min.getFullYear(), min.getMonth(), min.getDate(), 0, 0, 0, 0));
                    setEndDate(new Date(max.getFullYear(), max.getMonth(), max.getDate(), 23, 59, 59, 999));
                }

                // Reset dynamic state upon dataset change
                setEvents([]);
                setRoutePlanId('');
                lastHashRef.current = '';

                // Build resource time ranges for shifts and breaks
                const tr: any[] = [];
                for (const veh of data.vehicles ?? []) {
                    const rid = veh?.id;
                    for (const shift of veh?.shifts ?? []) {
                        const shiftStart = wallDate(shift.minStartTime);
                        const shiftEnd = wallDate(shift.maxEndTime);

                        const fixed = (shift.requiredBreaks ?? []).find(
                            (b): b is FixedBreak => b.type === 'FIXED' && 'startTime' in b && 'endTime' in b
                        );

                        if (fixed) {
                            const bStart = wallDate(fixed.startTime);
                            const bEnd = wallDate(fixed.endTime);
                            tr.push({ id: `${rid}-${shift.id}-pre`, resourceId: rid, name: 'Skift', startDate: shiftStart, endDate: bStart });
                            tr.push({ id: `${rid}-${shift.id}-break`, resourceId: rid, name: 'Rast', startDate: bStart, endDate: bEnd, cls: 'break' });
                            tr.push({ id: `${rid}-${shift.id}-post`, resourceId: rid, name: 'Skift', startDate: bEnd, endDate: shiftEnd });
                        } else {
                            tr.push({ id: `${rid}-${shift.id}-full`, resourceId: rid, name: 'Skift', startDate: shiftStart, endDate: shiftEnd });
                        }
                    }
                }
                setTimeRanges(tr);
            } catch (err) {
                if (!cancelled) console.error('Failed to load demo input', err);
            }
        })();

        return () => {
            cancelled = true;
            ctrl.abort();
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [demoId]);

    /* Apply a Timefold solution to local state:
   - Extract VISIT itinerary items and convert to Bryntum events
   - Compute KPIs (visits / distance / travel time)
   - Deduplicate event updates via hashEvents()
*/
    async function apply(rp: any) {
        if (!rp) return;

        const out = rp.activeModelOutput || rp.modelOutput;
        if (!out?.vehicles?.length) return;

        // Map visitId -> name from original input JSON
        const visitMap = new Map(
            (inputJson?.visits ?? []).map((v: any) => [v.id, v.name])
        );

        // Build Bryntum events from itinerary VISIT items
        const evts = out.vehicles.flatMap((veh: any) => {
            const rid = veh?.id;
            if (!rid) return [];

            return (veh.shifts ?? []).flatMap((shift: any, sIdx: number) => {
                const itin = shift?.itinerary ?? [];

                return itin
                    .filter((it: any) => it?.kind === 'VISIT' && (it.startServiceTime || it.arrivalTime))
                    .map((it: any, idx: number) => {
                        const start = wallDate(it.startServiceTime || it.arrivalTime);
                        const end = wallDate(it.departureTime || it.startServiceTime);
                        if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

                        return {
                            id: `${rid}-${shift?.id ?? sIdx}-${it?.id ?? idx}`,
                            resourceId: rid,
                            name: visitMap.get(it.id) || 'Visit',
                            startDate: start,
                            endDate: end
                        };
                    })
                    .filter(Boolean) as any[];
            });
        });

        // Collect all VISIT items for KPI calculations
        const visitsArr = (out.vehicles ?? []).flatMap((veh: any) =>
            (veh.shifts ?? []).flatMap((shift: any) =>
                (shift.itinerary ?? []).filter((it: any) => it?.kind === 'VISIT')
            )
        );

        // KPIs
        const visits = visitsArr.length;
        const distanceMeters = visitsArr
            .map((it: any) => Number(it.travelDistanceMetersFromPreviousStandstill) || 0)
            .reduce((a: number, b: number) => a + b, 0);

        const travelSeconds = visitsArr
            .map((it: any) => parseDurationToSeconds(it.travelTimeFromPreviousStandstill || 'PT0S'))
            .reduce((a: number, b: number) => a + b, 0);

        setKpi({
            visits,
            distanceKm: distanceMeters / 1000,
            travelHours: travelSeconds / 3600
        });

        // Only keep events that match current resource set (dataset could change)
        const resourceIds = new Set(resources.map(r => r.id));
        const evtsFiltered = evts.filter((e: any) => resourceIds.has(e.resourceId));

        // Avoid unnecessary React renders
        const h = hashEvents(evtsFiltered);
        if (h !== lastHashRef.current) {
            lastHashRef.current = h;
            setEvents(evtsFiltered);
        }
    }

    /* Submit current input to Timefold and poll until a terminal status is reached */
    async function optimize() {
        if (!inputJson || optimizing) return; // guard: need data, and avoid double starts
        setOptimizing(true);

        try {
            const res: any = await ky
                .post(`/api/timefold/route-plans`, { json: { modelInput: inputJson } })
                .json();
            const id = res?.id;
            if (!id) throw new Error('Missing route plan id from Timefold');
            setRoutePlanId(id);

            if (pollRef.current) clearInterval(pollRef.current);

            const stop = () => {
                if (pollRef.current) {
                    clearInterval(pollRef.current);
                    pollRef.current = null;
                }
                setOptimizing(false);
            };

            pollRef.current = setInterval(async () => {
                try {
                    const rp = await ky.get(`/api/timefold/route-plans/${id}`).json<any>();
                    await apply(rp);

                    const status = rp?.metadata?.solverStatus || '';
                    const complete = rp?.metadata?.completeDateTime || null;
                    const terminal = ['SOLVED', 'TERMINATED_EARLY', 'SOLVING_COMPLETED', 'NOT_SOLVING', 'UNSOLVABLE'];

                    if (complete || terminal.includes(status)) {
                        stop();
                    }
                } catch (e) {
                    console.error('Polling failed', e);
                    stop();
                }
            }, 3000);
        } catch (err) {
            console.error('Optimize failed', err);
            setOptimizing(false);
        }
    }

    function handleVisitMove(p: { id: string; name: string; resourceId: string; startDate: Date; endDate: Date }) {
        console.log('handleVisitMove()', p);

        // TODO: next step — update schedule + allow re-submit to solver
    }

    return (
        <main className="wrap">
            <h1>CAIRE Work Sample</h1>
            <Header
                demoId={demoId}
                optimizing={optimizing}
                onOptimize={optimize}
            />
            <Kpis visits={kpi.visits} distanceKm={kpi.distanceKm} travelHours={kpi.travelHours} />
            <Schedule
                resources={resources}
                events={events}
                timeRanges={timeRanges}
                startDate={startDate}
                endDate={endDate}
                readOnly={optimizing}
                onVisitMove={(p) => {
                    console.log('Visit moved ->', p);
                    handleVisitMove(p);
                }}
            />
        </main>
    )
}