# Security Specification: Leaderboard System

## Data Invariants
1. A Score entry must have a non-empty name (max 50 chars).
2. A Score entry must have a score between 0 and 5.
3. A Score entry must have a time (seconds) as a number (supports decimals).
4. `createdAt` must be the server timestamp.
5. Scores are immutable once created (no updates, no deletes allowed by users).
6. The leaderboard is publicly readable by everyone.

## The "Dirty Dozen" Payloads (Deny cases)
1. **Empty Name**: `{ name: "", score: 10, time: 30, createdAt: request.time }` -> DENY
2. **Huge Name**: `{ name: "A".repeat(100), score: 10, time: 30, createdAt: request.time }` -> DENY
3. **Negative Score**: `{ name: "User", score: -1, time: 30, createdAt: request.time }` -> DENY
4. **Impossible Score**: `{ name: "User", score: 11, time: 30, createdAt: request.time }` -> DENY
5. **Wrong Score Type**: `{ name: "User", score: "10", time: 30, createdAt: request.time }` -> DENY
6. **Client Timestamp**: `{ name: "User", score: 10, time: 30, createdAt: "2023-01-01T00:00:00Z" }` -> DENY
7. **Missing Field**: `{ name: "User", score: 10, time: 30 }` (missing createdAt) -> DENY
8. **Extra Field (Shadow field)**: `{ name: "User", score: 10, time: 30, createdAt: request.time, isVerified: true }` -> DENY
9. **Invalid ID**: `match /leaderboard/!!!invalid!!!` -> DENY (via isValidId)
10. **Update Attempt**: Attempting to change a score for an existing document -> DENY
11. **Delete Attempt**: Attempting to delete a score -> DENY
12. **PII Injection**: Putting an email or phone in the name field (requires regex guard in theory, but here we focus on schema)

## The Test Runner
A `firestore.rules.test.ts` would verify these. (Omitted for brevity in this manual step but follows logic).
