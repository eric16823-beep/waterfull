export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'POST' && url.pathname === '/upload') {
      try {
        const formData = await request.formData();
        const png = await createWatermarkedPng(formData);
        return new Response(png, {
          headers: {
            'Content-Type': 'image/png',
            'Content-Disposition': 'attachment; filename="watermarked.png"'
          }
        });
      } catch (error) {
        return new Response(error.message || 'Processing error', { status: 400 });
      }
    }
    return env.ASSETS.fetch(request);
  }
};