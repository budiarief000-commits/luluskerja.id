import { supabase } from '../../../lib/supabase';
import bcrypt from 'bcryptjs';

export const POST = async ({ request }) => {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return new Response(JSON.stringify({ status: 'error', message: 'Data tidak lengkap.' }), { status: 400 });
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return new Response(JSON.stringify({ status: 'error', message: 'Email sudah terdaftar.' }), { status: 400 });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('users')
      .insert([{ name, email, password_hash }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ status: 'success', message: 'Pendaftaran berhasil. Silakan login.' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ status: 'error', message: error.message }), { status: 500 });
  }
};
