-- Fix: auctions.winner_id incorrectly had two FK constraints pointing to
-- different tables (profiles.id AND bids.id), breaking PostgREST schema cache.
-- Drop the wrong one — winner_id should only reference profiles(id).
ALTER TABLE auctions DROP CONSTRAINT IF EXISTS auctions_winning_bid_fkey;

-- Drop unused generated column (not referenced anywhere in the app)
ALTER TABLE orders DROP COLUMN IF EXISTS total_amount;

-- Verify: auctions.winning_bid_id already has the correct FK to bids(id) via
-- auctions_winning_bid_id_fkey — nothing to change there.