import { useState } from 'react';
import { editRoom, allRoomViews, useRoomDrafts } from '../../data/roomViewDraft';
import { complete, pitchToSetup, toDeg } from '../../features/pano/panoLimits';

// SETUP MODE — shown only with ?calibrate on the URL, on every floor's 360° view, for
// whatever the view is locked to: the room on screen, or a plan-less floor itself. Set by
// eye where the view opens and how far it turns, try it at once, then copy the result
// out for src/data/roomViews.js. Nothing is saved by the app (roomViewDraft.js).
//
// The edge buttons record the EDGE OF THE SCREEN in that direction: turn until the left
// edge of the screen sits where the room's outlook should stop, press "Left edge", and
// the same for the right.

export const SETUP_MODE =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('calibrate');

const r1 = (n) => Math.round(n * 10) / 10;
const wrap180 = (d) => r1(((((d + 180) % 360) + 360) % 360) - 180);

// One room as a JS literal for roomViews.js: unset parts and half-set ranges left out.
const clean = (rv) => {
  const out = {};
  if (rv?.start) out.start = rv.start;
  if (complete(rv?.yaw)) out.yaw = rv.yaw;
  if (complete(rv?.pitch)) out.pitch = rv.pitch;
  return out;
};

const literal = (value) =>
  JSON.stringify(value)
    .replace(/"(\w+)":/g, '$1: ')
    .replace(/,/g, ', ')
    .replace(/\{/g, '{ ')
    .replace(/\}/g, ' }');

export function RoomSetupPanel({ room, roomView, getView, readoutRef }) {
  const drafts = useRoomDrafts();
  const [note, setNote] = useState(null);
  const [fallback, setFallback] = useState(null);

  const { planId, areaId, label } = room;
  const yaw = roomView?.yaw ?? [null, null];

  const capture = (fn) => () => {
    const v = getView();
    if (v) fn(v);
  };

  const setStart = capture((v) =>
    editRoom(
      planId,
      areaId,
      {
        start: { yaw: wrap180(toDeg(v.yaw)), pitch: r1(pitchToSetup(v.pitch)), fov: r1(toDeg(v.fov)) },
      },
      roomView,
    ),
  );

  const setEdge = (side) =>
    capture((v) => {
      const edge = wrap180(toDeg(side === 'left' ? v.yaw - v.hfov / 2 : v.yaw + v.hfov / 2));
      editRoom(planId, areaId, { yaw: side === 'left' ? [edge, yaw[1]] : [yaw[0], edge] }, roomView);
    });

  const copy = async (text, what) => {
    try {
      await navigator.clipboard.writeText(text);
      setFallback(null);
      setNote(`${what} copied — paste into src/data/roomViews.js`);
    } catch {
      setFallback(text);
      setNote('Clipboard blocked — copy the text below');
    }
  };

  const copyRoom = () =>
    copy(`      ${areaId}: ${literal(clean(roomView))},`, label);

  const copyAll = () => {
    const all = allRoomViews(drafts);
    const body = Object.entries(all)
      .map(([plan, rooms]) => {
        const lines = Object.entries(rooms)
          .map(([id, rv]) => `    ${id}: ${literal(clean(rv))},`)
          .join('\n');
        return `  '${plan}': {\n${lines}\n  },`;
      })
      .join('\n');
    copy(`export const ROOM_VIEWS = {\n${body}\n};`, 'All rooms');
  };

  const fmt = (n) => (Number.isFinite(n) ? `${n}°` : '—');
  const start = roomView?.start;

  return (
    <div
      data-plan-chrome
      className="glass absolute z-20 right-(--screen-margin) top-[calc(var(--screen-margin)+var(--chrome-top))] flex w-[clamp(16rem,20vw,21rem)] flex-col gap-[0.8em] p-[clamp(0.8rem,1vw,1.1rem)]"
      style={{
        border: '1px dashed rgb(var(--gold-rgb) / 0.55)',
        boxShadow: '0 30px 70px -30px rgb(2 12 11 / 0.85)',
      }}
    >
      <div className="flex flex-col gap-[0.25em]">
        <span className="eyebrow">Setup · {label}</span>
        <span className="text-micro uppercase tracking-[0.14em] text-w-cream/50">
          {planId} · {areaId}
        </span>
        <span ref={readoutRef} className="text-caption tabular-nums text-w-cream" />
      </div>

      <Section
        title="Start view"
        value={start ? `${fmt(start.yaw)} · ${fmt(start.pitch)} · zoom ${fmt(start.fov)}` : 'Not set'}
      >
        <Btn onClick={setStart}>Set start view</Btn>
        <Btn onClick={() => editRoom(planId, areaId, { start: null }, roomView)} quiet>
          Clear
        </Btn>
      </Section>

      <Section title="Outlook left → right" value={`${fmt(yaw[0])} → ${fmt(yaw[1])}`}>
        <Btn onClick={setEdge('left')}>Left edge</Btn>
        <Btn onClick={setEdge('right')}>Right edge</Btn>
        <Btn onClick={() => editRoom(planId, areaId, { yaw: null }, roomView)} quiet>
          Unlock
        </Btn>
      </Section>

      <div className="flex flex-wrap gap-[0.5em] border-t border-w-gold/30 pt-[0.8em]">
        <Btn onClick={copyRoom} strong>
          Copy this room
        </Btn>
        <Btn onClick={copyAll} strong>
          Copy all rooms
        </Btn>
      </div>

      {note ? <span className="text-micro text-w-gold">{note}</span> : null}
      {fallback ? (
        <textarea
          readOnly
          value={fallback}
          onFocus={(e) => e.target.select()}
          className="h-[7rem] w-full resize-none bg-w-void/60 p-[0.5em] font-mono text-[0.7rem] text-w-cream"
        />
      ) : null}
    </div>
  );
}

function Section({ title, value, children }) {
  return (
    <div className="flex flex-col gap-[0.45em] border-t border-w-line/60 pt-[0.6em]">
      <div className="flex items-baseline justify-between gap-[0.8em]">
        <span className="text-micro uppercase tracking-[0.18em] text-w-cream/55">{title}</span>
        <span className="text-micro tabular-nums text-w-cream">{value}</span>
      </div>
      <div className="flex flex-wrap gap-[0.4em]">{children}</div>
    </div>
  );
}

function Btn({ children, onClick, quiet = false, strong = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-[0.7em] py-[0.35em] text-micro uppercase tracking-[0.14em] transition-colors duration-300 ${
        strong
          ? 'border-w-gold bg-w-gold/15 text-w-gold hover:bg-w-gold hover:text-w-deep'
          : quiet
            ? 'border-w-line text-w-cream/55 hover:text-w-cream'
            : 'border-w-gold/40 text-w-cream hover:border-w-gold hover:text-w-gold'
      }`}
    >
      {children}
    </button>
  );
}
