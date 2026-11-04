import { memo } from "react";
import { DIFFICULTY_META, WHEEL_COLORS } from "@/constants/difficulty";
import type { Punishment } from "@/types";

const CENTER = 300;
const OUTER_RADIUS = 282;
const INNER_RADIUS = 76;
const LABEL_RADIUS = 250;
const MARQUEE_DOTS = 28;

function polarToCartesian(
  radius: number,
  angleDegrees: number,
): { x: number; y: number } {
  const radians = (angleDegrees * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(radians),
    y: CENTER + radius * Math.sin(radians),
  };
}

function buildSegmentPath(
  index: number,
  segmentCount: number,
  gapDegrees: number,
): string {
  const segmentAngle = 360 / segmentCount;
  const startAngle = -90 + index * segmentAngle + gapDegrees / 2;
  const endAngle = -90 + (index + 1) * segmentAngle - gapDegrees / 2;
  const largeArc = segmentAngle - gapDegrees > 180 ? 1 : 0;

  const outerStart = polarToCartesian(OUTER_RADIUS, startAngle);
  const outerEnd = polarToCartesian(OUTER_RADIUS, endAngle);
  const innerEnd = polarToCartesian(INNER_RADIUS, endAngle);
  const innerStart = polarToCartesian(INNER_RADIUS, startAngle);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${OUTER_RADIUS} ${OUTER_RADIUS} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${INNER_RADIUS} ${INNER_RADIUS} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

function truncateLabel(title: string, segmentCount: number): string {
  const maxLength =
    segmentCount <= 8
      ? 34
      : segmentCount <= 12
        ? 24
        : segmentCount <= 18
          ? 18
          : segmentCount <= 24
            ? 13
            : 9;

  if (title.length <= maxLength) return title;
  return `${title.slice(0, maxLength - 1).trimEnd()}…`;
}

function labelFontSize(segmentCount: number): number {
  if (segmentCount <= 8) return 14;
  if (segmentCount <= 12) return 12.5;
  if (segmentCount <= 18) return 11;
  if (segmentCount <= 24) return 9.5;
  return 8;
}

function segmentColor(punishment: Punishment, index: number): string {
  const palette = WHEEL_COLORS[punishment.difficulty];
  return palette[index % palette.length] ?? "#7e22ce";
}

export const WheelSvg = memo(function WheelSvg({
  punishments,
}: {
  punishments: readonly Punishment[];
}) {
  const count = punishments.length;
  const segmentAngle = count > 0 ? 360 / count : 360;
  const gapDegrees = count > 1 ? Math.min(0.7, segmentAngle * 0.04) : 0;
  const fontSize = labelFontSize(count);

  return (
    <svg
      viewBox="0 0 600 600"
      className="size-full"
      role="img"
      aria-label={`Punishment wheel with ${count} active ${
        count === 1 ? "punishment" : "punishments"
      }`}
    >
      <defs>
        <radialGradient id="wheel-sheen" cx="38%" cy="28%" r="78%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="42%" stopColor="#ffffff" stopOpacity="0.03" />
          <stop offset="100%" stopColor="#05030d" stopOpacity="0.34" />
        </radialGradient>
        <linearGradient id="wheel-rim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="33%" stopColor="#c084fc" />
          <stop offset="66%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>
        <radialGradient id="wheel-hub-ring" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#2e1d53" />
          <stop offset="100%" stopColor="#0b0716" />
        </radialGradient>
      </defs>

      <circle
        cx={CENTER}
        cy={CENTER}
        r={OUTER_RADIUS + 9}
        fill="#080511"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1"
      />

      {count === 0 && (
        <circle
          cx={CENTER}
          cy={CENTER}
          r={(OUTER_RADIUS + INNER_RADIUS) / 2}
          fill="none"
          stroke="#241a3e"
          strokeWidth={OUTER_RADIUS - INNER_RADIUS}
        />
      )}

      {count === 1 && (
        <circle
          cx={CENTER}
          cy={CENTER}
          r={(OUTER_RADIUS + INNER_RADIUS) / 2}
          fill="none"
          stroke={segmentColor(punishments[0]!, 0)}
          strokeWidth={OUTER_RADIUS - INNER_RADIUS}
        />
      )}

      {count > 1 &&
        punishments.map((punishment, index) => (
          <path
            key={punishment.id}
            d={buildSegmentPath(index, count, gapDegrees)}
            fill={segmentColor(punishment, index)}
            stroke="rgba(7,5,16,0.75)"
            strokeWidth="1.4"
          >
            <title>
              {punishment.title} — {DIFFICULTY_META[punishment.difficulty].label}
            </title>
          </path>
        ))}

      <circle
        cx={CENTER}
        cy={CENTER}
        r={OUTER_RADIUS}
        fill="url(#wheel-sheen)"
        pointerEvents="none"
      />

      {count > 1 &&
        punishments.map((punishment, index) => {
          const midAngle = -90 + (index + 0.5) * segmentAngle;
          const point = polarToCartesian(LABEL_RADIUS, midAngle);
          const flipped = midAngle > 90 && midAngle < 270;
          const rotation = flipped ? midAngle + 180 : midAngle;

          return (
            <text
              key={`label-${punishment.id}`}
              x={point.x}
              y={point.y}
              transform={`rotate(${rotation} ${point.x} ${point.y})`}
              textAnchor={flipped ? "start" : "end"}
              dominantBaseline="middle"
              className="wheel-label"
              fontSize={fontSize}
            >
              {truncateLabel(punishment.title, count)}
            </text>
          );
        })}

      {count === 1 &&
        (() => {
          const point = polarToCartesian(LABEL_RADIUS, -90);
          return (
            <text
              x={point.x}
              y={point.y}
              transform={`rotate(-90 ${point.x} ${point.y})`}
              textAnchor="end"
              dominantBaseline="middle"
              className="wheel-label"
              fontSize={14}
            >
              {truncateLabel(punishments[0]!.title, 1)}
            </text>
          );
        })()}

      <circle
        cx={CENTER}
        cy={CENTER}
        r={OUTER_RADIUS + 3}
        fill="none"
        stroke="url(#wheel-rim)"
        strokeWidth="5"
        opacity="0.9"
      />

      {Array.from({ length: MARQUEE_DOTS }).map((_, index) => {
        const angle = (index / MARQUEE_DOTS) * 360 - 90;
        const point = polarToCartesian(OUTER_RADIUS + 9, angle);
        const colors = ["#f472b6", "#c084fc", "#38bdf8", "#fb923c"];
        return (
          <circle
            key={`dot-${index}`}
            cx={point.x}
            cy={point.y}
            r={index % 2 === 0 ? 3 : 2.2}
            fill={colors[index % colors.length] ?? "#f472b6"}
            className="marquee-dot"
            style={{ animationDelay: `${(index % 7) * 0.18}s` }}
          />
        );
      })}

      <circle
        cx={CENTER}
        cy={CENTER}
        r={INNER_RADIUS + 11}
        fill="url(#wheel-hub-ring)"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1"
      />
      <circle
        cx={CENTER}
        cy={CENTER}
        r={INNER_RADIUS + 3}
        fill="none"
        stroke="rgba(244,114,182,0.18)"
        strokeWidth="1"
      />
    </svg>
  );
});
