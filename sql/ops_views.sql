-- v_ops_company_health: último overall por empresa
create or replace view v_ops_company_health as
select
  c.id as company_id,
  c.name as company_name,
  (ctm.scores->>'overall')::int as overall,
  ctm.vendor,
  ctm."updatedAt" as updated_at
from "Company" c
join "CompanyTechMaturity" ctm on ctm."companyId" = c.id
qualify row_number() over (partition by c.id order by ctm."updatedAt" desc) = 1;

-- v_ops_run_summary: runs recentes e duração
create or replace view v_ops_run_summary as
select
  r.id, r."companyId", r.vendor, r.status,
  r."startedAt", r."finishedAt",
  extract(epoch from (coalesce(r."finishedAt", now()) - r."startedAt"))::int as duration_sec
from "IngestRun" r
order by r."startedAt" desc;

-- rpc: olv_ops_counts
create or replace function olv_ops_counts()
returns json language sql stable as $$
  with a as (select count(*) as companies from "Company"),
       b as (select count(*) as monitors from "CompanyMonitor" where active = true),
       c as (select count(*) as runs24 from "IngestRun" where "startedAt" >= now() - interval '24 hours'),
       d as (select count(*) as techsignals from "TechSignals"),
       e as (select count(*) as firmo from "Firmographics"),
       f as (select count(*) as maturity from "CompanyTechMaturity")
  select json_build_object(
    'companies', (select companies from a),
    'monitors', (select monitors from b),
    'runs24', (select runs24 from c),
    'techsignals', (select techsignals from d),
    'firmographics', (select firmo from e),
    'maturity', (select maturity from f)
  );
$$;