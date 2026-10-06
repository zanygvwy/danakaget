export async function onRequestGet({ env }) {
  // Ambil data link dari KV
  const data = await env.DANA_KV.get('current_link', { type: 'json' });
  return new Response(JSON.stringify(data || { link: '', date: '', note: 'Belum ada link hari ini' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost({ request, env }) {
  try {
    const authHeader = request.headers.get('Authorization');
    // Verifikasi Secret Token Admin dari Environment Variable
    if (!authHeader || authHeader !== `Bearer ${env.ADMIN_SECRET}`) {
      return new Response(JSON.stringify({ error: 'Akses ditolak: Password salah' }), { status: 401 });
    }

    const body = await request.json();
    const { link, note } = body;

    if (!link || !link.startsWith('http')) {
      return new Response(JSON.stringify({ error: 'Format link tidak valid' }), { status: 400 });
    }

    const payload = {
      link: link.trim(),
      note: note || 'Dana Kaget Hari Ini',
      updatedAt: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
    };

    // Simpan ke KV
    await env.DANA_KV.put('current_link', JSON.stringify(payload));

    return new Response(JSON.stringify({ success: true, data: payload }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
