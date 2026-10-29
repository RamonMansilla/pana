create type order_status as enum ('reservado', 'pagado', 'preparando', 'listo', 'retirado', 'cancelado');
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  pickup_code text not null unique,
  customer_name text,
  customer_rut text,
  product_name text not null default 'Pan corriente',
  kilos numeric(4,1) not null check (kilos > 0),
  total_clp integer not null check (total_clp >= 0),
  status order_status not null default 'reservado',
  payment_method text not null default 'local' check (payment_method in ('local', 'online_simulated')),
  estimated_minutes integer not null default 15 check (estimated_minutes between 1 and 240),
  ready_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.orders enable row level security;
create policy "Anyone can create an order" on public.orders for insert with check (true);
create policy "Customers can read orders by code" on public.orders for select using (true);
create policy "Authenticated staff can update orders" on public.orders for update to authenticated using (true) with check (true);

create or replace function public.mark_order_ready(order_id uuid)
returns public.orders language plpgsql security definer as $$
begin
  update public.orders set status = 'listo', ready_at = now() where id = order_id;
  return (select o from public.orders o where o.id = order_id);
end; $$;
