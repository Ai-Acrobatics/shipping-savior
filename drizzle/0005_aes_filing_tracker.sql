-- AI-12006: AES filing tracker — per-shipment AES status with CBP ACE deep links.
--
-- Adds three columns to the shipments table:
--   aes_status     — 'tbd' | 'filed' | 'accepted'  (TBD until filed)
--   aes_number     — AES ITN / XTN reference number
--   ace_deep_link  — Direct link to the CBP ACE portal entry for this filing
--
-- Audit context: 64/204 real rows lacked AES# as of 2026-06 — the biggest
-- review-queue gap. This tracker closes that gap by making AES status a
-- first-class column on every shipment.

ALTER TABLE "shipments"
  ADD COLUMN IF NOT EXISTS "aes_status" varchar(20) DEFAULT 'tbd';

ALTER TABLE "shipments"
  ADD COLUMN IF NOT EXISTS "aes_number" varchar(50);

ALTER TABLE "shipments"
  ADD COLUMN IF NOT EXISTS "ace_deep_link" text;
