import { createServer } from 'vite';

export async function testConnection() {
  const server = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'silent',
  });

  try {
    const { supabase } = await server.ssrLoadModule('./src/lib/supabase.js');

    // Attempt a request to verify communication with the Supabase project
    const { error } = await supabase.from('activities').select('id').limit(1);

    if (error) {
      const errStr = `${error.message || ''} ${error.details || ''}`;
      const isNetworkError =
        errStr.includes('fetch failed') ||
        errStr.includes('ENOTFOUND') ||
        errStr.includes('ECONNREFUSED');

      if (isNetworkError) {
        return {
          connected: false,
          authorized: false,
          details: 'Network error: Unable to resolve host or reach Supabase server.',
        };
      }

      const isPermissionDenied =
        error.code === '42501' || errStr.toLowerCase().includes('permission denied');

      return {
        connected: true,
        authorized: false,
        details: isPermissionDenied
          ? `Connected to Supabase. Query unauthorized for anonymous key: ${error.message || 'Permission denied by RLS/table grants'}`
          : `Connected to Supabase. Query returned error: ${error.message || error.code}`,
      };
    }

    return {
      connected: true,
      authorized: true,
      details: 'Connected to Supabase and activities query authorized successfully.',
    };
  } catch (err) {
    const msg = err.message || String(err);
    const isNetworkError =
      msg.includes('fetch failed') ||
      msg.includes('ENOTFOUND') ||
      msg.includes('ECONNREFUSED');

    return {
      connected: !isNetworkError,
      authorized: false,
      details: isNetworkError
        ? 'Network error: Unable to resolve host or reach Supabase server.'
        : `Unexpected error during communication: ${msg}`,
    };
  } finally {
    await server.close();
  }
}

const result = await testConnection();
console.log(`Supabase Host Connectivity: ${result.connected ? 'SUCCESS' : 'FAILED'}`);
console.log(`Activities Table Query Authorization: ${result.authorized ? 'AUTHORIZED' : 'DENIED / UNAUTHORIZED'}`);
console.log(`Details: ${result.details}`);
