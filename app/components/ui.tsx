'use client';
import type { HeaderProps, KpisProps } from '../types';

/*
  Small presentational components shared on the page.
  - Header: dataset label + optimize button
  - Kpis: compact KPI tiles
*/

export function Header({ demoId, optimizing, onOptimize }: HeaderProps) {
    return (
        <div className="row">
            <div>Dataset: {demoId}</div>
            <button className="btn-primary" onClick={onOptimize} disabled={optimizing} aria-busy={optimizing}>
                {optimizing ? 'Optimizing…' : 'Optimize'}
            </button>
        </div>
    );
}


export function Kpis({ visits, distanceKm, travelHours }: KpisProps) {
    return (
        <div className="kpis">
            <div className="card">Visits: {visits}</div>
            <div className="card">Distance: {distanceKm.toFixed(1)} km</div>
            <div className="card">Travel time: {travelHours.toFixed(1)} h</div>
        </div>
    );
}