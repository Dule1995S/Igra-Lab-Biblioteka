-- Probna knjižica. Radni list otpremiti u bucket 'worksheets' na putanju ispod.
insert into public.booklets (slug, title, age_group, description, deck, published, sort_order)
values ('brojevi-i-kolicine-do-20', 'Бројеви и количине до 20', '5',
        'Додирни, преброј, повежи: бројеви до 10, пуна десетица и бројеви до 20.',
        'brojevi-i-kolicine-do-20', true, 1)
on conflict (slug) do nothing;

insert into public.worksheets (booklet_id, title, file_path, sort_order)
select id, 'Радни лист: Бројеви и количине до 20', 'brojevi-i-kolicine-do-20/radni-list.pdf', 1
from public.booklets where slug = 'brojevi-i-kolicine-do-20'
and not exists (select 1 from public.worksheets w where w.booklet_id = booklets.id);
