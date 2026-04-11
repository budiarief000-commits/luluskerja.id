import { supabase } from '../../../lib/supabase';
import bcrypt from 'bcryptjs';

export const POST = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ status: 'error', message: 'Email dan password dibutuhkan.' }), { status: 400 });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return new Response(JSON.stringify({ status: 'error', message: 'Email atau password salah.' }), { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return new Response(JSON.stringify({ status: 'error', message: 'Email atau password salah.' }), { status: 401 });
    }

    // Set cookie for session holding
    cookies.set('user_id', user.id, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    delete user.password_hash;
    return new Response(JSON.stringify({ status: 'success', user }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ status: 'error', message: error.message }), { status: 500 });
  }
};
