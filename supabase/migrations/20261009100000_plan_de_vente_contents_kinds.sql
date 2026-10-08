-- Plan de vente interactif — videos and documents (step 17).
-- Two new kinds of media, added on their own: a value added to an enum
-- cannot be used in the transaction that adds it.

alter type public.media_kind add value if not exists 'video';
alter type public.media_kind add value if not exists 'document';
