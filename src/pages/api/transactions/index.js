import { supabase } from '../../../lib/supabase';

export const POST = async ({ request, cookies }) => {
  try {
    const userIdCookie = cookies.get('user_id');
    if (!userIdCookie) return new Response(JSON.stringify({ status: 'error', message: 'Unauthorized' }), { status: 401 });
    const user_id = userIdCookie.value;

    const data = await request.json();
    
    // validasi data req
    if (!data.plan_name || !data.amount) {
      return new Response(JSON.stringify({ status: 'error', message: 'Incomplete transaction data' }), { status: 400 });
    }

    const { error } = await supabase
      .from('transactions')
      .insert([{
        user_id,
        plan_name: data.plan_name,
        amount: data.amount,
        status: data.status || 'success'
      }]);

    if (error) throw error;
    
    return new Response(JSON.stringify({ status: 'success' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ status: 'error', message: error.message }), { status: 500 });
  }
}
