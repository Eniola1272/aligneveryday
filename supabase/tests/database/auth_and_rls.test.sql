begin;

create extension if not exists pgtap with schema extensions;
select plan(18);

-- Three auth identities: the active learner, a future public learner, and a
-- private learner whose records must remain completely isolated.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'one@example.com', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Learner One"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'two@example.com', '', now(), '{"provider":"google","providers":["google"]}', '{"name":"Learner Two"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'three@example.com', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Learner Three"}', now(), now());

select is((select count(*) from public.profiles where id = '10000000-0000-0000-0000-000000000001'), 1::bigint, 'email signup creates exactly one profile');
select is((select count(*) from public.profiles where id = '20000000-0000-0000-0000-000000000002'), 1::bigint, 'Google signup creates exactly one profile');
select is((select full_name from public.profiles where id = '20000000-0000-0000-0000-000000000002'), 'Learner Two', 'Google name metadata hydrates the profile');

insert into public.courses (id, user_id, title, platform, status)
values
  ('11000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'My private course', 'YouTube', 'in_progress'),
  ('22000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Public completed course', 'Coursera', 'completed'),
  ('22000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'Public learner unfinished course', 'Udemy', 'in_progress'),
  ('33000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', 'Someone else private course', 'Udemy', 'in_progress');

insert into public.todos (id, user_id, course_id, task_title)
values
  ('11100000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001', 'My private task'),
  ('33300000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', '33000000-0000-0000-0000-000000000003', 'Someone else private task');

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}';

select is((select count(*) from public.courses where id = '11000000-0000-0000-0000-000000000001'), 1::bigint, 'learner can read their course');
select is((select count(*) from public.todos where id = '11100000-0000-0000-0000-000000000001'), 1::bigint, 'learner can read their todo');
select is((select count(*) from public.courses where id = '33000000-0000-0000-0000-000000000003'), 0::bigint, 'learner cannot read another private course');
select is((select count(*) from public.todos where id = '33300000-0000-0000-0000-000000000003'), 0::bigint, 'learner cannot read another private todo');
select is_empty($$ update public.courses set title = 'stolen' where id = '33000000-0000-0000-0000-000000000003' returning id $$, 'learner cannot update another course');
select is_empty($$ delete from public.courses where id = '33000000-0000-0000-0000-000000000003' returning id $$, 'learner cannot delete another course');
select throws_ok($$ insert into public.courses (user_id, title, platform) values ('30000000-0000-0000-0000-000000000003', 'injected', 'Custom') $$, '42501', null, 'learner cannot insert a course for another user');
select is_empty($$ update public.todos set task_title = 'stolen' where id = '33300000-0000-0000-0000-000000000003' returning id $$, 'learner cannot update another todo');
select is_empty($$ delete from public.todos where id = '33300000-0000-0000-0000-000000000003' returning id $$, 'learner cannot delete another todo');
select throws_ok($$ insert into public.todos (user_id, task_title) values ('30000000-0000-0000-0000-000000000003', 'injected') $$, '42501', null, 'learner cannot insert a todo for another user');

reset role;
update public.profiles set portfolio_public = true where id = '20000000-0000-0000-0000-000000000002';
set local role anon;
set local "request.jwt.claims" = '{"role":"anon"}';

select results_eq($$ select id from public.profiles order by id $$, $$ values ('20000000-0000-0000-0000-000000000002'::uuid) $$, 'anonymous visitors see only public profiles');
select results_eq($$ select id from public.courses order by id $$, $$ values ('22000000-0000-0000-0000-000000000002'::uuid) $$, 'anonymous visitors see only completed courses from public portfolios');
select is((select count(*) from public.todos), 0::bigint, 'public portfolios never expose todos');
select is_empty($$ update public.courses set title = 'changed' where id = '22000000-0000-0000-0000-000000000002' returning id $$, 'anonymous visitors cannot mutate public courses');
select is_empty($$ delete from public.profiles where id = '20000000-0000-0000-0000-000000000002' returning id $$, 'anonymous visitors cannot mutate public profiles');

select * from finish();
rollback;
