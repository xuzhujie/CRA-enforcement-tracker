import snapshotJson from '../src/data/generated/safety-gate-snapshot.json'
import { buildProducts } from '../src/data/productData'
import { craReviewRecords, validateCraReviewInputs } from '../src/data/craReview'
import type { SafetyGateSnapshot } from '../src/data/safetyGateSnapshot'
import { validateProducts } from '../src/lib/dataValidation'

const snapshot = snapshotJson as SafetyGateSnapshot
const products = buildProducts(snapshot)
const errors = [
  ...validateCraReviewInputs(craReviewRecords),
  ...validateProducts(products, snapshot),
]

if (errors.length > 0) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log(`Data validation passed: ${products.length} products, ${snapshot.alerts.length} Safety Gate alerts, CRA coverage explicit`) 
}
