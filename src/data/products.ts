import snapshotJson from './generated/safety-gate-snapshot.json'
import { buildProducts } from './productData'
import type { SafetyGateSnapshot } from './safetyGateSnapshot'

export const safetyGateSnapshot = snapshotJson as SafetyGateSnapshot
export const AS_OF_DATE = safetyGateSnapshot.generatedAt
export const DATA_AS_OF_DATE = safetyGateSnapshot.latestReportDate
export const products = buildProducts(safetyGateSnapshot)

// CRA product-level records are intentionally not inferred from Safety Gate.
// The adapter exposes explicit `not-reviewed` coverage until an approved CRA
// evidence manifest is supplied by a responsible owner.
