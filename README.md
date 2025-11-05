# CAIRE Work Sample — Timefold + Bryntum Scheduler Prototype

This project implements a simplified version of the Caire AI scheduling workflow:
Next.js (App Router) + TypeScript + Timefold AI + Bryntum SchedulerPro.

It loads demo field-service routing data, visualizes employee shifts and breaks, and then displays optimized visit assignments returned from Timefold.

- Real optimization loop
- Progressive solver polling
- Shifts + breaks rendered as resource time ranges
- Visits applied cleanly on top
- Minimal UI + KPI tiles
- Fully typed, commented, modular structure

---

## Features

| Capability | Status |
|---|---|
Load Timefold demo input | ✅  
Render technicians + shifts + breaks | ✅  
Trigger schedule optimization | ✅  
Poll solver & update timeline progressively | ✅  
Overlay visits respecting work hours | ✅  
KPIs: visits, distance, travel time | ✅  
Clean UI & good data flow | ✅  

### Bonus functionality

| Bonus Item | Status |
|---|---|
Drag-and-drop visit editing in SchedulerPro | ✅ UI done (manual moves reflected)  
Prevent drag during solving | ✅  
Design for re-submit edited plan to solver | ✅ architecture + notes  
Re-solve after manual drag | ⏳ intentionally scoped out  
Utilization metric | ⏳ not included (time trade-off) 

> The UI fully supports drag-and-drop editing of visits.  
> After moving a visit, the schedule updates immediately on screen and state is preserved.

> Next step (not implemented due to time vs value) would be feeding the modified 
> event back into the Timefold model input and triggering a new solve. I chose to focus 
> on correctness, clarity, and architecture rather than hacking in a partial re-optimize cycle.
---

## Architecture

| File | Responsibility |
|---|---|
app/page.tsx | Routing logic, solver calls, event mapping  
app/components/Schedule.tsx | SchedulerPro wrapper (client)  
app/components/ui.tsx | Header + KPI cards  
app/lib/time.ts | TZ-safe utilities (duration, wall time, hashing)  
app/types.ts | Domain types (vehicles, shifts, visits)  
app/api/timefold/* | Next API routes proxying Timefold  

Design goals:
- Keep architecture simple but logical
- Strong typing where meaningful
- Extract UI + date helpers for clarity
- Avoid unnecessary abstraction for a prototype

---

## Installation

### Bryntum trial setup

```bash
npm config set "@bryntum:registry=https://npm.bryntum.com"
npm login --registry=https://npm.bryntum.com
# username = your email (replace @ with ..)
# password = your trial key
```

### Install deps

```bash
npm install
```

### Env variables

Create `.env.local`:

```env
TIMEFOLD_API_BASE=https://app.timefold.ai/api/models/field-service-routing/v1
TIMEFOLD_API_KEY=YOUR_KEY_HERE
```

### Run dev server

```bash
npm run dev
```

---

## How it works

1) Load demo dataset
2) Convert shifts + breaks → Scheduler resource time ranges
3) User clicks Optimize
4) POST `/route-plans`
5) Poll result every 3 seconds
6) Render partial solutions live
7) Stop on best solution and keep it visible

Visits render **only once Timefold assigns them**, keeping baseline clean.

---

## UX Notes

- Clean minimal layout
- Optimize button disables while solving
- KPI cards above scheduler
- Scroll isolated to scheduler (not full page)
- Timeline span auto-calculated from data
- Visit blocks labeled by Visit name

---

## AI Usage

AI (ChatGPT) used for:
- Pair-programming style iteration
- Refactoring + type helpers
- TZ bug troubleshooting
- Commenting + documentation structure

All architecture decisions, integration, and debugging done manually with AI assist.

---

## Time Spent

Approx. 8–10 hours including:
- Setup + integration
- Bryntum learning curve
- Solver polling logic
- Debugging + UX polish
- Documentation

---

## Delivery Checklist

✅ Functional prototype  
✅ Timefold API integration  
✅ Bryntum visualization  
✅ Polling + live updates  
✅ Types + comments + small modules  
✅ README + instructions  