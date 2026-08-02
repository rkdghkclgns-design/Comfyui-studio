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

-- Logged-in users may post only as themselves. Checking user_id alone is not enough:
-- username/avatar_url are display identity, and leaving them free lets any account
-- impersonate the project's own handle on posts that carry runnable workflow JSON.
drop policy if exists "showcase_posts_insert_own" on public.showcase_posts;
create policy "showcase_posts_insert_own"
  on public.showcase_posts for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and username = coalesce(
      auth.jwt() -> 'user_metadata' ->> 'user_name',
      auth.jwt() -> 'user_metadata' ->> 'preferred_username',
      'anonymous'
    )
  );

-- Users can delete only their own posts
drop policy if exists "showcase_posts_delete_own" on public.showcase_posts;
create policy "showcase_posts_delete_own"
  on public.showcase_posts for delete
  to authenticated
  using (auth.uid() = user_id);

-- No UPDATE policy: edits are not supported, so RLS denies them by default.

create index if not exists showcase_posts_created_at_idx
  on public.showcase_posts (created_at desc);
