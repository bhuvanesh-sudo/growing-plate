create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  locale text default 'en-IN',
  created_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Children
create table public.children (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  dob date not null,
  sex text check (sex in ('male', 'female')) not null,
  weight_kg numeric(5,2),
  height_cm numeric(5,2),
  activity_level text default 'moderate' check (activity_level in ('sedentary', 'moderate', 'active')),
  allergies text[] default '{}',
  dietary_flags text[] default '{}',
  created_at timestamptz default now()
);

-- Foods
create table public.foods (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  food_group text not null check (food_group in ('grains','protein','vegetables','fruits','dairy','fats','other')),
  source text default 'icmr',
  calories_kcal numeric(8,2) default 0,
  protein_g     numeric(8,2) default 0,
  carbs_g       numeric(8,2) default 0,
  fat_g         numeric(8,2) default 0,
  fiber_g       numeric(8,2) default 0,
  calcium_mg    numeric(8,2) default 0,
  iron_mg       numeric(8,2) default 0,
  vitamin_d_mcg numeric(8,2) default 0,
  zinc_mg       numeric(8,2) default 0,
  grams_per_piece numeric(6,1),
  aliases text[] default '{}',
  created_at timestamptz default now()
);

create index foods_name_search on public.foods using gin (to_tsvector('english', name));

-- Nutrient targets (RDA reference)
create table public.nutrient_targets (
  id uuid primary key default uuid_generate_v4(),
  age_min_months int not null,
  age_max_months int not null,
  sex text check (sex in ('male', 'female', 'both')) default 'both',
  activity_level text default 'moderate',
  calories_kcal  int not null,
  protein_g      numeric(6,1) not null,
  carbs_g        numeric(6,1) not null,
  fat_g          numeric(6,1) not null,
  fiber_g        numeric(6,1) default 0,
  calcium_mg     numeric(6,1) default 0,
  iron_mg        numeric(6,1) default 0,
  vitamin_d_mcg  numeric(6,1) default 0,
  zinc_mg        numeric(6,1) default 0
);

-- Seed RDA targets
insert into public.nutrient_targets (age_min_months,age_max_months,sex,activity_level,calories_kcal,protein_g,carbs_g,fat_g,fiber_g,calcium_mg,iron_mg,vitamin_d_mcg,zinc_mg) values
(12,23,'both','moderate',1000,13,135,30,14,500,9,15,3),
(24,35,'both','moderate',1200,16,160,35,16,600,9,15,3.5),
(36,59,'both','moderate',1400,20,190,40,18,600,9,15,4),
(60,95,'both','moderate',1600,24,220,44,20,700,12,15,5),
(96,131,'male','moderate',1800,28,250,50,22,800,13,15,6),
(96,131,'female','moderate',1600,26,220,45,22,800,15,15,6),
(132,155,'male','moderate',2200,40,300,60,25,1200,15,15,8),
(132,155,'female','moderate',2000,40,270,55,25,1200,27,15,8),
(156,191,'male','moderate',2600,54,360,72,28,1200,17,15,11),
(156,191,'female','moderate',2200,52,300,61,26,1200,27,15,9),
(192,216,'male','moderate',3000,60,410,83,30,1200,17,15,11),
(192,216,'female','moderate',2400,55,330,67,26,1200,27,15,9);

-- Seed foods (Indian + global, common children's foods)
insert into public.foods (name,food_group,source,calories_kcal,protein_g,carbs_g,fat_g,fiber_g,iron_mg,calcium_mg,grams_per_piece) values
('White Rice (cooked)','grains','icmr',130,2.7,28.7,0.3,0.4,0.2,10,null),
('Whole Wheat Roti','grains','icmr',264,9.4,50,4.3,5,3.5,30,35),
('Idli (steamed)','grains','icmr',39,2,8.2,0.1,0.5,0.3,7,50),
('Dosa (plain)','grains','icmr',168,3.8,30,3.7,1.2,0.8,18,null),
('Oats (cooked)','grains','usda',71,2.5,12,1.4,1.7,1.1,11,null),
('Bread (whole wheat)','grains','usda',247,13,41,3.4,6,2.5,107,30),
('Upma','grains','icmr',150,4,25,4.5,1.5,1.2,20,null),
('Poha','grains','icmr',130,2.5,28,1,0.8,0.9,12,null),
('Toor Dal (cooked)','protein','icmr',116,6.8,20,0.4,3.8,1.6,20,null),
('Egg (boiled)','protein','usda',155,13,1.1,11,0,1.9,50,50),
('Chicken (cooked)','protein','usda',165,31,0,3.6,0,1,15,null),
('Paneer','dairy','icmr',265,18.3,1.2,20.8,0,0.2,208,null),
('Rajma (cooked)','protein','icmr',127,8.7,22.8,0.5,6.4,2.9,28,null),
('Chana (cooked)','protein','icmr',164,8.9,27.4,2.6,7.6,2.9,49,null),
('Spinach (cooked)','vegetables','usda',23,2.9,3.6,0.4,2.4,3.6,136,null),
('Carrot (raw)','vegetables','usda',41,0.9,9.6,0.2,2.8,0.3,33,null),
('Tomato','vegetables','usda',18,0.9,3.9,0.2,1.2,0.3,10,null),
('Peas (cooked)','vegetables','usda',84,5.4,15.6,0.2,5.5,1.5,27,null),
('Broccoli (cooked)','vegetables','usda',35,2.4,7.2,0.4,3.3,0.7,40,null),
('Banana','fruits','usda',89,1.1,22.8,0.3,2.6,0.3,5,120),
('Apple','fruits','usda',52,0.3,14,0.2,2.4,0.1,6,182),
('Mango','fruits','icmr',60,0.8,15,0.4,1.6,0.2,11,null),
('Orange','fruits','usda',47,0.9,11.8,0.1,2.4,0.1,40,131),
('Papaya','fruits','icmr',43,0.5,10.8,0.1,1.7,0.1,20,null),
('Whole Milk','dairy','icmr',61,3.2,4.8,3.3,0,0,113,null),
('Curd / Yogurt','dairy','icmr',61,3.5,4.7,3.3,0,0.1,121,null),
('Sambar','protein','icmr',46,2.5,7,1.2,2.2,1,30,null),
('Peanut Butter','fats','usda',588,25,20,50,6,1.9,49,null),
('Almonds','fats','usda',579,21.2,21.6,49.9,12.5,3.7,264,1.2),
('Ghee','fats','icmr',900,0,0,99.5,0,0,0,null);

-- Daily logs
create table public.daily_logs (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid references public.children(id) on delete cascade not null,
  log_date date not null default current_date,
  total_calories   numeric(8,2) default 0,
  total_protein_g  numeric(8,2) default 0,
  total_carbs_g    numeric(8,2) default 0,
  total_fat_g      numeric(8,2) default 0,
  total_fiber_g    numeric(8,2) default 0,
  total_iron_mg    numeric(8,2) default 0,
  total_calcium_mg numeric(8,2) default 0,
  overall_status   text default 'green' check (overall_status in ('green','yellow','orange','red')),
  unique(child_id, log_date)
);

-- Meals
create table public.meals (
  id uuid primary key default uuid_generate_v4(),
  daily_log_id uuid references public.daily_logs(id) on delete cascade not null,
  meal_type text not null check (meal_type in ('breakfast','snack','lunch','dinner')),
  logged_at timestamptz default now(),
  unique(daily_log_id, meal_type)
);

-- Meal items
create table public.meal_items (
  id uuid primary key default uuid_generate_v4(),
  meal_id uuid references public.meals(id) on delete cascade not null,
  food_id uuid references public.foods(id) not null,
  quantity_g       numeric(8,2) not null,
  quantity_display numeric(8,2),
  unit_display     text default 'g',
  calories_kcal    numeric(8,2) default 0,
  protein_g        numeric(8,2) default 0,
  carbs_g          numeric(8,2) default 0,
  fat_g            numeric(8,2) default 0,
  fiber_g          numeric(8,2) default 0,
  iron_mg          numeric(8,2) default 0,
  calcium_mg       numeric(8,2) default 0,
  logged_at timestamptz default now()
);

-- Alerts
create table public.alerts (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid references public.children(id) on delete cascade not null,
  log_date date not null default current_date,
  nutrient text not null,
  severity text not null check (severity in ('yellow','orange','red')),
  actual_value  numeric(8,2),
  target_value  numeric(8,2),
  pct_of_target numeric(5,1),
  suggestion    text,
  resolved_at   timestamptz,
  created_at    timestamptz default now()
);

-- Increment daily totals RPC
create or replace function increment_daily_totals(
  p_daily_log_id uuid, p_calories numeric, p_protein numeric,
  p_carbs numeric, p_fat numeric, p_fiber numeric,
  p_iron numeric, p_calcium numeric
) returns void as $$
begin
  update public.daily_logs set
    total_calories   = total_calories   + p_calories,
    total_protein_g  = total_protein_g  + p_protein,
    total_carbs_g    = total_carbs_g    + p_carbs,
    total_fat_g      = total_fat_g      + p_fat,
    total_fiber_g    = total_fiber_g    + p_fiber,
    total_iron_mg    = total_iron_mg    + p_iron,
    total_calcium_mg = total_calcium_mg + p_calcium
  where id = p_daily_log_id;
end;
$$ language plpgsql security definer;

-- RLS
alter table public.profiles     enable row level security;
alter table public.children     enable row level security;
alter table public.daily_logs   enable row level security;
alter table public.meals        enable row level security;
alter table public.meal_items   enable row level security;
alter table public.alerts       enable row level security;
alter table public.foods        enable row level security;
alter table public.nutrient_targets enable row level security;

create policy "own_profile"     on public.profiles     for all using (auth.uid() = id);
create policy "own_children"    on public.children     for all using (auth.uid() = user_id);
create policy "own_daily_logs"  on public.daily_logs   for all using (child_id in (select id from public.children where user_id = auth.uid()));
create policy "own_meals"       on public.meals        for all using (daily_log_id in (select dl.id from public.daily_logs dl join public.children c on c.id = dl.child_id where c.user_id = auth.uid()));
create policy "own_meal_items"  on public.meal_items   for all using (meal_id in (select m.id from public.meals m join public.daily_logs dl on dl.id = m.daily_log_id join public.children c on c.id = dl.child_id where c.user_id = auth.uid()));
create policy "own_alerts"      on public.alerts       for all using (child_id in (select id from public.children where user_id = auth.uid()));
create policy "foods_read"      on public.foods        for select using (auth.role() = 'authenticated');
create policy "targets_read"    on public.nutrient_targets for select using (auth.role() = 'authenticated');
