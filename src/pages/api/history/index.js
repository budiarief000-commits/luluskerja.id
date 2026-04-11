import { supabase } from '../../../lib/supabase';

export const GET = async ({ cookies }) => {
  try {
    const userIdCookie = cookies.get('user_id');
    if (!userIdCookie) return new Response(JSON.stringify({ status: 'error', message: 'Unauthorized' }), { status: 401 });
    
    const { data: history, error } = await supabase
      .from('learning_sessions')
      .select('*')
      .eq('user_id', userIdCookie.value)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return new Response(JSON.stringify({ status: 'success', history }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ status: 'error', message: error.message }), { status: 500 });
  }
}

export const POST = async ({ request, cookies }) => {
  try {
    const userIdCookie = cookies.get('user_id');
    if (!userIdCookie) return new Response(JSON.stringify({ status: 'error', message: 'Unauthorized' }), { status: 401 });
    const user_id = userIdCookie.value;

    const data = await request.json();
    
    if (data.action === 'update_score') {
      const { data: updated, error } = await supabase
        .from('learning_sessions')
        .update({ score: data.score, content: data.content })
        .eq('user_id', user_id)
        .eq('session_id', data.sessionId);

      if (error) throw error;
      return new Response(JSON.stringify({ status: 'success' }), { status: 200 });
    } else {
      const { error } = await supabase
        .from('learning_sessions')
        .insert([{
          user_id,
          session_id: data.sessionId,
          type: data.type,
          score: data.score,
          title: data.title,
          detail: data.detail,
          content: data.content
        }]);

      if (error) throw error;
      return new Response(JSON.stringify({ status: 'success' }), { status: 200 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ status: 'error', message: error.message }), { status: 500 });
  }
}
