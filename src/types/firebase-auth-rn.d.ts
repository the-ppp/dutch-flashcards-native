// firebase's package.json "exports" map lists a "types" condition before "react-native",
// so TypeScript always resolves firebase/auth's public (non-RN) declaration file and never
// sees getReactNativePersistence, even though Metro resolves the real RN build correctly at
// runtime. This augments the module with the type that's missing from that declaration file.
import type { Persistence } from '@firebase/auth'

declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: unknown): Persistence
}
