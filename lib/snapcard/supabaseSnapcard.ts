import { supabase } from '@/lib/supabaseClient';
import { SnapcardQuestion, SnapcardAnswer } from '@/components/games/snapcard/SnapcardQuestions';

// Create a new Snapcard
export async function createSnapcard(owner_wallet_address: string, questions: SnapcardQuestion[]) {
  const link_token = crypto.randomUUID();
  const { data, error } = await supabase
    .from('snapcards')
    .insert([
      {
        owner_wallet_address,
        link_token,
        questions,
        is_active: true,
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Submit a Snapcard response (now with responder_name)
export async function submitSnapcardResponse(snapcard_id: string, responder_wallet_address: string, answers: SnapcardAnswer[], responder_name: string) {
  const { data, error } = await supabase
    .from('snapcard_responses')
    .insert([
      {
        snapcard_id,
        responder_wallet_address,
        responder_name,
        answers,
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Get a Snapcard by link_token
export async function getSnapcardByToken(link_token: string) {
  const { data, error } = await supabase
    .from('snapcards')
    .select('*')
    .eq('link_token', link_token)
    .single();
  if (error) throw error;
  return data;
}

// Get Snapcards created by a user
export async function getUserSnapcards(owner_wallet_address: string) {
  const { data, error } = await supabase
    .from('snapcards')
    .select('*')
    .eq('owner_wallet_address', owner_wallet_address)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// Get Snapcard requests for a user (Snapcards they have been asked to fill)
export async function getSnapRequests(responder_wallet_address: string) {
  const { data, error } = await supabase
    .from('snapcard_responses')
    .select('*, snapcards(*)')
    .eq('responder_wallet_address', responder_wallet_address)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// Get all responses for a Snapcard (for owner to view)
export async function getSnapcardResponses(snapcard_id: string) {
  const { data, error } = await supabase
    .from('snapcard_responses')
    .select('id, responder_name, answers, created_at')
    .eq('snapcard_id', snapcard_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// Send a Snapcard request to a friend
export async function sendSnapcardRequest(snapcard_id: string, recipient_wallet_address?: string, recipient_username?: string) {
  const { data, error } = await supabase
    .from('snapcard_requests')
    .insert([
      {
        snapcard_id,
        recipient_wallet_address,
        recipient_username,
        status: 'pending',
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Fetch Snapcard requests for the current user (by wallet address or username)
export async function getDirectSnapRequests({ wallet_address, username }: { wallet_address?: string, username?: string }) {
  let query = supabase
    .from('snapcard_requests')
    .select('*, snapcards(*)')
    .eq('status', 'pending');
  if (wallet_address) query = query.or(`recipient_wallet_address.eq.${wallet_address}`);
  if (username) query = query.or(`recipient_username.eq.${username}`);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// Fetch user profile by wallet address
export async function getProfileByWallet(wallet_address: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('wallet_address', wallet_address)
    .single();
  if (error) throw error;
  return data;
}

// Look up a user by username and return their username and wallet_address
export async function getUserByUsername(username: string) {
  const { data, error } = await supabase
    .from('users')
    .select('username, wallet_address')
    .eq('username', username)
    .single();
  if (error || !data) {
    return null;
  }
  return data;
} 