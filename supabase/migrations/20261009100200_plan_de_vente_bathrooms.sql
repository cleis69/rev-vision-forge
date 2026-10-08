-- Plan de vente interactif — bathrooms of a lot (step 17).
-- Next to the bedrooms: the number of bathrooms, shown on the cards, the
-- sheet and the comparison of the public pages.

alter table public.lots
  add column salles_de_bain smallint check (salles_de_bain between 0 and 50);

-- Same view, one more column at the end (grants are kept).
create or replace view public.public_lots
with (security_invoker = false)
as
select
  l.id,
  l.project_id,
  l.numero,
  l.type,
  l.surface_habitable,
  l.surface_terrain,
  l.chambres,
  case when p.show_prices then l.prix end as prix,
  l.statut,
  l.description,
  l.features,
  l.sort_order,
  l.updated_at,
  l.niveau,
  l.salles_de_bain
from public.lots l
join public.projects p on p.id = l.project_id
where p.status = 'published';
