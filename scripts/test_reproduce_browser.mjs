import { spawn } from 'node:child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9222;

async function runTest() {
  console.log('Starting headless Chrome...');
  const chromeProcess = spawn(CHROME_PATH, [
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--user-data-dir=' + process.env.TEMP + '\\chrome_test_profile_' + Date.now(),
  ], {
    detached: false,
    stdio: 'ignore',
  });

  try {
    // Wait for Chrome CDP endpoint to be ready
    let versionData = null;
    for (let i = 0; i < 30; i++) {
      try {
        const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
        if (res.ok) {
          versionData = await res.json();
          break;
        }
      } catch {
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    if (!versionData) {
      throw new Error('Could not connect to Chrome debugging port.');
    }
    console.log('Connected to Chrome:', versionData.Browser);

    // Create a new target page
    const newTargetRes = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/new?http://localhost:5173/login`, {
      method: 'PUT',
    });
    const target = await newTargetRes.json();
    console.log('Created page target:', target.webSocketDebuggerUrl);

    // Connect via native WebSocket
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve) => ws.onopen = resolve);

    let id = 1;
    const callbacks = new Map();
    const consoleLogs = [];

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map((a) => a.value ?? a.description ?? JSON.stringify(a)).join(' ');
        consoleLogs.push(`[Console ${msg.params.type}] ${text}`);
      } else if (msg.method === 'Runtime.exceptionThrown') {
        consoleLogs.push(`[Console Exception] ${msg.params.exceptionDetails.text} ${msg.params.exceptionDetails.exception?.description || ''}`);
      }
      if (msg.id && callbacks.has(msg.id)) {
        callbacks.get(msg.id)(msg);
        callbacks.delete(msg.id);
      }
    };

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const msgId = id++;
        callbacks.set(msgId, resolve);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    await send('Runtime.enable');
    await send('Page.enable');
    await send('DOM.enable');

    console.log('Navigating to http://localhost:5173/login...');
    await send('Page.navigate', { url: 'http://localhost:5173/login' });
    await new Promise((r) => setTimeout(r, 2000));

    // Seed local user if needed or check current state
    console.log('Injecting student demo user session into localStorage...');
    await send('Runtime.evaluate', {
      expression: `
        localStorage.setItem('campuslive_user', JSON.stringify({
          id: 'demo-student',
          name: 'Nisarg Patel',
          email: 'nisarg@campus.edu',
          role: 'student',
          department: 'Computer Science',
          course: 'B.Tech CSE',
          studentId: 'STU-2026-001'
        }));
        window.location.href = '/student/dashboard';
      `,
    });

    await new Promise((r) => setTimeout(r, 2000));

    // Get current URL
    let evalRes = await send('Runtime.evaluate', { expression: 'window.location.pathname' });
    console.log('Current pathname:', evalRes.result?.value);

    // Navigate to /student/notifications
    console.log('Navigating to /student/notifications...');
    await send('Runtime.evaluate', {
      expression: `window.location.href = '/student/notifications';`,
    });
    await new Promise((r) => setTimeout(r, 2000));

    evalRes = await send('Runtime.evaluate', { expression: 'window.location.pathname' });
    console.log('Current pathname on Notifications:', evalRes.result?.value);

    // Let's inspect sidebar links
    const sidebarLinksRes = await send('Runtime.evaluate', {
      expression: `
        Array.from(document.querySelectorAll('aside a')).map(a => ({
          href: a.getAttribute('href'),
          text: a.innerText.trim(),
          rect: a.getBoundingClientRect(),
          pointerEvents: window.getComputedStyle(a).pointerEvents
        }))
      `,
      returnByValue: true,
    });
    console.log('Found sidebar links:', sidebarLinksRes.result?.value);

    // Find the Clubs link in the sidebar
    console.log('Clicking the Clubs link in the sidebar...');
    const clickRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const links = Array.from(document.querySelectorAll('aside a'));
          const clubsLink = links.find(a => a.getAttribute('href') === '/student/clubs' || a.innerText.includes('Clubs'));
          if (!clubsLink) return { found: false };
          clubsLink.click();
          return { found: true, href: clubsLink.getAttribute('href') };
        })()
      `,
      returnByValue: true,
    });
    console.log('Click result:', clickRes.result?.value);

    await new Promise((r) => setTimeout(r, 1000));

    evalRes = await send('Runtime.evaluate', { expression: 'window.location.pathname' });
    console.log('Current pathname AFTER clicking Clubs:', evalRes.result?.value);

    // Try another link: Dashboard
    console.log('Clicking the Dashboard link in the sidebar...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const links = Array.from(document.querySelectorAll('aside a'));
          const dashLink = links.find(a => a.getAttribute('href') === '/student/dashboard' || a.innerText.includes('Dashboard'));
          if (dashLink) dashLink.click();
        })()
      `,
    });
    await new Promise((r) => setTimeout(r, 1000));

    evalRes = await send('Runtime.evaluate', { expression: 'window.location.pathname' });
    console.log('Current pathname AFTER clicking Dashboard:', evalRes.result?.value);

    // Try navigating via React Router push if any or clicking directly
    console.log('Recent Console Logs from Browser:');
    for (const log of consoleLogs) {
      console.log('  ', log);
    }

    ws.close();
  } finally {
    chromeProcess.kill();
  }
}

runTest().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
