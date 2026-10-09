-- Plan de vente interactif — floors of a 360° tour (step 18).
-- Each room can say on which floor it is (-1 for R-1, 0 for the ground
-- floor…): the tour then lists its rooms floor by floor.

alter table public.panoramas add column level smallint check (level between -9 and 99);
