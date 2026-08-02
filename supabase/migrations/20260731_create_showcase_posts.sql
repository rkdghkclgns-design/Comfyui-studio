-- ComfyUI Studio showcase board (migrated from the paused NexGen project)
-- Target project: joha-gallery (etasxbaorwgjoofdxean)
create table if not exists public.showcase_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  username text not null default 'anonymous',
  avatar_url text,
  title text not null,
  description text,
  workflow_json text not null,
  tags text[] not null default '{}',
  category text not null default 't2i',
  created_at timestamptz not null default now(),

  -- Client-side maxLength is trivially bypassed via the REST API. Without a size
  -- cap one account can exhaust the project's storage quota, which would take the
  -- other apps sharing this database down with it.
  constraint showcase_posts_title_len check (char_length(title) between 1 and 100),
  constraint showcase_posts_desc_len check (description is null or char_length(description) <= 500),
  constraint showcase_posts_json_len check (char_length(workflow_json) <= 200000),
  constraint showcase_posts_tags_len check (cardinality(tags) <= 10),
  constraint showcase_posts_username_len check (char_length(username) between 1 and 64),
  constraint showcase_posts_category check (
    category in ('t2i','i2i','inpaint','upscale','t2v','i2v','controlnet','lora','batch')
  ),
  -- Avatars are rendered in every visitor's browser. Restricting the host stops a
  -- poster from pointing it at their own server to harvest visitor IPs.
  constraint showcase_posts_avatar_host check (
    avatar_url is null or avatar_url ~ '^https://avatars\.githubusercontent\.com/'
  )
);

comment on table public.showcase_posts is 'ComfyUI Studio showcase workflow posts. Namespaced/isolated from gallery tables.';

alter table public.showcase_posts enable row level security;

-- Anyone (including anonymous visitors) can browse the showcase
drop policy if exists "showcase_posts_select_all" on public.showcase_posts;
create policy "showcase_posts_select_all"
  on public.showcase_posts for select
  using (true);

-- Display identity is stamped server-side, never taken from the client.
--
-- An earlier version compared username against auth.jwt() -> 'user_metadata', but
-- user_metadata is writable by the end user (supabase.auth.updateUser), so a poster
-- could set their own user_name and defeat the check. auth.identities.identity_data
-- is written by the OAuth provider at sign-in and is not client-writable, so that is
-- the trustworthy source. This matters because posts carry runnable workflow JSON:
-- a post impersonating the project's own handle is a credible malware vector.
create or replace function public.showcase_posts_set_identity()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_data jsonb;
  v_avatar text;
begin
  select i.identity_data into v_data
  from auth.identities i
  where i.user_id = new.user_id and i.provider = 'github'
  order by i.last_sign_in_at desc nulls last
  limit 1;

  new.username := left(coalesce(
    v_data ->> 'user_name',
    v_data ->> 'preferred_username',
    'anonymous'
  ), 64);

  -- Avatars render in every visitor's browser; an arbitrary host would let a poster
  -- harvest visitor IPs. Anything not from GitHub is dropped.
  v_avatar := v_data ->> 'avatar_url';
  new.avatar_url := case
    when v_avatar ~ '^https://avatars\.githubusercontent\.com/' then v_avatar
    else null
  end;

  return new;
end;
$$;

-- Trigger functions fire regardless of EXECUTE grants; exposing this at
-- /rest/v1/rpc/ would only widen the API surface.
revoke execute on function public.showcase_posts_set_identity() from public;
revoke execute on function public.showcase_posts_set_identity() from anon;
revoke execute on function public.showcase_posts_set_identity() from authenticated;

drop trigger if exists showcase_posts_identity on public.showcase_posts;
create trigger showcase_posts_identity
  before insert on public.showcase_posts
  for each row execute function public.showcase_posts_set_identity();

-- With the trigger owning display identity, the policy only proves ownership.
drop policy if exists "showcase_posts_insert_own" on public.showcase_posts;
create policy "showcase_posts_insert_own"
  on public.showcase_posts for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can delete only their own posts
drop policy if exists "showcase_posts_delete_own" on public.showcase_posts;
create policy "showcase_posts_delete_own"
  on public.showcase_posts for delete
  to authenticated
  using (auth.uid() = user_id);

-- No UPDATE policy: edits are not supported, so RLS denies them by default.

create index if not exists showcase_posts_created_at_idx
  on public.showcase_posts (created_at desc);
