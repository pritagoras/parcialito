-- ACTIVAR TU CUENTA COMO ADMINISTRADOR DE PARCIALITO
-- 1) Primero crea TU usuario desde Supabase > Authentication > Users > Add user.
--    Usa tu propio correo y define allí una contraseña segura.
-- 2) Reemplaza el correo de abajo por el mismo correo exacto.
-- 3) Ejecuta este SQL una sola vez desde el SQL Editor de Supabase.
-- No compartas la contraseña ni la agregues a GitHub.

insert into private.parcialito_admins (user_id)
select id
from auth.users
where lower(email) = lower('REEMPLAZAR_POR_TU_CORREO')
on conflict (user_id) do nothing;

-- Verificación: debe devolver tu UUID y la fecha de alta.
select a.user_id, u.email, a.creado
from private.parcialito_admins a
join auth.users u on u.id = a.user_id;
