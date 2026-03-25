insert into public.listings (
  title,
  description,
  source_name,
  source_url,
  category,
  city,
  state,
  zip,
  posted_at,
  dedupe_key
)
values
  (
    'Free brown sofa, pickup tonight',
    'Used brown sofa on the curb. Must pick up after 6 PM.',
    'manual',
    'https://example.com/free-sofa',
    'furniture',
    'Queens',
    'NY',
    '11368',
    timezone('utc', now()) - interval '2 hours',
    'seed:free-sofa'
  ),
  (
    'Free baby stroller',
    'Foldable stroller in working condition.',
    'manual',
    'https://example.com/free-stroller',
    'baby',
    'Brooklyn',
    'NY',
    '11211',
    timezone('utc', now()) - interval '5 hours',
    'seed:free-stroller'
  ),
  (
    'Free dresser with mirror',
    'Solid wood dresser, bring two people to carry it.',
    'manual',
    'https://example.com/free-dresser',
    'furniture',
    'Jersey City',
    'NJ',
    '07306',
    timezone('utc', now()) - interval '1 day',
    'seed:free-dresser'
  )
on conflict (dedupe_key) do nothing;
