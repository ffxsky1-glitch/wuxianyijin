import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 数据库操作函数
export async function insertCitiesData(cities: any[]) {
  const { data, error } = await supabase
    .from('cities')
    .upsert(cities, { onConflict: 'id' })
    .select();

  if (error) throw error;
  return data;
}

export async function insertSalariesData(salaries: any[]) {
  const { data, error } = await supabase
    .from('salaries')
    .upsert(salaries, { onConflict: 'id' })
    .select();

  if (error) throw error;
  return data;
}

export async function getSalariesData() {
  const { data, error } = await supabase
    .from('salaries')
    .select('*')
    .order('id');

  if (error) throw error;
  return data;
}

export async function getCityStandard(year: string, cityName: string = '佛山') {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('year', year)
    .eq('city_name', cityName)
    .single();

  if (error) throw error;
  return data;
}

export async function saveCalculationResults(results: any[]) {
  const { data, error } = await supabase
    .from('results')
    .insert(results)
    .select();

  if (error) throw error;
  return data;
}

export async function getCalculationResults() {
  const { data, error } = await supabase
    .from('results')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}