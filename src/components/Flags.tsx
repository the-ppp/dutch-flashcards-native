import { ComponentType } from 'react'
import Svg, { Line, Rect } from 'react-native-svg'

export const FLAG_WIDTH = 20
export const FLAG_HEIGHT = 14

export function NlFlag() {
  return (
    <Svg width={FLAG_WIDTH} height={FLAG_HEIGHT} viewBox="0 0 30 20">
      <Rect x={0} y={0} width={30} height={20} rx={2} fill="#ffffff" />
      <Rect x={0} y={0} width={30} height={6.67} fill="#ae1c28" />
      <Rect x={0} y={13.33} width={30} height={6.67} fill="#21468b" />
    </Svg>
  )
}

export function GbFlag() {
  return (
    <Svg width={FLAG_WIDTH} height={FLAG_HEIGHT} viewBox="0 0 30 20">
      <Rect x={0} y={0} width={30} height={20} rx={2} fill="#00247d" />
      <Line x1={0} y1={0} x2={30} y2={20} stroke="#ffffff" strokeWidth={4} />
      <Line x1={30} y1={0} x2={0} y2={20} stroke="#ffffff" strokeWidth={4} />
      <Line x1={0} y1={0} x2={30} y2={20} stroke="#cf142b" strokeWidth={1.6} />
      <Line x1={30} y1={0} x2={0} y2={20} stroke="#cf142b" strokeWidth={1.6} />
      <Rect x={0} y={7} width={30} height={6} fill="#ffffff" />
      <Rect x={12} y={0} width={6} height={20} fill="#ffffff" />
      <Rect x={0} y={8.5} width={30} height={3} fill="#cf142b" />
      <Rect x={13.5} y={0} width={3} height={20} fill="#cf142b" />
    </Svg>
  )
}

export function DeFlag() {
  return (
    <Svg width={FLAG_WIDTH} height={FLAG_HEIGHT} viewBox="0 0 30 20">
      <Rect x={0} y={0} width={30} height={20} rx={2} fill="#ffce00" />
      <Rect x={0} y={0} width={30} height={6.67} fill="#000000" />
      <Rect x={0} y={6.67} width={30} height={6.67} fill="#dd0000" />
    </Svg>
  )
}

export function EsFlag() {
  return (
    <Svg width={FLAG_WIDTH} height={FLAG_HEIGHT} viewBox="0 0 30 20">
      <Rect x={0} y={0} width={30} height={20} rx={2} fill="#aa151b" />
      <Rect x={0} y={5} width={30} height={10} fill="#f1bf00" />
    </Svg>
  )
}

export function FrFlag() {
  return (
    <Svg width={FLAG_WIDTH} height={FLAG_HEIGHT} viewBox="0 0 30 20">
      <Rect x={0} y={0} width={30} height={20} rx={2} fill="#ffffff" />
      <Rect x={0} y={0} width={10} height={20} fill="#0055a4" />
      <Rect x={20} y={0} width={10} height={20} fill="#ef4135" />
    </Svg>
  )
}

export function ItFlag() {
  return (
    <Svg width={FLAG_WIDTH} height={FLAG_HEIGHT} viewBox="0 0 30 20">
      <Rect x={0} y={0} width={30} height={20} rx={2} fill="#ffffff" />
      <Rect x={0} y={0} width={10} height={20} fill="#008c45" />
      <Rect x={20} y={0} width={10} height={20} fill="#cd212a" />
    </Svg>
  )
}

export function PlFlag() {
  return (
    <Svg width={FLAG_WIDTH} height={FLAG_HEIGHT} viewBox="0 0 30 20">
      <Rect x={0} y={0} width={30} height={20} rx={2} fill="#ffffff" />
      <Rect x={0} y={10} width={30} height={10} fill="#dc143c" />
    </Svg>
  )
}

export function PtFlag() {
  return (
    <Svg width={FLAG_WIDTH} height={FLAG_HEIGHT} viewBox="0 0 30 20">
      <Rect x={0} y={0} width={30} height={20} rx={2} fill="#da291c" />
      <Rect x={0} y={0} width={12} height={20} fill="#046a38" />
    </Svg>
  )
}

export function SvFlag() {
  return (
    <Svg width={FLAG_WIDTH} height={FLAG_HEIGHT} viewBox="0 0 30 20">
      <Rect x={0} y={0} width={30} height={20} rx={2} fill="#006aa7" />
      <Rect x={10} y={0} width={4} height={20} fill="#fecc02" />
      <Rect x={0} y={8} width={30} height={4} fill="#fecc02" />
    </Svg>
  )
}

export const FLAGS: Record<string, ComponentType> = {
  nl: NlFlag,
  de: DeFlag,
  es: EsFlag,
  fr: FrFlag,
  it: ItFlag,
  pl: PlFlag,
  pt: PtFlag,
  sv: SvFlag,
}
