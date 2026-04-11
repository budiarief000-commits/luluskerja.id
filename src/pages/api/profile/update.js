import { supabase } from '../../../lib/supabase';
import bcrypt from 'bcryptjs';

export const POST = async ({ request, cookies }) => {
  try {
    const userIdCookie = cookies.get('user_id');
    if (!userIdCookie) {
      return new Response(JSON.stringify({ status: 'error', message: 'Unauthorized' }), { status: 401 });
    }
    const userId = userIdCookie.value;

    const { name, email, oldPassword, newPassword } = await request.json();

    if (!name || !email) {
      return new Response(JSON.stringify({ status: 'error', message: 'Data tidak lengkap.' }), { status: 400 });
    }

    const updates = { name, email, updated_at: new Date().toISOString() };

    if (newPassword) {
      const password_hash = await bcrypt.hash(newPassword, 10);
      updates.password_hash = password_hash;
    }

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ status: 'success', message: 'Profil berhasil diperbarui.' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ status: 'error', message: error.message }), { status: 500 });
  }
};
