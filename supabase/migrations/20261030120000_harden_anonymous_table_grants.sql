-- Restrict anonymous database access to public church content only.
-- Row Level Security remains enabled and continues to filter published rows.
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM anon;

GRANT SELECT ON TABLE
  public.church_congregations,
  public.church_gallery,
  public.church_ministries,
  public.church_page_content,
  public.church_posts,
  public.church_resources
TO anon;

REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM anon;
