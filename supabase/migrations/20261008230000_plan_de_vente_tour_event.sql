-- Plan de vente interactif — 360° tours on the public pages (step 16): opening a tour is an event.
alter type public.lot_event_type add value if not exists 'visite_360';
