import { supabase } from '../../../lib/supabase';

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  points: number;
  concept: string;
  source: 'manual_adjustment' | 'purchase' | 'reward_redemption' | 'birthday_bonus' | 'other';
  createdAt: string;
}

export interface LoyaltySummary {
  pointsBalance: number;
  transactions: LoyaltyTransaction[];
}

function mapSupabaseToTransaction(data: any): LoyaltyTransaction {
  return {
    id: data.id,
    customerId: data.customer_id,
    points: data.points,
    concept: data.concept,
    source: data.source,
    createdAt: data.created_at,
  };
}

/**
 * Get loyalty transactions for a specific customer
 */
export async function getLoyaltyHistory(customerId: string): Promise<LoyaltyTransaction[]> {
  const { data, error } = await supabase
    .from('loyalty_transactions')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching loyalty history:', error);
    throw error;
  }

  return (data || []).map(mapSupabaseToTransaction);
}

/**
 * Get current points balance for a customer
 * (It fetches from user_profiles for performance, relying on the DB trigger)
 */
export async function getCustomerPointsBalance(customerId: string): Promise<number> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('points_balance')
    .eq('id', customerId)
    .single();

  if (error) {
    console.error('Error fetching points balance:', error);
    // Fallback: calculate from transactions if column missing or error
    const history = await getLoyaltyHistory(customerId);
    return history.reduce((sum, t) => sum + t.points, 0);
  }

  return data?.points_balance || 0;
}

/**
 * Add a loyalty transaction (adjust points)
 */
export async function addLoyaltyTransaction(
  customerId: string,
  points: number,
  concept: string,
  source: LoyaltyTransaction['source'] = 'manual_adjustment'
): Promise<LoyaltyTransaction> {
  const { data, error } = await supabase
    .from('loyalty_transactions')
    .insert({
      customer_id: customerId,
      points,
      concept,
      source,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding loyalty transaction:', error);
    throw error;
  }

  return mapSupabaseToTransaction(data);
}
